import "server-only";

import { getFirebaseAdminDb } from "@/lib/firebase";

const ACTION_DAILY_QUOTAS = {
  publish: 200,
  unpublish: 200,
  publishRollback: 100,
};

export class CmsQuotaExceededError extends Error {
  constructor(message, { action = "", limit = 0, resetAt = "" } = {}) {
    super(message || "Workspace quota exceeded.");
    this.name = "CmsQuotaExceededError";
    this.action = action;
    this.limit = limit;
    this.resetAt = resetAt;
  }
}

function getUtcDateKey(nowDate = new Date()) {
  const year = nowDate.getUTCFullYear();
  const month = String(nowDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(nowDate.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function getUtcResetIso(nowDate = new Date()) {
  return new Date(Date.UTC(
    nowDate.getUTCFullYear(),
    nowDate.getUTCMonth(),
    nowDate.getUTCDate() + 1,
    0,
    0,
    0,
    0
  )).toISOString();
}

function normalizeKeyPart(value, fallback = "unknown") {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  return normalized || fallback;
}

function resolveDailyLimit(action) {
  const limit = ACTION_DAILY_QUOTAS[action];
  if (!Number.isFinite(limit) || limit <= 0) return 0;
  return limit;
}

export async function assertCmsWorkspaceQuota({ workspaceId, action }) {
  const resolvedWorkspaceId = typeof workspaceId === "string" ? workspaceId.trim() : "";
  const resolvedAction = typeof action === "string" ? action.trim() : "";
  if (!resolvedWorkspaceId || !resolvedAction) {
    return { ok: true, skipped: true };
  }

  const limit = resolveDailyLimit(resolvedAction);
  if (!limit) {
    return { ok: true, skipped: true };
  }

  const nowDate = new Date();
  const dateKey = getUtcDateKey(nowDate);
  const resetAt = getUtcResetIso(nowDate);
  const workspaceKey = normalizeKeyPart(resolvedWorkspaceId, "workspace");
  const actionKey = normalizeKeyPart(resolvedAction, "action");
  const docId = `${workspaceKey}__${actionKey}__${dateKey}`;

  const db = getFirebaseAdminDb();
  const ref = db.collection("cmsQuotas").doc(docId);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const existing = snapshot.exists ? snapshot.data() || {} : {};
    const currentCount = Number(existing.count || 0);

    if (currentCount >= limit) {
      throw new CmsQuotaExceededError("Daily workspace quota exceeded for this action.", {
        action: resolvedAction,
        limit,
        resetAt,
      });
    }

    const nextCount = currentCount + 1;
    transaction.set(
      ref,
      {
        workspaceId: resolvedWorkspaceId,
        action: resolvedAction,
        dateKey,
        count: nextCount,
        limit,
        resetAt,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return {
      ok: true,
      action: resolvedAction,
      dateKey,
      limit,
      count: nextCount,
      remaining: Math.max(0, limit - nextCount),
      resetAt,
    };
  });
}
