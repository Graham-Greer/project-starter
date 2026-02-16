import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError, getRequestUser } from "@/lib/auth";
import { safeWriteCmsAuditLog } from "@/lib/cms/audit-log";
import { safeCreatePublishFailureAlert, safeResolvePublishAlertsForPage } from "@/lib/cms/publish-alerts";
import { invalidatePublishCaches } from "@/lib/cms/publish-cache";
import { assertCmsWorkspaceQuota, CmsQuotaExceededError } from "@/lib/cms/quota";
import { assertCmsRateLimit, CmsRateLimitError } from "@/lib/cms/rate-limit";
import { createSecureCmsDataServices } from "@/lib/data";
import { runPrePublishChecks } from "@/lib/publish/run-prepublish-checks";

function getPublishFailureReasonCode(error) {
  if (error instanceof CmsRateLimitError) return "rate_limit_exceeded";
  if (error instanceof CmsQuotaExceededError) return "quota_exceeded";
  if (error instanceof UnauthorizedError) return "unauthorized";
  if (error instanceof ForbiddenError) return "forbidden";
  return "publish_error";
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
    headerMode: page?.headerMode === "override" ? "override" : "inherit",
    headerPresetId: typeof page?.headerPresetId === "string" ? page.headerPresetId : "",
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

function buildPublishedEntries(allPages = [], excludedPageId = "") {
  return allPages
    .filter((item) => item.id !== excludedPageId && item.status === "published" && item.publishedVersionId)
    .map((item) => ({
      pageId: item.id,
      slug: item.slug || "",
      versionId: item.publishedVersionId,
    }));
}

export async function POST(_request, { params }) {
  let alertSiteId = "";
  let alertPageId = "";
  let alertWorkspaceId = "";
  let alertUserId = "";
  try {
    const { siteId, pageId } = await params;
    alertSiteId = siteId;
    alertPageId = pageId;
    const cms = createSecureCmsDataServices();
    const user = await getRequestUser({ required: true });
    alertUserId = user.uid;
    const now = new Date().toISOString();
    const site = await cms.sites.getSiteById(siteId);
    if (!site) {
      return NextResponse.json({ ok: false, error: `Site "${siteId}" not found.` }, { status: 404 });
    }
    alertWorkspaceId = site.workspaceId;

    await assertCmsRateLimit({
      workspaceId: site.workspaceId,
      userId: user.uid,
      action: "publish",
    });
    await assertCmsWorkspaceQuota({
      workspaceId: site.workspaceId,
      action: "publish",
    });

    const prePublish = await runPrePublishChecks({ cms, siteId, pageId });
    if (!prePublish.ok) {
      await safeCreatePublishFailureAlert({
        cms,
        workspaceId: site.workspaceId,
        siteId,
        pageId,
        operation: "publish",
        reasonCode: "prepublish_error",
        message: prePublish.error || "Pre-publish check failed.",
        actorUserId: user.uid,
        createdAt: now,
      });
      return NextResponse.json({ ok: false, error: prePublish.error }, { status: prePublish.statusCode || 400 });
    }
    if (!prePublish.valid) {
      await safeCreatePublishFailureAlert({
        cms,
        workspaceId: site.workspaceId,
        siteId,
        pageId,
        operation: "publish",
        reasonCode: "prepublish_invalid",
        message: "Pre-publish checks failed.",
        actorUserId: user.uid,
        metadata: {
          checks: prePublish.checks,
        },
        createdAt: now,
      });
      return NextResponse.json(
        { ok: false, error: "Pre-publish checks failed.", valid: false, checks: prePublish.checks },
        { status: 400 }
      );
    }

    const page = prePublish.page;

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
    const publishedEntries = buildPublishedEntries(allPages, pageId);
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

    let cacheInvalidation = null;
    try {
      cacheInvalidation = invalidatePublishCaches({
        siteId,
        siteSlug: site.slug || "",
        pageId,
        pages: publishedEntries.map((entry) => ({
          pageId: entry.pageId,
          slug: entry.slug,
        })),
      });
    } catch (_error) {
      cacheInvalidation = null;
    }

    const refreshedPage = await cms.pages.getPage(siteId, pageId);
    await safeResolvePublishAlertsForPage({
      cms,
      workspaceId: site.workspaceId,
      siteId,
      pageId,
      resolvedBy: user.uid,
      resolution: "Publish succeeded",
      resolvedAt: now,
    });
    await safeWriteCmsAuditLog({
      cms,
      workspaceId: site.workspaceId,
      actorUserId: user.uid,
      action: "page.published",
      entityType: "page",
      entityId: pageId,
      siteId,
      pageId,
      summary: `Published page "${page.title || pageId}"`,
      metadata: {
        versionId,
        siteSnapshotId,
        checksPassed: Array.isArray(prePublish.checks) ? prePublish.checks.length : 0,
      },
      createdAt: now,
    });
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
      cacheInvalidation: cacheInvalidation
        ? {
            tags: cacheInvalidation.tags.length,
            paths: cacheInvalidation.paths.length,
          }
        : null,
    });
  } catch (error) {
    if (alertWorkspaceId) {
      const cms = createSecureCmsDataServices();
      await safeCreatePublishFailureAlert({
        cms,
        workspaceId: alertWorkspaceId,
        siteId: alertSiteId,
        pageId: alertPageId,
        operation: "publish",
        reasonCode: getPublishFailureReasonCode(error),
        message: error?.message || "Failed to publish page.",
        actorUserId: alertUserId,
      });
    }
    if (error instanceof CmsQuotaExceededError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          code: "quota-exceeded",
          action: error.action,
          limit: error.limit,
          resetAt: error.resetAt,
        },
        { status: 429 }
      );
    }
    if (error instanceof CmsRateLimitError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          retryAfterSeconds: error.retryAfterSeconds,
          code: "rate-limit-exceeded",
        },
        {
          status: 429,
          headers: { "Retry-After": String(error.retryAfterSeconds) },
        }
      );
    }
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to publish page." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  let alertSiteId = "";
  let alertPageId = "";
  let alertWorkspaceId = "";
  let alertUserId = "";
  try {
    const { siteId, pageId } = await params;
    alertSiteId = siteId;
    alertPageId = pageId;
    const cms = createSecureCmsDataServices();
    const user = await getRequestUser({ required: true });
    alertUserId = user.uid;
    const now = new Date().toISOString();

    const page = await cms.pages.getPage(siteId, pageId);
    if (!page) {
      return NextResponse.json({ ok: false, error: `Page "${pageId}" not found.` }, { status: 404 });
    }
    const site = await cms.sites.getSiteById(siteId);
    if (!site) {
      return NextResponse.json({ ok: false, error: `Site "${siteId}" not found.` }, { status: 404 });
    }
    alertWorkspaceId = site.workspaceId;
    await assertCmsRateLimit({
      workspaceId: site.workspaceId,
      userId: user.uid,
      action: "unpublish",
    });
    await assertCmsWorkspaceQuota({
      workspaceId: site.workspaceId,
      action: "unpublish",
    });

    const allPages = await cms.pages.listSitePages(siteId);
    const publishedEntries = buildPublishedEntries(allPages, pageId);
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
      status: "draft",
      hasUnpublishedChanges: false,
      publishedVersionId: "",
      publishedSnapshotId: "",
      publishedAt: null,
      publishedBy: null,
      updatedAt: now,
      updatedBy: user.uid,
      draftVersion: (page.draftVersion || 1) + 1,
    });

    let cacheInvalidation = null;
    try {
      cacheInvalidation = invalidatePublishCaches({
        siteId,
        siteSlug: site.slug || "",
        pageId,
        pages: [
          ...publishedEntries.map((entry) => ({
            pageId: entry.pageId,
            slug: entry.slug,
          })),
          { pageId, slug: page.slug || "" },
        ],
      });
    } catch (_error) {
      cacheInvalidation = null;
    }

    const refreshedPage = await cms.pages.getPage(siteId, pageId);
    await safeResolvePublishAlertsForPage({
      cms,
      workspaceId: site.workspaceId,
      siteId,
      pageId,
      resolvedBy: user.uid,
      resolution: "Unpublish succeeded",
      resolvedAt: now,
    });
    await safeWriteCmsAuditLog({
      cms,
      workspaceId: site.workspaceId,
      actorUserId: user.uid,
      action: "page.unpublished",
      entityType: "page",
      entityId: pageId,
      siteId,
      pageId,
      summary: `Unpublished page "${page.title || pageId}"`,
      metadata: {
        siteSnapshotId,
      },
      createdAt: now,
    });
    return NextResponse.json({
      ok: true,
      page: toPageResponse(refreshedPage),
      unpublish: {
        siteSnapshotId,
        unpublishedAt: now,
        unpublishedBy: user.uid,
      },
      cacheInvalidation: cacheInvalidation
        ? {
            tags: cacheInvalidation.tags.length,
            paths: cacheInvalidation.paths.length,
          }
        : null,
    });
  } catch (error) {
    if (alertWorkspaceId) {
      const cms = createSecureCmsDataServices();
      await safeCreatePublishFailureAlert({
        cms,
        workspaceId: alertWorkspaceId,
        siteId: alertSiteId,
        pageId: alertPageId,
        operation: "unpublish",
        reasonCode: getPublishFailureReasonCode(error),
        message: error?.message || "Failed to unpublish page.",
        actorUserId: alertUserId,
      });
    }
    if (error instanceof CmsQuotaExceededError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          code: "quota-exceeded",
          action: error.action,
          limit: error.limit,
          resetAt: error.resetAt,
        },
        { status: 429 }
      );
    }
    if (error instanceof CmsRateLimitError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          retryAfterSeconds: error.retryAfterSeconds,
          code: "rate-limit-exceeded",
        },
        {
          status: 429,
          headers: { "Retry-After": String(error.retryAfterSeconds) },
        }
      );
    }
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to unpublish page." }, { status: 500 });
  }
}
