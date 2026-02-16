function normalizeString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim() || fallback;
}

function buildAlertId(nowIso = "", operation = "") {
  const timestamp = Date.parse(nowIso || new Date().toISOString());
  const op = normalizeString(operation, "publish")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-");
  const entropy = Math.random().toString(36).slice(2, 8);
  return `alert_${op}_${timestamp}_${entropy}`;
}

export async function safeCreatePublishFailureAlert({
  cms,
  workspaceId,
  siteId,
  pageId,
  operation,
  reasonCode,
  message,
  actorUserId = "",
  metadata = {},
  createdAt,
}) {
  try {
    const now = normalizeString(createdAt) || new Date().toISOString();
    const alertId = buildAlertId(now, operation);
    await cms.alerts.createWorkspaceAlert(workspaceId, alertId, {
      workspaceId,
      siteId: normalizeString(siteId),
      pageId: normalizeString(pageId),
      category: "publish",
      operation: normalizeString(operation, "publish"),
      reasonCode: normalizeString(reasonCode, "unknown"),
      message: normalizeString(message, "Publish pipeline alert"),
      severity: "error",
      status: "open",
      actorUserId: normalizeString(actorUserId),
      metadata: metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata : {},
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
      resolvedBy: "",
      resolution: "",
    });
  } catch (_error) {
    // Alerts should never block API responses.
  }
}

export async function safeResolvePublishAlertsForPage({
  cms,
  workspaceId,
  siteId,
  pageId,
  resolvedBy = "",
  resolution = "Published successfully",
  resolvedAt,
}) {
  try {
    const now = normalizeString(resolvedAt) || new Date().toISOString();
    const alerts = await cms.alerts.listWorkspaceAlerts(workspaceId);
    const toResolve = (Array.isArray(alerts) ? alerts : []).filter((alert) =>
      alert?.status === "open" &&
      alert?.category === "publish" &&
      normalizeString(alert.siteId) === normalizeString(siteId) &&
      normalizeString(alert.pageId) === normalizeString(pageId)
    );

    if (!toResolve.length) return;

    await Promise.all(toResolve.map((alert) =>
      cms.alerts.updateWorkspaceAlert(workspaceId, alert.id, {
        status: "resolved",
        resolvedAt: now,
        resolvedBy: normalizeString(resolvedBy),
        resolution: normalizeString(resolution, "Resolved"),
        updatedAt: now,
      })
    ));
  } catch (_error) {
    // Alert resolution should never block API responses.
  }
}
