import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError, getRequestUser } from "@/lib/auth";
import { safeWriteCmsAuditLog } from "@/lib/cms/audit-log";
import { resolveMediaAssetUrl } from "@/lib/cms/media-assets";
import { resolveSiteRuntimeConfig } from "@/lib/cms/site-config";
import { createSecureCmsDataServices } from "@/lib/data";
import { validateImageUrlReachable, validateSeoPayload } from "@/lib/validation/seo";

function toSlug(value = "") {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function buildPagePath(slug, parentPath = "") {
  if (!parentPath) return `/${slug}`;
  return `${parentPath}/${slug}`.replace(/\/+/g, "/");
}

function buildChildrenMap(pages = []) {
  const map = new Map();
  pages.forEach((page) => {
    const parentId = page.parentPageId || null;
    if (!map.has(parentId)) map.set(parentId, []);
    map.get(parentId).push(page);
  });
  return map;
}

function collectDescendantIds(pageId, childrenMap, acc = new Set()) {
  const children = childrenMap.get(pageId) || [];
  children.forEach((child) => {
    if (acc.has(child.id)) return;
    acc.add(child.id);
    collectDescendantIds(child.id, childrenMap, acc);
  });
  return acc;
}

function buildSubtreePathUpdates(rootPageId, pagesById, childrenMap, parentPath) {
  const updates = [];

  function walk(currentPageId, currentParentPath) {
    const page = pagesById.get(currentPageId);
    if (!page) return;

    const nextPath = buildPagePath(page.slug, currentParentPath);
    updates.push({
      id: page.id,
      path: nextPath,
    });

    const children = childrenMap.get(currentPageId) || [];
    children.forEach((child) => walk(child.id, nextPath));
  }

  walk(rootPageId, parentPath);
  return updates;
}

function toPageResponse(page) {
  if (!page) return null;
  return {
    id: page.id,
    siteId: page.siteId,
    workspaceId: page.workspaceId,
    slug: page.slug,
    path: page.path || `/${page.slug || page.id}`,
    parentPageId: page.parentPageId || null,
    order: typeof page.order === "number" ? page.order : 0,
    title: page.title,
    seo: {
      metaTitle: page?.seo?.metaTitle || page.title || "",
      metaDescription: page?.seo?.metaDescription || "",
      ogImageUrl: page?.seo?.ogImageUrl || "",
      ogImageAssetId: page?.seo?.ogImageAssetId || "",
    },
    headerMode: page?.headerMode === "override" ? "override" : "inherit",
    headerPresetId: typeof page?.headerPresetId === "string" ? page.headerPresetId : "",
    status: page.status,
    hasUnpublishedChanges: Boolean(page?.hasUnpublishedChanges),
    draftVersion: page.draftVersion,
    updatedAt: page.updatedAt,
    updatedBy: page.updatedBy,
  };
}

export async function PATCH(request, { params }) {
  try {
    const { siteId, pageId } = await params;
    const payload = await request.json();
    const nextParentPageId = typeof payload?.parentPageId === "string" && payload.parentPageId.trim()
      ? payload.parentPageId.trim()
      : null;

    const cms = createSecureCmsDataServices();
    const site = await cms.sites.getSiteById(siteId);
    if (!site) {
      return NextResponse.json({ ok: false, error: `Site "${siteId}" not found.` }, { status: 404 });
    }
    const runtimeConfig = resolveSiteRuntimeConfig(site);
    const siteHeaderIds = new Set((runtimeConfig.headers || []).map((preset) => preset.id));
    const targetPage = await cms.pages.getPage(siteId, pageId);
    if (!targetPage) {
      return NextResponse.json({ ok: false, error: `Page "${pageId}" not found.` }, { status: 404 });
    }
    const nextTitle = typeof payload?.title === "string" ? payload.title.trim() : targetPage.title;
    if (!nextTitle) {
      return NextResponse.json({ ok: false, error: "title is required" }, { status: 400 });
    }
    const nextSlug = toSlug(payload?.slug || nextTitle);
    if (!nextSlug) {
      return NextResponse.json({ ok: false, error: "A valid slug could not be generated from title/slug." }, { status: 400 });
    }
    const seoValidation = validateSeoPayload({
      metaTitle: typeof payload?.seo?.metaTitle === "string" ? payload.seo.metaTitle : (targetPage?.seo?.metaTitle || nextTitle),
      metaDescription: typeof payload?.seo?.metaDescription === "string" ? payload.seo.metaDescription : (targetPage?.seo?.metaDescription || ""),
      ogImageUrl: typeof payload?.seo?.ogImageUrl === "string" ? payload.seo.ogImageUrl : (targetPage?.seo?.ogImageUrl || ""),
      ogImageAssetId: typeof payload?.seo?.ogImageAssetId === "string" ? payload.seo.ogImageAssetId : (targetPage?.seo?.ogImageAssetId || ""),
    });
    if (!seoValidation.valid) {
      return NextResponse.json({ ok: false, error: seoValidation.error }, { status: 400 });
    }
    let nextOgImageUrl = seoValidation.seo.ogImageUrl;
    const nextOgImageAssetId = seoValidation.seo.ogImageAssetId || "";
    if (nextOgImageAssetId) {
      const asset = await cms.assets.getAssetById(nextOgImageAssetId);
      if (!asset || asset.workspaceId !== site.workspaceId || asset.siteId !== siteId) {
        return NextResponse.json({ ok: false, error: "Selected OG image media asset is missing or not available for this site." }, { status: 400 });
      }
      if (!String(asset.contentType || "").startsWith("image/")) {
        return NextResponse.json({ ok: false, error: "Selected OG image media asset must be an image." }, { status: 400 });
      }
      nextOgImageUrl = resolveMediaAssetUrl(asset, { siteSlug: site.slug || "" });
    }
    if (nextOgImageUrl && !nextOgImageAssetId) {
      const ogValidation = await validateImageUrlReachable(nextOgImageUrl);
      if (!ogValidation.valid) {
        return NextResponse.json({ ok: false, error: ogValidation.error }, { status: 400 });
      }
    }

    if (nextParentPageId === pageId) {
      return NextResponse.json({ ok: false, error: "A page cannot be its own parent." }, { status: 400 });
    }

    const pages = await cms.pages.listSitePages(siteId);
    const pagesById = new Map(pages.map((page) => [page.id, page]));
    const childrenMap = buildChildrenMap(pages);
    const descendantIds = collectDescendantIds(pageId, childrenMap);
    if (nextParentPageId && descendantIds.has(nextParentPageId)) {
      return NextResponse.json({ ok: false, error: "Cannot move a page under one of its descendants." }, { status: 400 });
    }

    let nextParent = null;
    if (nextParentPageId) {
      nextParent = pagesById.get(nextParentPageId) || null;
      if (!nextParent) {
        return NextResponse.json({ ok: false, error: `Parent page "${nextParentPageId}" not found.` }, { status: 400 });
      }
    }

    const duplicateSiblingSlug = pages.some(
      (page) =>
        page.id !== pageId &&
        page.slug === nextSlug &&
        (page.parentPageId || null) === (nextParentPageId || null)
    );
    if (duplicateSiblingSlug) {
      return NextResponse.json(
        { ok: false, error: `A sibling page with slug "${nextSlug}" already exists under this parent.` },
        { status: 409 }
      );
    }

    const nextHeaderMode = payload?.headerMode === "override" ? "override" : "inherit";
    const nextHeaderPresetId = typeof payload?.headerPresetId === "string" ? payload.headerPresetId.trim() : "";
    if (nextHeaderMode === "override") {
      if (!nextHeaderPresetId) {
        return NextResponse.json({ ok: false, error: "headerPresetId is required when headerMode is override." }, { status: 400 });
      }
      if (!siteHeaderIds.has(nextHeaderPresetId)) {
        return NextResponse.json({ ok: false, error: `headerPresetId "${nextHeaderPresetId}" is not valid for this site.` }, { status: 400 });
      }
    }

    const parentChanged = (targetPage.parentPageId || null) !== nextParentPageId;
    const siblings = pages.filter((page) => (page.parentPageId || null) === (nextParentPageId || null) && page.id !== pageId);
    const now = new Date().toISOString();
    const user = await getRequestUser({ required: true });

    await cms.pages.saveDraftPage(siteId, pageId, {
      ...targetPage,
      title: nextTitle,
      slug: nextSlug,
          seo: {
            metaTitle: seoValidation.seo.metaTitle,
            metaDescription: seoValidation.seo.metaDescription,
            ogImageUrl: nextOgImageUrl,
            ogImageAssetId: nextOgImageAssetId,
          },
      headerMode: nextHeaderMode,
      headerPresetId: nextHeaderMode === "override" ? nextHeaderPresetId : "",
      parentPageId: nextParentPageId,
      order: parentChanged ? siblings.length : (typeof targetPage.order === "number" ? targetPage.order : 0),
      updatedAt: now,
      updatedBy: user.uid,
      draftVersion: (targetPage.draftVersion || 1) + 1,
    });

    const updatedPages = await cms.pages.listSitePages(siteId);
    const updatedPagesById = new Map(updatedPages.map((page) => [page.id, page]));
    const updatedChildrenMap = buildChildrenMap(updatedPages);

    const subtreeUpdates = buildSubtreePathUpdates(pageId, updatedPagesById, updatedChildrenMap, nextParent?.path || "");

    for (const update of subtreeUpdates) {
      const page = updatedPagesById.get(update.id);
      if (!page || page.path === update.path) continue;
      await cms.pages.saveDraftPage(siteId, page.id, {
        ...page,
        path: update.path,
        updatedAt: now,
        updatedBy: user.uid,
        draftVersion: (page.draftVersion || 1) + 1,
      });
    }

    const refreshedPage = await cms.pages.getPage(siteId, pageId);
    await safeWriteCmsAuditLog({
      cms,
      workspaceId: site.workspaceId,
      actorUserId: user.uid,
      action: "page.updated",
      entityType: "page",
      entityId: pageId,
      siteId,
      pageId,
      summary: `Updated page "${nextTitle}"`,
      metadata: {
        slug: nextSlug,
        parentPageId: nextParentPageId || "",
        headerMode: nextHeaderMode,
      },
      createdAt: now,
    });
    return NextResponse.json({
      ok: true,
      page: toPageResponse(refreshedPage),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to update page." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { siteId, pageId } = await params;
    const cms = createSecureCmsDataServices();
    const user = await getRequestUser({ required: true });
    const now = new Date().toISOString();
    const targetPage = await cms.pages.getPage(siteId, pageId);
    if (!targetPage) {
      return NextResponse.json({ ok: false, error: `Page "${pageId}" not found.` }, { status: 404 });
    }

    const pages = await cms.pages.listSitePages(siteId);
    const childrenMap = buildChildrenMap(pages);
    const descendantIds = [...collectDescendantIds(pageId, childrenMap)];
    const pageIdsToDelete = [pageId, ...descendantIds];

    for (const id of pageIdsToDelete) {
      await cms.pages.deletePage(siteId, id);
    }
    await safeWriteCmsAuditLog({
      cms,
      workspaceId: targetPage.workspaceId,
      actorUserId: user.uid,
      action: "page.deleted",
      entityType: "page",
      entityId: pageId,
      siteId,
      pageId,
      summary: `Deleted page "${targetPage.title || pageId}"`,
      metadata: {
        deletedCount: pageIdsToDelete.length,
        deletedPageIds: pageIdsToDelete,
      },
      createdAt: now,
    });

    return NextResponse.json({
      ok: true,
      deletedPageIds: pageIdsToDelete,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to delete page." }, { status: 500 });
  }
}
