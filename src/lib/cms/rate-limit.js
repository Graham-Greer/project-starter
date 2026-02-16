import "server-only";

import { getFirebaseAdminDb } from "@/lib/firebase";

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 12;

const ACTION_LIMITS = {
  publish: { limit: 10, windowMs: 60_000 },
  unpublish: { limit: 10, windowMs: 60_000 },
  publishRollback: { limit: 6, windowMs: 60_000 },
};

export class CmsRateLimitError extends Error {
  constructor(message, { retryAfterSeconds = 60, limit = DEFAULT_LIMIT, remaining = 0 } = {}) {
    super(message || "Rate limit exceeded.");
    this.name = "CmsRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
    this.limit = limit;
    this.remaining = remaining;
  }
}

function normalizeKeyPart(value, fallback = "unknown") {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  return normalized || fallback;
}

function buildRateLimitDocId({ workspaceId, userId, action }) {
  const workspaceKey = normalizeKeyPart(workspaceId, "workspace");
  const userKey = normalizeKeyPart(userId, "user");
  const actionKey = normalizeKeyPart(action, "action");
  return `${workspaceKey}__${userKey}__${actionKey}`;
}

function resolveActionConfig(action) {
  const config = ACTION_LIMITS[action] || {};
  const limit = Number.isFinite(config.limit) && config.limit > 0 ? config.limit : DEFAULT_LIMIT;
  const windowMs = Number.isFinite(config.windowMs) && config.windowMs > 0 ? config.windowMs : DEFAULT_WINDOW_MS;
  return { limit, windowMs };
}

export async function assertCmsRateLimit({ workspaceId, userId, action }) {
  const resolvedWorkspaceId = typeof workspaceId === "string" ? workspaceId.trim() : "";
  const resolvedUserId = typeof userId === "string" ? userId.trim() : "";
  const resolvedAction = typeof action === "string" ? action.trim() : "";
  if (!resolvedWorkspaceId || !resolvedUserId || !resolvedAction) {
    return { ok: true, skipped: true };
  }

  const { limit, windowMs } = resolveActionConfig(resolvedAction);
  const docId = buildRateLimitDocId({
    workspaceId: resolvedWorkspaceId,
    userId: resolvedUserId,
    action: resolvedAction,
  });

  const now = Date.now();
  const db = getFirebaseAdminDb();
  const ref = db.collection("cmsRateLimits").doc(docId);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const existing = snapshot.exists ? snapshot.data() || {} : {};
    const previousWindowStart = Number(existing.windowStart || 0);
    const previousCount = Number(existing.count || 0);
    const windowExpired = !previousWindowStart || now - previousWindowStart >= windowMs;

    if (windowExpired) {
      transaction.set(
        ref,
        {
          workspaceId: resolvedWorkspaceId,
          userId: resolvedUserId,
          action: resolvedAction,
          count: 1,
          windowStart: now,
          windowMs,
          limit,
          updatedAt: new Date(now).toISOString(),
        },
        { merge: true }
      );
      return {
        ok: true,
        limit,
        remaining: Math.max(0, limit - 1),
      };
    }

    if (previousCount >= limit) {
      const retryAfterMs = Math.max(1_000, windowMs - (now - previousWindowStart));
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
      throw new CmsRateLimitError("Rate limit exceeded for this action.", {
        retryAfterSeconds,
        limit,
        remaining: 0,
      });
    }

    const nextCount = previousCount + 1;
    transaction.set(
      ref,
      {
        workspaceId: resolvedWorkspaceId,
        userId: resolvedUserId,
        action: resolvedAction,
        count: nextCount,
        windowStart: previousWindowStart,
        windowMs,
        limit,
        updatedAt: new Date(now).toISOString(),
      },
      { merge: true }
    );

    return {
      ok: true,
      limit,
      remaining: Math.max(0, limit - nextCount),
    };
  });
}
