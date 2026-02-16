import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError, getRequestUser } from "@/lib/auth";
import { safeWriteCmsAuditLog } from "@/lib/cms/audit-log";
import { safeCreatePublishFailureAlert, safeResolvePublishAlertsForPage } from "@/lib/cms/publish-alerts";
import { invalidatePublishCaches } from "@/lib/cms/publish-cache";
import { assertCmsWorkspaceQuota, CmsQuotaExceededError } from "@/lib/cms/quota";
import { assertCmsRateLimit, CmsRateLimitError } from "@/lib/cms/rate-limit";
import { createSecureCmsDataServices } from "@/lib/data";

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

function getRollbackFailureReasonCode(error) {
  if (error instanceof CmsRateLimitError) return "rate_limit_exceeded";
  if (error instanceof CmsQuotaExceededError) return "quota_exceeded";
  if (error instanceof UnauthorizedError) return "unauthorized";
  if (error instanceof ForbiddenError) return "forbidden";
  return "rollback_error";
}

export async function POST(request, { params }) {
  let alertWorkspaceId = "";
  let alertUserId = "";
  let alertSiteId = "";
  let alertPageId = "";
  try {
    const { siteId, pageId } = await params;
    alertSiteId = siteId;
    alertPageId = pageId;
    const payload = await request.json();
    const targetVersionId = typeof payload?.versionId === "string" ? payload.versionId.trim() : "";
    if (!targetVersionId) {
      return NextResponse.json({ ok: false, error: "versionId is required." }, { status: 400 });
    }

    const cms = createSecureCmsDataServices();
    const user = await getRequestUser({ required: true });
    alertUserId = user.uid;
    const now = new Date().toISOString();

    const [currentPage, targetVersion, site] = await Promise.all([
      cms.pages.getPage(siteId, pageId),
      cms.snapshots.getPageVersion(siteId, targetVersionId),
      cms.sites.getSiteById(siteId),
    ]);

    if (!currentPage) {
      return NextResponse.json({ ok: false, error: `Page "${pageId}" not found.` }, { status: 404 });
    }
    if (!site) {
      return NextResponse.json({ ok: false, error: `Site "${siteId}" not found.` }, { status: 404 });
    }
    alertWorkspaceId = site.workspaceId;
    if (!targetVersion || targetVersion.pageId !== pageId || !targetVersion.snapshot) {
      return NextResponse.json({ ok: false, error: `Version "${targetVersionId}" is not valid for this page.` }, { status: 404 });
    }
    await assertCmsRateLimit({
      workspaceId: site.workspaceId,
      userId: user.uid,
      action: "publishRollback",
    });
    await assertCmsWorkspaceQuota({
      workspaceId: site.workspaceId,
      action: "publishRollback",
    });

    const rollbackVersionId = buildPageVersionId(pageId, now);
    const rollbackSnapshot = JSON.parse(JSON.stringify(targetVersion.snapshot));
    await cms.snapshots.createPageVersion(siteId, rollbackVersionId, {
      workspaceId: currentPage.workspaceId,
      siteId,
      pageId,
      version: currentPage.draftVersion || 1,
      sourceDraftVersion: currentPage.draftVersion || 1,
      sourceVersionId: targetVersionId,
      rollback: true,
      snapshot: rollbackSnapshot,
      publishedAt: now,
      publishedBy: user.uid,
    });

    const allPages = await cms.pages.listSitePages(siteId);
    const publishedEntries = buildPublishedEntries(allPages, pageId);
    publishedEntries.push({
      pageId,
      slug: rollbackSnapshot.slug || currentPage.slug || "",
      versionId: rollbackVersionId,
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
      rollbackFromVersionId: targetVersionId,
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
      ...currentPage,
      ...rollbackSnapshot,
      id: pageId,
      siteId,
      workspaceId: currentPage.workspaceId,
      status: "published",
      hasUnpublishedChanges: false,
      publishedVersionId: rollbackVersionId,
      publishedSnapshotId: siteSnapshotId,
      publishedAt: now,
      publishedBy: user.uid,
      updatedAt: now,
      updatedBy: user.uid,
      draftVersion: (currentPage.draftVersion || 1) + 1,
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
      resolution: "Rollback publish succeeded",
      resolvedAt: now,
    });
    await safeWriteCmsAuditLog({
      cms,
      workspaceId: site.workspaceId,
      actorUserId: user.uid,
      action: "page.publish_rollback",
      entityType: "page",
      entityId: pageId,
      siteId,
      pageId,
      summary: `Rolled back published version for "${currentPage.title || pageId}"`,
      metadata: {
        sourceVersionId: targetVersionId,
        rollbackVersionId,
        siteSnapshotId,
      },
      createdAt: now,
    });
    return NextResponse.json({
      ok: true,
      page: toPageResponse(refreshedPage),
      rollback: {
        sourceVersionId: targetVersionId,
        publishedVersionId: rollbackVersionId,
        siteSnapshotId,
        rolledBackAt: now,
        rolledBackBy: user.uid,
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
        operation: "rollback",
        reasonCode: getRollbackFailureReasonCode(error),
        message: error?.message || "Failed to rollback published version.",
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
    return NextResponse.json({ ok: false, error: "Failed to rollback published version." }, { status: 500 });
  }
}
