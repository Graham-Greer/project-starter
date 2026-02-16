import "server-only";

function addAssetRef(refs, assetId, source, detail) {
  const normalizedId = typeof assetId === "string" ? assetId.trim() : "";
  if (!normalizedId) return;
  refs.push({
    assetId: normalizedId,
    source,
    detail,
  });
}

function collectAssetIdsFromValue(value, refs, source, path = "props") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectAssetIdsFromValue(item, refs, source, `${path}[${index}]`));
    return;
  }

  if (!value || typeof value !== "object") return;

  Object.entries(value).forEach(([key, child]) => {
    if ((key === "assetId" || key.endsWith("AssetId")) && typeof child === "string") {
      addAssetRef(refs, child, source, path);
    }
    collectAssetIdsFromValue(child, refs, source, `${path}.${key}`);
  });
}

export function collectAssetReferences({ site, page, includeHeaderPresets = true }) {
  const refs = [];
  if (site?.header?.logo?.assetId) {
    addAssetRef(refs, site.header.logo.assetId, "site-header", "Active header logo");
  }

  if (includeHeaderPresets && Array.isArray(site?.headers)) {
    site.headers.forEach((preset) => {
      addAssetRef(
        refs,
        preset?.config?.logo?.assetId,
        "site-header-preset",
        `Header preset "${preset?.name || preset?.id || "unknown"}" logo`
      );
    });
  }

  if (page?.seo?.ogImageAssetId) {
    addAssetRef(refs, page.seo.ogImageAssetId, "page-seo", "Page OG image");
  }

  if (Array.isArray(page?.blocks)) {
    page.blocks.forEach((block, index) => {
      collectAssetIdsFromValue(
        block?.props || {},
        refs,
        "page-block",
        `Block ${index + 1} (${block?.sectionType || "section"}.${block?.variant || "variant"})`
      );
    });
  }

  return refs;
}

export async function collectWorkspaceAssetUsages({ cms, workspaceId, targetAssetId }) {
  const sites = await cms.sites.listWorkspaceSites(workspaceId);

  const usageBatches = await Promise.all(sites.map(async (site) => {
    const pages = await cms.pages.listSitePages(site.id);
    const siteUsageRows = [];
    const siteOnlyRefs = collectAssetReferences({ site, page: null, includeHeaderPresets: true });
    siteOnlyRefs
      .filter((ref) => ref.assetId === targetAssetId)
      .forEach((ref) => {
        siteUsageRows.push({
          siteId: site.id,
          pageId: "",
          source: ref.source,
          detail: ref.detail,
        });
      });

    pages.forEach((page) => {
      const refs = collectAssetReferences({ site, page, includeHeaderPresets: false });
      refs
        .filter((ref) => ref.assetId === targetAssetId)
        .forEach((ref) => {
          siteUsageRows.push({
            siteId: site.id,
            pageId: page.id,
            source: ref.source,
            detail: ref.detail,
          });
        });
    });
    return siteUsageRows;
  }));

  return usageBatches.flat();
}
