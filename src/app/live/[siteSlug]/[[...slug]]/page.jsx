import { notFound } from "next/navigation";
import { renderSectionBlock } from "@/lib/registry";
import LiveRuntimeHeader from "@/components/cms/LiveRuntimeHeader/LiveRuntimeHeader";
import { normalizePublicPath, resolvePublishedPageByPath } from "@/lib/cms/live-runtime";
import styles from "./live-page.module.css";

export const dynamicParams = true;

export async function generateMetadata({ params }) {
  const { siteSlug, slug = [] } = await params;
  const path = normalizePublicPath(slug);
  const resolved = await resolvePublishedPageByPath({ siteSlug, path });

  if (!resolved?.page) {
    return {
      title: "Page not found",
    };
  }

  const page = resolved.page;
  const seo = page.seo || {};
  const title = seo.metaTitle || page.title || "Live page";
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
}

export default async function LiveSitePage({ params }) {
  const { siteSlug, slug = [] } = await params;
  const path = normalizePublicPath(slug);
  const resolved = await resolvePublishedPageByPath({ siteSlug, path });
  if (!resolved?.page) notFound();

  const blocks = Array.isArray(resolved.page.blocks) ? resolved.page.blocks : [];
  if (!blocks.length) notFound();

  const siteRootHref = `/live/${resolved.site.slug}`;

  return (
    <div className={styles.root}>
      <LiveRuntimeHeader
        siteName={resolved.site.name}
        siteRootHref={siteRootHref}
        headerConfig={resolved.header}
        navigationItems={resolved.navigationItems}
      />
      <main>{blocks.map((block) => renderSectionBlock(block, { key: block.id }))}</main>
    </div>
  );
}
