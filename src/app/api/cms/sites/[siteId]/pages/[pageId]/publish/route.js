import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError, getRequestUser } from "@/lib/auth";
import { createSecureCmsDataServices } from "@/lib/data";
import { runPrePublishChecks } from "@/lib/publish/run-prepublish-checks";

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
    publishedVersionId: page.publishedVersionId || "",
    publishedSnapshotId: page.publishedSnapshotId || "",
    publishedAt: page.publishedAt || null,
    publishedBy: page.publishedBy || null,
    draftVersion: page.draftVersion,
    updatedAt: page.updatedAt,
    updatedBy: page.updatedBy,
  };
}

function buildPageVersionId(pageId, nowIso) {
  return `ver_${pageId}_${Date.parse(nowIso)}`;
}

function buildSiteSnapshotId(nowIso) {
  return `snap_${Date.parse(nowIso)}`;
}

export async function POST(_request, { params }) {
  try {
    const { siteId, pageId } = await params;
    const cms = createSecureCmsDataServices();
    const user = await getRequestUser({ required: true });
    const now = new Date().toISOString();

    const prePublish = await runPrePublishChecks({ cms, siteId, pageId });
    if (!prePublish.ok) {
      return NextResponse.json({ ok: false, error: prePublish.error }, { status: prePublish.statusCode || 400 });
    }
    if (!prePublish.valid) {
      return NextResponse.json(
        { ok: false, error: "Pre-publish checks failed.", valid: false, checks: prePublish.checks },
        { status: 400 }
      );
    }

    const page = prePublish.page;
    const site = await cms.sites.getSiteById(siteId);
    if (!site) {
      return NextResponse.json({ ok: false, error: `Site "${siteId}" not found.` }, { status: 404 });
    }

    const versionId = buildPageVersionId(pageId, now);
    const pageSnapshot = JSON.parse(JSON.stringify({ ...page, id: pageId }));
    await cms.snapshots.createPageVersion(siteId, versionId, {
      workspaceId: page.workspaceId,
      siteId,
      pageId,
      version: page.draftVersion || 1,
      sourceDraftVersion: page.draftVersion || 1,
      snapshot: pageSnapshot,
      publishedAt: now,
      publishedBy: user.uid,
    });

    const allPages = await cms.pages.listSitePages(siteId);
    const publishedEntries = allPages
      .filter((item) => item.status === "published" && item.publishedVersionId)
      .map((item) => ({
        pageId: item.id,
        slug: item.slug || "",
        versionId: item.publishedVersionId,
      }))
      .filter((entry) => entry.pageId !== pageId);
    publishedEntries.push({
      pageId,
      slug: page.slug || "",
      versionId,
    });

    const siteSnapshotId = buildSiteSnapshotId(now);
    await cms.snapshots.createSiteSnapshot(siteId, siteSnapshotId, {
      workspaceId: site.workspaceId,
      siteId,
      templateId: site.templateId || "base-template-v1",
      theme: site.theme || {},
      pages: publishedEntries,
      publishedAt: now,
      publishedBy: user.uid,
    });

    await cms.sites.updateSite(siteId, {
      publishedSnapshotId: siteSnapshotId,
      publishedAt: now,
      publishedBy: user.uid,
      hasUnpublishedChanges: false,
      updatedAt: now,
      updatedBy: user.uid,
    });

    await cms.pages.savePage(siteId, pageId, {
      ...page,
      status: "published",
      hasUnpublishedChanges: false,
      publishedVersionId: versionId,
      publishedSnapshotId: siteSnapshotId,
      publishedAt: now,
      publishedBy: user.uid,
      updatedAt: now,
      updatedBy: user.uid,
      draftVersion: (page.draftVersion || 1) + 1,
    });

    const refreshedPage = await cms.pages.getPage(siteId, pageId);
    return NextResponse.json({
      ok: true,
      page: toPageResponse(refreshedPage),
      publish: {
        versionId,
        siteSnapshotId,
        publishedAt: now,
        publishedBy: user.uid,
      },
      checks: prePublish.checks,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to publish page." }, { status: 500 });
  }
}
