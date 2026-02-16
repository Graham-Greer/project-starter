import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { ForbiddenError, UnauthorizedError, getRequestUser } from "@/lib/auth";
import { safeWriteCmsAuditLog } from "@/lib/cms/audit-log";
import { buildPublishedSiteSlugTag, buildPublishedSiteTag } from "@/lib/cms/publish-cache";
import {
  normalizeHeaderConfig,
  normalizeHeaderPresetsConfig,
  resolveSiteRuntimeConfig,
  validateHeaderConfig,
  validateHeaderPresetsConfig,
  validateNavigationConfig,
} from "@/lib/cms/site-config";
import { createSecureCmsDataServices } from "@/lib/data";

const ALLOWED_RUNTIME_MODES = new Set(["static", "cms-live"]);

function toSiteResponse(site) {
  if (!site) return null;
  const runtimeConfig = resolveSiteRuntimeConfig(site);
  return {
    id: site.id,
    workspaceId: site.workspaceId,
    name: site.name,
    slug: site.slug,
    status: site.status,
    runtimeMode: site.runtimeMode || "static",
    header: runtimeConfig.header,
    headers: runtimeConfig.headers,
    activeHeaderId: runtimeConfig.activeHeaderId,
    navigation: runtimeConfig.navigation,
    templateId: site.templateId,
    updatedAt: site.updatedAt,
    createdAt: site.createdAt,
  };
}

function validatePatchPayload(payload, existingSite) {
  if (!payload || typeof payload !== "object") return { error: "Invalid JSON payload." };
  const updatePayload = {};
  const existingRuntimeConfig = resolveSiteRuntimeConfig(existingSite || {});
  let nextHeaders = existingRuntimeConfig.headers;
  let nextActiveHeaderId = existingRuntimeConfig.activeHeaderId;

  if (typeof payload.runtimeMode !== "undefined") {
    if (typeof payload.runtimeMode !== "string" || !ALLOWED_RUNTIME_MODES.has(payload.runtimeMode)) {
      return { error: 'runtimeMode must be one of: "static", "cms-live".' };
    }
    updatePayload.runtimeMode = payload.runtimeMode;
  }

  if (typeof payload.header !== "undefined") {
    const headerValidation = validateHeaderConfig(payload.header);
    if (!headerValidation.valid) return { error: headerValidation.error };
    updatePayload.header = headerValidation.value;
    nextHeaders = nextHeaders.map((preset) =>
      preset.id === nextActiveHeaderId
        ? { ...preset, config: normalizeHeaderConfig(headerValidation.value) }
        : preset
    );
    updatePayload.headers = nextHeaders;
    updatePayload.activeHeaderId = nextActiveHeaderId;
  }

  if (typeof payload.headers !== "undefined") {
    const headersValidation = validateHeaderPresetsConfig(payload.headers);
    if (!headersValidation.valid) return { error: headersValidation.error };
    nextHeaders = normalizeHeaderPresetsConfig(headersValidation.value, existingRuntimeConfig.header);
    updatePayload.headers = nextHeaders;
    if (!nextHeaders.some((preset) => preset.id === nextActiveHeaderId)) {
      nextActiveHeaderId = nextHeaders[0].id;
      updatePayload.activeHeaderId = nextActiveHeaderId;
    }
    const activeConfig = nextHeaders.find((preset) => preset.id === nextActiveHeaderId)?.config || nextHeaders[0].config;
    updatePayload.header = normalizeHeaderConfig(activeConfig);
  }

  if (typeof payload.activeHeaderId !== "undefined") {
    if (typeof payload.activeHeaderId !== "string" || !payload.activeHeaderId.trim()) {
      return { error: "activeHeaderId must be a non-empty string." };
    }
    const requestedId = payload.activeHeaderId.trim();
    const hasMatch = nextHeaders.some((preset) => preset.id === requestedId);
    if (!hasMatch) {
      return { error: `activeHeaderId "${requestedId}" does not match any header preset.` };
    }
    nextActiveHeaderId = requestedId;
    updatePayload.activeHeaderId = nextActiveHeaderId;
    const activeConfig = nextHeaders.find((preset) => preset.id === nextActiveHeaderId)?.config || existingRuntimeConfig.header;
    updatePayload.header = normalizeHeaderConfig(activeConfig);
  }

  if (typeof payload.navigation !== "undefined") {
    const navigationValidation = validateNavigationConfig(payload.navigation);
    if (!navigationValidation.valid) return { error: navigationValidation.error };
    updatePayload.navigation = navigationValidation.value;
  }

  if (Object.keys(updatePayload).length === 0) {
    return { error: "No supported update fields provided." };
  }

  return { updatePayload };
}

export async function GET(_request, { params }) {
  try {
    const { siteId } = await params;
    const cms = createSecureCmsDataServices();
    const site = await cms.sites.getSiteById(siteId);
    if (!site) {
      return NextResponse.json({ ok: false, error: `Site "${siteId}" not found.` }, { status: 404 });
    }
    return NextResponse.json({ ok: true, site: toSiteResponse(site) });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to load site." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { siteId } = await params;
    const cms = createSecureCmsDataServices();
    const existing = await cms.sites.getSiteById(siteId);
    if (!existing) {
      return NextResponse.json({ ok: false, error: `Site "${siteId}" not found.` }, { status: 404 });
    }

    const payload = await request.json();
    const user = await getRequestUser({ required: true });
    const validation = validatePatchPayload(payload, existing);
    if (validation.error) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
    }

    const now = new Date().toISOString();
    await cms.sites.updateSite(siteId, {
      ...validation.updatePayload,
      updatedAt: now,
      updatedBy: user.uid,
    });

    const updated = await cms.sites.getSiteById(siteId);
    await safeWriteCmsAuditLog({
      cms,
      workspaceId: existing.workspaceId,
      actorUserId: user.uid,
      action: "site.updated",
      entityType: "site",
      entityId: siteId,
      siteId,
      summary: `Updated site "${updated?.name || existing.name || siteId}" settings`,
      metadata: {
        fields: Object.keys(validation.updatePayload),
        runtimeMode: updated?.runtimeMode || existing.runtimeMode || "static",
      },
      createdAt: now,
    });
    if (updated?.id) {
      revalidateTag(buildPublishedSiteTag(updated.id));
    }
    if (updated?.slug) {
      revalidateTag(buildPublishedSiteSlugTag(updated.slug));
      revalidatePath(`/live/${updated.slug}`);
    }
    return NextResponse.json({ ok: true, site: toSiteResponse(updated) });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to update site." }, { status: 500 });
  }
}
