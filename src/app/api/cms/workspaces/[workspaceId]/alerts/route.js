import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth";
import { createSecureCmsDataServices } from "@/lib/data";

function parseLimit(value, fallback = 50) {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, 200);
}

export async function GET(request, { params }) {
  try {
    const { workspaceId } = await params;
    const url = new URL(request.url);
    const limit = parseLimit(url.searchParams.get("limit"), 50);
    const status = typeof url.searchParams.get("status") === "string" ? url.searchParams.get("status").trim() : "";
    const siteId = typeof url.searchParams.get("siteId") === "string" ? url.searchParams.get("siteId").trim() : "";
    const pageId = typeof url.searchParams.get("pageId") === "string" ? url.searchParams.get("pageId").trim() : "";
    const category = typeof url.searchParams.get("category") === "string" ? url.searchParams.get("category").trim() : "";

    const cms = createSecureCmsDataServices();
    const allAlerts = await cms.alerts.listWorkspaceAlerts(workspaceId);
    const filtered = (Array.isArray(allAlerts) ? allAlerts : []).filter((entry) => {
      if (status && entry.status !== status) return false;
      if (siteId && entry.siteId !== siteId) return false;
      if (pageId && entry.pageId !== pageId) return false;
      if (category && entry.category !== category) return false;
      return true;
    });

    const rows = filtered
      .sort((a, b) => Date.parse(b?.createdAt || 0) - Date.parse(a?.createdAt || 0))
      .slice(0, limit);

    return NextResponse.json({
      ok: true,
      workspaceId,
      rows,
      count: rows.length,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to load alerts." }, { status: 500 });
  }
}
