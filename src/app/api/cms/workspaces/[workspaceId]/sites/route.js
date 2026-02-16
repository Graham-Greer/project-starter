import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError, getRequestUser } from "@/lib/auth";
import { safeWriteCmsAuditLog } from "@/lib/cms/audit-log";
import {
  getDefaultHeaderConfig,
  getDefaultHeaderPreset,
  getDefaultNavigationConfig,
  resolveSiteRuntimeConfig,
} from "@/lib/cms/site-config";
import { createSecureCmsDataServices } from "@/lib/data";

function toSlug(value = "") {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function validateSitePayload(payload) {
  if (!payload || typeof payload !== "object") return "Invalid JSON payload";
  if (!payload.name || typeof payload.name !== "string") return "name is required";
  return null;
}

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

export async function GET(_request, { params }) {
  try {
    const { workspaceId } = await params;
    const cms = createSecureCmsDataServices();
    const sites = await cms.sites.listWorkspaceSites(workspaceId);

    return NextResponse.json({
      ok: true,
      workspaceId,
      sites: sites.map(toSiteResponse),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to list workspace sites" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { workspaceId } = await params;
    const payload = await request.json();
    const validationError = validateSitePayload(payload);
    if (validationError) {
      return NextResponse.json({ ok: false, error: validationError }, { status: 400 });
    }

    const slug = toSlug(payload.slug || payload.name);
    if (!slug) {
      return NextResponse.json({ ok: false, error: "A valid slug could not be generated from name/slug." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const user = await getRequestUser({ required: true });
    const siteId = `${workspaceId}__${slug}`;
    const sitePayload = {
      workspaceId,
      name: payload.name.trim(),
      slug,
      status: "draft",
      runtimeMode: "static",
      header: getDefaultHeaderConfig(),
      headers: [getDefaultHeaderPreset()],
      activeHeaderId: "header-default",
      navigation: getDefaultNavigationConfig(),
      templateId: payload.templateId || "base-template-v1",
      themeId: payload.themeId || "default-light-dark",
      createdAt: now,
      updatedAt: now,
    };

    const cms = createSecureCmsDataServices();
    const existing = await cms.sites.getSiteById(siteId).catch(() => null);
    if (existing) {
      return NextResponse.json({ ok: false, error: `Site slug "${slug}" already exists in this workspace.` }, { status: 409 });
    }

    await cms.sites.createSite(siteId, sitePayload);
    const created = await cms.sites.getSiteById(siteId);
    await safeWriteCmsAuditLog({
      cms,
      workspaceId,
      actorUserId: user.uid,
      action: "site.created",
      entityType: "site",
      entityId: siteId,
      siteId,
      summary: `Created site "${sitePayload.name}"`,
      metadata: {
        slug: sitePayload.slug,
        runtimeMode: sitePayload.runtimeMode,
      },
      createdAt: now,
    });

    return NextResponse.json({ ok: true, site: toSiteResponse(created) }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to create site" }, { status: 500 });
  }
}
