import LiveRuntimeHeader from "@/components/cms/LiveRuntimeHeader/LiveRuntimeHeader";
import { resolveSiteRuntimeConfig } from "@/lib/cms/site-config";
import { createSecureCmsDataServices } from "@/lib/data";
import { renderSectionBlock } from "@/lib/registry";
import styles from "./preview-page.module.css";

function resolvePreviewNavigationItems({ siteId, pages, navigation, themeQuery }) {
  const pageIdToHref = new Map(
    (Array.isArray(pages) ? pages : []).map((page) => [page.id, `/cms/preview/${siteId}/${page.id}${themeQuery}`])
  );

  const resolveItems = (items = []) =>
    (Array.isArray(items) ? items : [])
      .map((item, index) => {
        let href = "";
        if (item?.type === "page" && item?.pageId) {
          href = pageIdToHref.get(item.pageId) || "";
        } else if (item?.type === "url") {
          href = item?.href || "";
        }

        return {
          id: item?.id || `preview-nav-${index + 1}`,
          label: item?.label || "",
          href,
          visible: item?.visible !== false,
          openInNewTab: Boolean(item?.openInNewTab),
          order: typeof item?.order === "number" ? item.order : index,
          children: resolveItems(item?.children || []),
        };
      })
      .sort((a, b) => a.order - b.order);

  return resolveItems(navigation?.primary || []);
}

export async function generateMetadata({ params }) {
  const { siteId, pageId } = await params;
  try {
    const cms = createSecureCmsDataServices();
    const page = await cms.pages.getPage(siteId, pageId);
    if (!page) {
      return {
        title: "Preview unavailable",
      };
    }

    const seo = page.seo || {};
    const title = seo.metaTitle || page.title || "Preview";
    const description = seo.metaDescription || "";
    const ogImageUrl = seo.ogImageUrl || "";
    const openGraphImages = ogImageUrl ? [{ url: ogImageUrl }] : undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: openGraphImages,
      },
      twitter: {
        card: ogImageUrl ? "summary_large_image" : "summary",
        title,
        description,
        images: openGraphImages,
      },
    };
  } catch (_error) {
    return {
      title: "Preview unavailable",
    };
  }
}

export default async function CmsPreviewPage({ params, searchParams }) {
  const { siteId, pageId } = await params;
  const resolvedSearchParams = await searchParams;
  const previewTheme = resolvedSearchParams?.theme === "dark" ? "dark" : "light";
  const themeQuery = `?theme=${previewTheme}`;
  let page = null;
  let site = null;
  let pages = [];
  let loadError = null;

  try {
    const cms = createSecureCmsDataServices();
    const [nextPage, nextSite, nextPages] = await Promise.all([
      cms.pages.getPage(siteId, pageId),
      cms.sites.getSiteById(siteId),
      cms.pages.listSitePages(siteId),
    ]);
    page = nextPage;
    site = nextSite;
    pages = nextPages;
  } catch (error) {
    loadError = error;
  }

  if (loadError) {
    return (
      <main className={styles.empty}>
        <div className={styles.statusCard}>
          <h1 className={styles.title}>Preview unavailable</h1>
          <p className={styles.text}>{loadError?.message || "Unable to render preview for this page."}</p>
        </div>
      </main>
    );
  }

  if (!page) {
    return (
      <main className={styles.empty}>
        <div className={styles.statusCard}>
          <h1 className={styles.title}>Preview unavailable</h1>
          <p className={styles.text}>The selected page could not be found.</p>
        </div>
      </main>
    );
  }

  const blocks = Array.isArray(page.blocks) ? page.blocks : [];
  const runtimeConfig = resolveSiteRuntimeConfig(site || {});
  const pageHeaderMode = page?.headerMode === "override" ? "override" : "inherit";
  const pageHeaderPresetId = typeof page?.headerPresetId === "string" ? page.headerPresetId : "";
  const overrideHeader = pageHeaderMode === "override"
    ? (runtimeConfig.headers || []).find((preset) => preset.id === pageHeaderPresetId)?.config || null
    : null;
  const resolvedHeader = overrideHeader || runtimeConfig.header;
  const navigationItems = resolvePreviewNavigationItems({
    siteId,
    pages,
    navigation: runtimeConfig.navigation,
    themeQuery,
  });
  const fallbackRootHref = `/cms/preview/${siteId}/${pageId}${themeQuery}`;
  const rootPage = pages.find((candidate) => candidate?.path === "/");
  const siteRootHref = rootPage?.id ? `/cms/preview/${siteId}/${rootPage.id}${themeQuery}` : fallbackRootHref;

  return (
    <main className={styles.root}>
      <LiveRuntimeHeader
        siteName={site?.name || "Site"}
        siteRootHref={siteRootHref}
        headerConfig={resolvedHeader}
        navigationItems={navigationItems}
      />
      <div className={styles.content}>
        {blocks.length === 0 ? (
          <section className={styles.empty}>
            <div className={styles.statusCard}>
              <h1 className={styles.title}>No blocks to preview</h1>
              <p className={styles.text}>Add blocks in the composer and save to render this page preview.</p>
            </div>
          </section>
        ) : (
          blocks.map((block) => renderSectionBlock(block, { key: block.id }))
        )}
      </div>
    </main>
  );
}
