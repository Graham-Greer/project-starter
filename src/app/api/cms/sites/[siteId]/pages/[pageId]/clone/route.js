import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError, getRequestUser } from "@/lib/auth";
import { safeWriteCmsAuditLog } from "@/lib/cms/audit-log";
import { createSecureCmsDataServices } from "@/lib/data";

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

async function getUniquePageId(cms, siteId, baseSlug) {
  let candidate = baseSlug;
  let counter = 2;
  while (true) {
    const existing = await cms.pages.getPage(siteId, candidate);
    if (!existing) return candidate;
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

function getUniqueSiblingSlug(pages, parentPageId, baseSlug) {
  const siblingSlugs = new Set(
    pages
      .filter((page) => (page.parentPageId || null) === (parentPageId || null))
      .map((page) => page.slug)
  );
  if (!siblingSlugs.has(baseSlug)) return baseSlug;

  let counter = 2;
  let candidate = `${baseSlug}-${counter}`;
  while (siblingSlugs.has(candidate)) {
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
  return candidate;
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

export async function POST(_request, { params }) {
  try {
    const { siteId, pageId } = await params;
    const cms = createSecureCmsDataServices();

    const sourcePage = await cms.pages.getPage(siteId, pageId);
    if (!sourcePage) {
      return NextResponse.json({ ok: false, error: `Page "${pageId}" not found.` }, { status: 404 });
    }

    const allPages = await cms.pages.listSitePages(siteId);
    const parentPath = sourcePage.parentPageId
      ? allPages.find((page) => page.id === sourcePage.parentPageId)?.path || ""
      : "";
    const siblingCount = allPages.filter((page) => (page.parentPageId || null) === (sourcePage.parentPageId || null)).length;

    const titleCopy = `${sourcePage.title} Copy`.trim();
    const slugBase = toSlug(`${sourcePage.slug || sourcePage.title}-copy`);
    if (!slugBase) {
      return NextResponse.json({ ok: false, error: "A valid clone slug could not be generated." }, { status: 400 });
    }

    const slug = getUniqueSiblingSlug(allPages, sourcePage.parentPageId || null, slugBase);
    const clonedPageId = await getUniquePageId(cms, siteId, slug);
    const now = new Date().toISOString();
    const user = await getRequestUser({ required: true });
    const { id: _sourceId, ...sourceWithoutId } = sourcePage;

    await cms.pages.saveDraftPage(siteId, clonedPageId, {
      ...sourceWithoutId,
      siteId,
      workspaceId: sourcePage.workspaceId,
      title: titleCopy,
      slug,
      path: buildPagePath(slug, parentPath),
      parentPageId: sourcePage.parentPageId || null,
      order: siblingCount,
      status: "draft",
      blocks: Array.isArray(sourcePage.blocks) ? JSON.parse(JSON.stringify(sourcePage.blocks)) : [],
      seo: sourcePage.seo || {
        metaTitle: titleCopy,
        metaDescription: "",
        ogImageUrl: "",
        ogImageAssetId: "",
      },
      draftVersion: 1,
      hasUnpublishedChanges: true,
      updatedAt: now,
      updatedBy: user.uid,
    });

    const clonedPage = await cms.pages.getPage(siteId, clonedPageId);
    await safeWriteCmsAuditLog({
      cms,
      workspaceId: sourcePage.workspaceId,
      actorUserId: user.uid,
      action: "page.cloned",
      entityType: "page",
      entityId: clonedPageId,
      siteId,
      pageId: clonedPageId,
      summary: `Cloned page "${sourcePage.title || pageId}"`,
      metadata: {
        sourcePageId: pageId,
        sourceSlug: sourcePage.slug || "",
        cloneSlug: slug,
      },
      createdAt: now,
    });
    return NextResponse.json({ ok: true, page: toPageResponse(clonedPage) }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to clone page." }, { status: 500 });
  }
}
