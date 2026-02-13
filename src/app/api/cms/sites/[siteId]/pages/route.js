import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth";
import { createSecureCmsDataServices } from "@/lib/data";

function toSlug(value = "") {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function validatePagePayload(payload) {
  if (!payload || typeof payload !== "object") return "Invalid JSON payload";
  if (!payload.title || typeof payload.title !== "string") return "title is required";
  return null;
}

function buildPagePath(slug, parentPath = "") {
  if (!parentPath) return `/${slug}`;
  return `${parentPath}/${slug}`.replace(/\/+/g, "/");
}

async function getUniquePageId(cms, siteId, baseSlug) {
  let candidate = baseSlug;
  let counter = 2;
  while (true) {
    // Existing records may use slug as id. Keep compatibility while allowing duplicates via suffix.
    // This avoids collisions when nested structures reuse similar names.
    const existing = await cms.pages.getPage(siteId, candidate);
    if (!existing) return candidate;
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
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
    },
    status: page.status,
    hasUnpublishedChanges: Boolean(page?.hasUnpublishedChanges),
    draftVersion: page.draftVersion,
    updatedAt: page.updatedAt,
    updatedBy: page.updatedBy,
  };
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function buildPageTree(pages = []) {
  const byParent = new Map();
  pages.forEach((page) => {
    const parentId = page.parentPageId || null;
    if (!byParent.has(parentId)) byParent.set(parentId, []);
    byParent.get(parentId).push(page);
  });

  const sortPages = (list) =>
    [...list].sort((a, b) => {
      const orderA = typeof a.order === "number" ? a.order : 0;
      const orderB = typeof b.order === "number" ? b.order : 0;
      if (orderA !== orderB) return orderA - orderB;
      return (a.title || "").localeCompare(b.title || "");
    });

  const makeNode = (page) => ({
    page,
    children: sortPages(byParent.get(page.id) || []).map(makeNode),
  });

  return sortPages(byParent.get(null) || []).map(makeNode);
}

function flattenPageTree(nodes = [], depth = 0) {
  return nodes.flatMap((node) => {
    const current = [{ page: node.page, depth }];
    if (!node.children.length) return current;
    return current.concat(flattenPageTree(node.children, depth + 1));
  });
}

export async function GET(request, { params }) {
  try {
    const { siteId } = await params;
    const url = new URL(request.url);
    const requestedPage = parsePositiveInt(url.searchParams.get("page"), 1);
    const requestedPageSize = parsePositiveInt(url.searchParams.get("pageSize"), 20);
    const pageSize = Math.min(requestedPageSize, 100);

    const cms = createSecureCmsDataServices();
    const pages = await cms.pages.listSitePages(siteId);
    const normalizedPages = pages.map(toPageResponse);
    const flattenedRows = flattenPageTree(buildPageTree(normalizedPages));
    const totalItems = flattenedRows.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const page = Math.min(requestedPage, totalPages);
    const start = (page - 1) * pageSize;
    const pagedRows = flattenedRows.slice(start, start + pageSize);

    return NextResponse.json({
      ok: true,
      siteId,
      pages: normalizedPages,
      rows: pagedRows.map((row) => ({ page: row.page, depth: row.depth })),
      pagination: {
        page,
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

    return NextResponse.json({ ok: false, error: "Failed to list pages for site" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { siteId } = await params;
    const payload = await request.json();
    const validationError = validatePagePayload(payload);
    if (validationError) {
      return NextResponse.json({ ok: false, error: validationError }, { status: 400 });
    }

    const cms = createSecureCmsDataServices();
    const site = await cms.sites.getSiteById(siteId);
    if (!site) {
      return NextResponse.json({ ok: false, error: `Site "${siteId}" not found.` }, { status: 404 });
    }

    const slug = toSlug(payload.slug || payload.title);
    if (!slug) {
      return NextResponse.json({ ok: false, error: "A valid slug could not be generated from title/slug." }, { status: 400 });
    }

    const parentPageId = typeof payload.parentPageId === "string" && payload.parentPageId.trim()
      ? payload.parentPageId.trim()
      : null;

    let parentPage = null;
    if (parentPageId) {
      parentPage = await cms.pages.getPage(siteId, parentPageId);
      if (!parentPage) {
        return NextResponse.json({ ok: false, error: `Parent page "${parentPageId}" was not found.` }, { status: 400 });
      }
    }

    const allPages = await cms.pages.listSitePages(siteId);
    const siblingPages = allPages.filter((page) => (page.parentPageId || null) === parentPageId);
    const duplicateSiblingSlug = siblingPages.some((page) => page.slug === slug);
    if (duplicateSiblingSlug) {
      return NextResponse.json(
        { ok: false, error: `A sibling page with slug "${slug}" already exists under this parent.` },
        { status: 409 }
      );
    }

    const pageId = await getUniquePageId(cms, siteId, slug);
    const now = new Date().toISOString();
    const pagePayload = {
      workspaceId: site.workspaceId,
      siteId,
      slug,
      path: buildPagePath(slug, parentPage?.path || ""),
      parentPageId,
      order: siblingPages.length,
      title: payload.title.trim(),
      status: "draft",
      blocks: [],
      seo: payload.seo || {
        metaTitle: payload.title.trim(),
        metaDescription: "",
        ogImageUrl: "",
      },
      draftVersion: 1,
      hasUnpublishedChanges: true,
      updatedAt: now,
      updatedBy: "system",
    };

    await cms.pages.saveDraftPage(siteId, pageId, pagePayload);
    const createdPage = await cms.pages.getPage(siteId, pageId);

    return NextResponse.json({ ok: true, page: toPageResponse(createdPage) }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }

    return NextResponse.json({ ok: false, error: "Failed to create page" }, { status: 500 });
  }
}
