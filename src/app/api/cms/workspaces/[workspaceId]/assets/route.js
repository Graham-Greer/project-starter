import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError, getRequestUser } from "@/lib/auth";
import { safeWriteCmsAuditLog } from "@/lib/cms/audit-log";
import {
  buildMediaPublicUrl,
  buildMediaAssetRecord,
  resolveMediaAssetUrl,
  uploadMediaFileToStorage,
  validateMediaUpload,
} from "@/lib/cms/media-assets";
import { createSecureCmsDataServices } from "@/lib/data";

function buildAssetId() {
  const entropy = Math.random().toString(36).slice(2, 9);
  return `asset_${Date.now()}_${entropy}`;
}

function toMediaAssetResponse(asset, options = {}) {
  if (!asset) return null;
  const resolvedSiteSlug = String(options?.siteSlug || asset.siteSlug || "").trim();
  return {
    id: asset.id,
    workspaceId: asset.workspaceId,
    siteId: asset.siteId || "",
    siteSlug: resolvedSiteSlug,
    filename: asset.filename || "",
    contentType: asset.contentType || "",
    sizeBytes: Number(asset.sizeBytes) || 0,
    publicUrl: resolveMediaAssetUrl(asset, { siteSlug: resolvedSiteSlug }),
    alt: asset.alt || "",
    createdAt: asset.createdAt || "",
    updatedAt: asset.updatedAt || asset.createdAt || "",
  };
}

function normalizeSearch(value = "") {
  return String(value || "").trim().toLowerCase();
}

function hasReadRoleError(error) {
  return /workspace access/i.test(String(error?.message || ""));
}

export async function GET(request, { params }) {
  try {
    const { workspaceId } = await params;
    const { searchParams } = new URL(request.url);
    const siteId = String(searchParams.get("siteId") || "").trim();
    const search = normalizeSearch(searchParams.get("search") || "");
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("pageSize") || "24", 10)));

    const cms = createSecureCmsDataServices();
    const workspaceSites = await cms.sites.listWorkspaceSites(workspaceId);
    const siteSlugById = new Map(
      (Array.isArray(workspaceSites) ? workspaceSites : []).map((site) => [site.id, String(site.slug || "").trim()])
    );
    const rows = siteId
      ? await cms.assets.listSiteAssets(siteId)
      : await cms.assets.listWorkspaceAssets(workspaceId);

    const filteredRows = rows
      .filter((asset) => asset.workspaceId === workspaceId)
      .filter((asset) => (siteId ? asset.siteId === siteId : true))
      .filter((asset) => {
        if (!search) return true;
        const haystack = `${asset.filename || ""} ${asset.alt || ""}`.toLowerCase();
        return haystack.includes(search);
      })
      .sort((a, b) => Date.parse(b.updatedAt || b.createdAt || 0) - Date.parse(a.updatedAt || a.createdAt || 0));

    const totalItems = filteredRows.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    const rowsPage = filteredRows
      .slice(start, start + pageSize)
      .map((asset) => toMediaAssetResponse(asset, { siteSlug: siteSlugById.get(asset.siteId) || "" }));

    return NextResponse.json({
      ok: true,
      rows: rowsPage,
      pagination: {
        page: safePage,
        pageSize,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    if (hasReadRoleError(error)) {
      return NextResponse.json({ ok: false, error: "You do not have access to this workspace." }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to load media library." }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { workspaceId } = await params;
    const cms = createSecureCmsDataServices();
    const user = await getRequestUser({ required: true });
    const formData = await request.formData();
    const file = formData.get("file");
    const siteId = String(formData.get("siteId") || "").trim();
    const alt = String(formData.get("alt") || "").trim();

    if (!siteId) {
      return NextResponse.json({ ok: false, error: "Select a site before uploading media." }, { status: 400 });
    }
    if (!file || typeof file.arrayBuffer !== "function" || typeof file.name !== "string") {
      return NextResponse.json({ ok: false, error: "Choose a file to upload." }, { status: 400 });
    }

    const site = await cms.sites.getSiteById(siteId);
    if (!site || site.workspaceId !== workspaceId) {
      return NextResponse.json({ ok: false, error: "Selected site is not in this workspace." }, { status: 400 });
    }

    const contentType = String(file.type || "").toLowerCase();
    const sizeBytes = Number(file.size) || 0;
    const uploadValidation = validateMediaUpload({ contentType, sizeBytes });
    if (!uploadValidation.valid) {
      return NextResponse.json({ ok: false, error: uploadValidation.error }, { status: 400 });
    }

    if (contentType.startsWith("image/") && !alt) {
      return NextResponse.json(
        { ok: false, error: "Add alt text so screen readers and SEO previews can describe this image." },
        { status: 400 }
      );
    }

    const assetId = buildAssetId();
    const now = new Date().toISOString();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { storagePath, downloadToken } = await uploadMediaFileToStorage({
      workspaceId,
      siteId,
      assetId,
      filename: file.name || assetId,
      contentType,
      buffer,
    });

    const record = buildMediaAssetRecord({
      assetId,
      workspaceId,
      siteId,
      siteSlug: site.slug || "",
      filename: file.name || assetId,
      contentType,
      sizeBytes,
      storagePath,
      publicUrl: buildMediaPublicUrl({
        siteSlug: site.slug || "",
        assetId,
        filename: file.name || assetId,
        contentType,
      }),
      downloadToken,
      alt,
      uploadedBy: user.uid,
      createdAt: now,
    });
    await cms.assets.createAsset(assetId, record);

    await safeWriteCmsAuditLog({
      cms,
      workspaceId,
      actorUserId: user.uid,
      action: "media.uploaded",
      entityType: "asset",
      entityId: assetId,
      siteId,
      summary: `Uploaded media "${record.filename}"`,
      metadata: {
        contentType: record.contentType,
        sizeBytes: record.sizeBytes,
      },
      createdAt: now,
    });

    return NextResponse.json(
      {
        ok: true,
        asset: toMediaAssetResponse(record, { siteSlug: site.slug || "" }),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to upload media." }, { status: 500 });
  }
}
