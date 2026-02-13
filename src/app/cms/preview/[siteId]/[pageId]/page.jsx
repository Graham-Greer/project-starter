import { createSecureCmsDataServices } from "@/lib/data";
import { renderSectionBlock } from "@/lib/registry";
import styles from "./preview-page.module.css";

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

export default async function CmsPreviewPage({ params }) {
  const { siteId, pageId } = await params;
  let page = null;
  let loadError = null;

  try {
    const cms = createSecureCmsDataServices();
    page = await cms.pages.getPage(siteId, pageId);
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

  return (
    <main className={styles.root}>
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
    </main>
  );
}
