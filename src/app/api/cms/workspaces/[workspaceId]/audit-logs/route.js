import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError, getRequestUser, requireWorkspaceRole } from "@/lib/auth";
import { getFirebaseAdminAuth } from "@/lib/firebase";
import { createDataServices } from "@/lib/data";

function parseLimit(value, fallback = 50) {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, 200);
}

async function buildActorMap({ workspaceId, rows, currentUser }) {
  const uniqueActorIds = [...new Set((rows || []).map((entry) => entry?.actorUserId).filter(Boolean))];
  if (uniqueActorIds.length === 0) return {};

  const data = createDataServices();
  const members = await data.workspaces.listWorkspaceMembers(workspaceId);
  const memberById = new Map((Array.isArray(members) ? members : []).map((member) => [member.id, member]));
  const actorMap = {};

  const unresolvedActorIds = [];
  uniqueActorIds.forEach((uid) => {
    if (uid === currentUser.uid) {
      actorMap[uid] = {
        uid,
        label: currentUser.name || currentUser.email || "You",
        email: currentUser.email || "",
      };
      return;
    }

    const member = memberById.get(uid);
    if (member?.name || member?.displayName || member?.email) {
      actorMap[uid] = {
        uid,
        label: member.name || member.displayName || member.email || uid,
        email: member.email || "",
      };
      return;
    }

    unresolvedActorIds.push(uid);
  });

  if (unresolvedActorIds.length === 0) return actorMap;

  const auth = getFirebaseAdminAuth();
  const profileResults = await Promise.allSettled(unresolvedActorIds.map((uid) => auth.getUser(uid)));
  profileResults.forEach((result, index) => {
    const uid = unresolvedActorIds[index];
    if (result.status === "fulfilled") {
      const user = result.value;
      actorMap[uid] = {
        uid,
        label: user.displayName || user.email || uid,
        email: user.email || "",
      };
      return;
    }
    actorMap[uid] = {
      uid,
      label: uid,
      email: "",
    };
  });

  return actorMap;
}

export async function GET(request, { params }) {
  try {
    const { workspaceId } = await params;
    const currentUser = await getRequestUser({ required: true });
    const data = createDataServices();
    await requireWorkspaceRole({
      workspacesRepository: data.workspaces,
      workspaceId,
      userId: currentUser.uid,
      allowedRoles: ["owner", "admin", "editor", "viewer"],
    });

    const url = new URL(request.url);
    const limit = parseLimit(url.searchParams.get("limit"), 50);
    const siteId = typeof url.searchParams.get("siteId") === "string" ? url.searchParams.get("siteId").trim() : "";
    const pageId = typeof url.searchParams.get("pageId") === "string" ? url.searchParams.get("pageId").trim() : "";
    const action = typeof url.searchParams.get("action") === "string" ? url.searchParams.get("action").trim() : "";

    const allLogs = await data.auditLogs.listWorkspaceAuditLogs(workspaceId);
    const filtered = (Array.isArray(allLogs) ? allLogs : []).filter((entry) => {
      if (siteId && entry.siteId !== siteId) return false;
      if (pageId && entry.pageId !== pageId) return false;
      if (action && entry.action !== action) return false;
      return true;
    });

    const rows = filtered
      .sort((a, b) => Date.parse(b?.createdAt || 0) - Date.parse(a?.createdAt || 0))
      .slice(0, limit);
    const actorMap = await buildActorMap({ workspaceId, rows, currentUser });
    const rowsWithActor = rows.map((entry) => ({
      ...entry,
      actor: actorMap[entry.actorUserId] || {
        uid: entry.actorUserId || "",
        label: entry.actorUserId || "unknown",
        email: "",
      },
    }));

    return NextResponse.json({
      ok: true,
      workspaceId,
      rows: rowsWithActor,
      count: rowsWithActor.length,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Failed to load audit logs." }, { status: 500 });
  }
}
