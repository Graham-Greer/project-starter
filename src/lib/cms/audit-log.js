function toTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeMetadata(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const entries = Object.entries(input).filter(([, value]) => typeof value !== "undefined");
  if (!entries.length) return {};
  return Object.fromEntries(entries);
}

export function buildAuditLogId(nowIso = "", action = "") {
  const timestamp = Date.parse(nowIso || new Date().toISOString());
  const actionKey = toTrimmedString(action).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "event";
  const entropy = Math.random().toString(36).slice(2, 8);
  return `audit_${actionKey}_${timestamp}_${entropy}`;
}

export async function writeCmsAuditLog({
  cms,
  workspaceId,
  actorUserId,
  action,
  entityType,
  entityId,
  siteId = "",
  pageId = "",
  summary = "",
  metadata = {},
  createdAt,
}) {
  const resolvedWorkspaceId = toTrimmedString(workspaceId);
  const resolvedAction = toTrimmedString(action);
  const resolvedEntityType = toTrimmedString(entityType);
  const resolvedEntityId = toTrimmedString(entityId);
  const resolvedActorUserId = toTrimmedString(actorUserId);
  if (!cms || !resolvedWorkspaceId || !resolvedAction || !resolvedEntityType || !resolvedEntityId || !resolvedActorUserId) {
    throw new Error("Missing required audit log fields.");
  }

  const now = toTrimmedString(createdAt) || new Date().toISOString();
  const logId = buildAuditLogId(now, resolvedAction);
  const payload = {
    workspaceId: resolvedWorkspaceId,
    action: resolvedAction,
    entityType: resolvedEntityType,
    entityId: resolvedEntityId,
    siteId: toTrimmedString(siteId),
    pageId: toTrimmedString(pageId),
    actorUserId: resolvedActorUserId,
    summary: toTrimmedString(summary),
    metadata: sanitizeMetadata(metadata),
    createdAt: now,
  };

  await cms.auditLogs.createWorkspaceAuditLog(resolvedWorkspaceId, logId, payload);
  return { id: logId, ...payload };
}

export async function safeWriteCmsAuditLog(args) {
  try {
    await writeCmsAuditLog(args);
  } catch (_error) {
    // Audit logging must not block primary CMS workflows.
  }
}
