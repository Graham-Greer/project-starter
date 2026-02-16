import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";

function normalizePathFromSlug(slugOrPath) {
  if (!slugOrPath) return "/";
  const raw = String(slugOrPath).trim();
  if (!raw) return "/";
  const withoutHash = raw.split("#")[0];
  const withoutQuery = withoutHash.split("?")[0];
  const withLeadingSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  if (withLeadingSlash === "/") return "/";
  return withLeadingSlash.replace(/\/+$/, "");
}

export function buildPublishedSiteTag(siteId) {
  return `cms:site:${siteId}:published`;
}

export function buildPublishedPageTag(siteId, pageId) {
  return `cms:site:${siteId}:page:${pageId}:published`;
}

export function buildPublishedPathTag(siteId, slugOrPath) {
  const normalizedPath = normalizePathFromSlug(slugOrPath);
  return `cms:site:${siteId}:path:${encodeURIComponent(normalizedPath)}`;
}

export function buildPublishedSiteSlugTag(siteSlug) {
  const normalizedSlug = String(siteSlug || "").trim().toLowerCase();
  return `cms:site-slug:${normalizedSlug}:published`;
}

export function buildPublishInvalidationTargets({ siteId, siteSlug = "", pageId, pages = [] }) {
  const tagSet = new Set([buildPublishedSiteTag(siteId)]);
  const pathSet = new Set(["/", `/cms/preview/${siteId}/${pageId}`]);
  const normalizedSiteSlug = String(siteSlug || "").trim().toLowerCase();

  if (normalizedSiteSlug) {
    tagSet.add(buildPublishedSiteSlugTag(normalizedSiteSlug));
    pathSet.add(`/live/${normalizedSiteSlug}`);
  }

  if (pageId) {
    tagSet.add(buildPublishedPageTag(siteId, pageId));
  }

  pages.forEach((page) => {
    if (!page) return;
    if (page.pageId) {
      tagSet.add(buildPublishedPageTag(siteId, page.pageId));
    }

    const normalizedPath = normalizePathFromSlug(page.path || page.slug || "");
    pathSet.add(normalizedPath);
    if (normalizedSiteSlug) {
      pathSet.add(normalizedPath === "/" ? `/live/${normalizedSiteSlug}` : `/live/${normalizedSiteSlug}${normalizedPath}`);
    }
    tagSet.add(buildPublishedPathTag(siteId, normalizedPath));
  });

  return {
    tags: Array.from(tagSet),
    paths: Array.from(pathSet),
  };
}

export function invalidatePublishCaches(args) {
  const targets = buildPublishInvalidationTargets(args);
  targets.tags.forEach((tag) => revalidateTag(tag));
  targets.paths.forEach((path) => revalidatePath(path));
  return targets;
}
