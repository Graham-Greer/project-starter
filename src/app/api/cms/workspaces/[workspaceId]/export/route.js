import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError, getRequestUser } from "@/lib/auth";
import { safeWriteCmsAuditLog } from "@/lib/cms/audit-log";
import { getFirebaseEnvironment } from "@/lib/config";
import { createSecureCmsDataServices } from "@/lib/data";

const EXPORT_SCHEMA_VERSION = "cms-export-v1";

function normalizeId(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .slice(0, 64);
}

function sortById(items = []) {
  return [...(Array.isArray(items) ? items : [])].sort((a, b) => String(a?.id || "").localeCompare(String(b?.id || "")));
}

async function buildSiteExport(cms, site) {
  const [pages, pageVersions, siteSnapshots] = await Promise.all([
    cms.pages.listSitePages(site.id),
    cms.snapshots.listPageVersions(site.id),
    cms.snapshots.listSiteSnapshots(site.id),
  ]);

  return {
    site,
    pages: sortById(pages),
    pageVersions: sortById(pageVersions),
    siteSnapshots: sortById(siteSnapshots),
  };
}

export async function GET(request, { params }) {
  try {
    const { workspaceId } = await params;
    const user = await getRequestUser({ required: true });
    const url = new URL(request.url);
    const requestedSiteId = typeof url.searchParams.get("siteId") === "string"
      ? url.searchParams.get("siteId").trim()
      : "";

    const cms = createSecureCmsDataServices();
    const workspace = await cms.workspaces.getWorkspaceById(workspaceId);
    if (!workspace) {
      return NextResponse.json({ ok: false, error: `Workspace "${workspaceId}" not found.` }, { status: 404 });
    }

    let sites = [];
    if (requestedSiteId) {
      const site = await cms.sites.getSiteById(requestedSiteId);
      if (!site) {
        return NextResponse.json({ ok: false, error: `Site "${requestedSiteId}" not found.` }, { status: 404 });
      }
      if (site.workspaceId !== workspaceId) {
        return NextResponse.json({ ok: false, error: `Site "${requestedSiteId}" does not belong to workspace "${workspaceId}".` }, { status: 400 });
      }
      sites = [site];
    } else {
      sites = await cms.sites.listWorkspaceSites(workspaceId);
    }

    const siteExports = await Promise.all(sortById(sites).map((site) => buildSiteExport(cms, site)));
    const now = new Date().toISOString();
    const exportBundle = {
      schemaVersion: EXPORT_SCHEMA_VERSION,
      generatedAt: now,
      generatedBy: {
        uid: user.uid,
        email: user.email || "",
      },
      environment: getFirebaseEnvironment(),
      workspace,
      filters: {
        siteId: requestedSiteId || "",
      },
      summary: {
        siteCount: siteExports.length,
        pageCount: siteExports.reduce((acc, item) => acc + item.pages.length, 0),
        pageVersionCount: siteExports.reduce((acc, item) => acc + item.pageVersions.length, 0),
        siteSnapshotCount: siteExports.reduce((acc, item) => acc + item.siteSnapshots.length, 0),
      },
      sites: siteExports,
    };

    await safeWriteCmsAuditLog({
      cms,
      workspaceId,
      actorUserId: user.uid,
      action: "workspace.exported",
      entityType: "workspace",
      entityId: workspaceId,
      summary: `Exported workspace "${workspace?.name || workspaceId}" backup bundle`,
      metadata: {
        requestedSiteId: requestedSiteId || "",
        siteCount: exportBundle.summary.siteCount,
        pageCount: exportBundle.summary.pageCount,
      },
      createdAt: now,
    });

    const fileToken = normalizeId(requestedSiteId || workspaceId || "workspace");
    const filename = requestedSiteId
      ? `cms-export-${fileToken}-${Date.now()}.json`
      : `cms-workspace-export-${fileToken}-${Date.now()}.json`;

    return new NextResponse(JSON.stringify(exportBundle, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to export workspace content." }, { status: 500 });
  }
}
