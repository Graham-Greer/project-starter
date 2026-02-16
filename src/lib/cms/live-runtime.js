import "server-only";

import { unstable_cache } from "next/cache";
import { resolveSiteRuntimeConfig } from "@/lib/cms/site-config";
import { createDataServices } from "@/lib/data";
import {
  buildPublishedPathTag,
  buildPublishedSiteSlugTag,
  buildPublishedSiteTag,
} from "./publish-cache";

function normalizePathFromSlug(value) {
  if (!value) return "/";
  if (Array.isArray(value)) {
    if (!value.length) return "/";
    return normalizePathFromSlug(value.join("/"));
  }

  const raw = String(value).trim();
  if (!raw) return "/";
  const noHash = raw.split("#")[0];
  const noQuery = noHash.split("?")[0];
  const withLeadingSlash = noQuery.startsWith("/") ? noQuery : `/${noQuery}`;
  if (withLeadingSlash === "/") return "/";
  return withLeadingSlash.replace(/\/+$/, "");
}

function resolveSnapshotEntryByPath(snapshotPages, requestedPath) {
  const normalizedTarget = normalizePathFromSlug(requestedPath);
  const pages = Array.isArray(snapshotPages) ? snapshotPages : [];
  return pages.find((entry) => normalizePathFromSlug(entry?.slug || "") === normalizedTarget) || null;
}

function buildLivePageHref(siteSlug, entrySlug) {
  const normalizedSlug = String(siteSlug || "").trim().toLowerCase();
  const normalizedPath = normalizePathFromSlug(entrySlug || "");
  if (!normalizedSlug) return normalizedPath;
  if (normalizedPath === "/") return `/live/${normalizedSlug}`;
  return `/live/${normalizedSlug}${normalizedPath}`;
}

function resolveNavigationItemsForRuntime({ site, snapshot }) {
  const runtimeConfig = resolveSiteRuntimeConfig(site);
  const rawItems = runtimeConfig.navigation?.primary || [];
  const pages = Array.isArray(snapshot?.pages) ? snapshot.pages : [];

  const resolveItems = (items = []) => items.map((item, index) => {
    let href = "";
    if (item.type === "page" && item.pageId) {
      const pageEntry = pages.find((entry) => entry?.pageId === item.pageId);
      if (pageEntry) {
        href = buildLivePageHref(site.slug, pageEntry.slug || "");
      }
    } else if (item.type === "url") {
      href = item.href || "";
    }

    return {
      id: item.id || `nav-${index + 1}`,
      label: item.label || "",
      href,
      visible: item.visible !== false,
      openInNewTab: Boolean(item.openInNewTab),
      order: typeof item.order === "number" ? item.order : index,
      children: resolveItems(item.children || []),
    };
  }).sort((a, b) => a.order - b.order);

  return resolveItems(rawItems);
}

function pickMostRecentlyUpdatedSite(sites = []) {
  if (!sites.length) return null;
  return [...sites].sort((a, b) => {
    const aTime = Date.parse(a?.updatedAt || a?.createdAt || 0);
    const bTime = Date.parse(b?.updatedAt || b?.createdAt || 0);
    return bTime - aTime;
  })[0];
}

async function getPublishedSiteBySlug(siteSlug) {
  const cms = createDataServices();
  const matches = await cms.sites.listSitesBySlug(siteSlug);
  const site = pickMostRecentlyUpdatedSite(matches);
  if (!site) return null;
  if ((site.runtimeMode || "static") !== "cms-live") return null;
  if (!site.publishedSnapshotId) return null;
  return site;
}

export function normalizePublicPath(slugSegments) {
  return normalizePathFromSlug(slugSegments);
}

export async function resolvePublishedPageByPath({ siteSlug, path }) {
  const normalizedSiteSlug = String(siteSlug || "").trim().toLowerCase();
  if (!normalizedSiteSlug) return null;

  const normalizedPath = normalizePathFromSlug(path);
  const site = await unstable_cache(
    async () => getPublishedSiteBySlug(normalizedSiteSlug),
    ["cms-live-site-by-slug", normalizedSiteSlug],
    {
      revalidate: false,
      tags: [buildPublishedSiteSlugTag(normalizedSiteSlug)],
    }
  )();

  if (!site?.id || !site?.publishedSnapshotId) return null;

  return unstable_cache(
    async () => {
      const cms = createDataServices();
      const snapshot = await cms.snapshots.getSiteSnapshot(site.id, site.publishedSnapshotId);
      if (!snapshot) return null;

      const snapshotEntry = resolveSnapshotEntryByPath(snapshot.pages, normalizedPath);
      if (!snapshotEntry?.versionId || !snapshotEntry?.pageId) return null;

      const pageVersion = await cms.snapshots.getPageVersion(site.id, snapshotEntry.versionId);
      const pageSnapshot = pageVersion?.snapshot;
      if (!pageSnapshot || typeof pageSnapshot !== "object") return null;
      const runtimeConfig = resolveSiteRuntimeConfig(site);
      const navigationItems = resolveNavigationItemsForRuntime({ site, snapshot });
      const pageHeaderMode = pageSnapshot?.headerMode === "override" ? "override" : "inherit";
      const pageHeaderPresetId = typeof pageSnapshot?.headerPresetId === "string" ? pageSnapshot.headerPresetId.trim() : "";
      const overrideHeader = pageHeaderMode === "override"
        ? (runtimeConfig.headers || []).find((preset) => preset.id === pageHeaderPresetId)?.config || null
        : null;
      const resolvedHeader = overrideHeader || runtimeConfig.header;

      return {
        site,
        snapshot: {
          id: site.publishedSnapshotId,
          ...snapshot,
        },
        pageEntry: snapshotEntry,
        pageVersion: {
          id: snapshotEntry.versionId,
          ...pageVersion,
        },
        page: {
          ...pageSnapshot,
          id: pageSnapshot.id || snapshotEntry.pageId,
          path: pageSnapshot.path || normalizePathFromSlug(snapshotEntry.slug || ""),
        },
        header: resolvedHeader,
        navigationItems,
      };
    },
    ["cms-live-page-resolve", site.id, site.publishedSnapshotId, normalizedPath],
    {
      revalidate: false,
      tags: [
        buildPublishedSiteTag(site.id),
        buildPublishedPathTag(site.id, normalizedPath),
      ],
    }
  )();
}
