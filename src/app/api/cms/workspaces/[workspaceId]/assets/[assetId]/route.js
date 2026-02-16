import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError, getRequestUser } from "@/lib/auth";
import { safeWriteCmsAuditLog } from "@/lib/cms/audit-log";
import { collectWorkspaceAssetUsages } from "@/lib/cms/media-references";
import { deleteMediaFileFromStorage, resolveMediaAssetUrl } from "@/lib/cms/media-assets";
import { createSecureCmsDataServices } from "@/lib/data";

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

export async function PATCH(request, { params }) {
  try {
    const { workspaceId, assetId } = await params;
    const payload = await request.json();
    const alt = typeof payload?.alt === "string" ? payload.alt.trim() : "";
    const cms = createSecureCmsDataServices();
    const user = await getRequestUser({ required: true });
    const asset = await cms.assets.getAssetById(assetId);
    if (!asset || asset.workspaceId !== workspaceId) {
      return NextResponse.json({ ok: false, error: `Asset "${assetId}" not found.` }, { status: 404 });
    }

    if (asset.contentType?.startsWith("image/") && !alt) {
      return NextResponse.json(
        { ok: false, error: "Image alt text is required for accessibility and SEO." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    await cms.assets.updateAsset(assetId, {
      alt,
      updatedAt: now,
      updatedBy: user.uid,
    });
    const updated = await cms.assets.getAssetById(assetId);
    const updatedSite = updated?.siteId ? await cms.sites.getSiteById(updated.siteId) : null;

    await safeWriteCmsAuditLog({
      cms,
      workspaceId,
      actorUserId: user.uid,
      action: "media.updated",
      entityType: "asset",
      entityId: assetId,
      siteId: updated?.siteId || "",
      summary: `Updated media "${updated?.filename || assetId}"`,
      metadata: {
        updatedField: "alt",
      },
      createdAt: now,
    });

    return NextResponse.json({
      ok: true,
      asset: toMediaAssetResponse(updated, { siteSlug: updatedSite?.slug || "" }),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to update media asset." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { workspaceId, assetId } = await params;
    const cms = createSecureCmsDataServices();
    const user = await getRequestUser({ required: true });
    const asset = await cms.assets.getAssetById(assetId);
    if (!asset || asset.workspaceId !== workspaceId) {
      return NextResponse.json({ ok: false, error: `Asset "${assetId}" not found.` }, { status: 404 });
    }

    const usages = await collectWorkspaceAssetUsages({
      cms,
      workspaceId,
      targetAssetId: assetId,
    });
    if (usages.length > 0) {
      const usageSummary = usages
        .slice(0, 5)
        .map((usage) => {
          const siteText = usage.siteId ? `site "${usage.siteId}"` : "site";
          const pageText = usage.pageId ? `, page "${usage.pageId}"` : "";
          return `${usage.detail} (${siteText}${pageText})`;
        })
        .join(" | ");
      return NextResponse.json(
        {
          ok: false,
          error: `This media is currently in use and cannot be deleted yet. ${usageSummary}${usages.length > 5 ? " | ..." : ""}`,
          usageCount: usages.length,
        },
        { status: 409 }
      );
    }

    await deleteMediaFileFromStorage(asset.storagePath || "");
    await cms.assets.deleteAsset(assetId);
    const now = new Date().toISOString();

    await safeWriteCmsAuditLog({
      cms,
      workspaceId,
      actorUserId: user.uid,
      action: "media.deleted",
      entityType: "asset",
      entityId: assetId,
      siteId: asset.siteId || "",
      summary: `Deleted media "${asset.filename || assetId}"`,
      metadata: {
        contentType: asset.contentType || "",
      },
      createdAt: now,
    });

    return NextResponse.json({ ok: true, deletedAssetId: assetId });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to delete media asset." }, { status: 500 });
  }
}
