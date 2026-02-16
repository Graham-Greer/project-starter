import "server-only";

import { randomUUID } from "node:crypto";
import { getFirebaseAdminStorage } from "@/lib/firebase";

const ALLOWED_MEDIA_TYPES = [
  "image/",
  "video/",
  "application/pdf",
];

export const MAX_MEDIA_BYTES = 25 * 1024 * 1024;

function sanitizePathSegment(value = "") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "file";
}

function sanitizeSiteSlug(value = "") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "";
}

function getFileExtension(filename = "", mimeType = "") {
  const name = String(filename || "");
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex >= 0 && dotIndex < name.length - 1) {
    return name.slice(dotIndex + 1).toLowerCase();
  }

  if (mimeType.startsWith("image/")) return mimeType.split("/")[1] || "img";
  if (mimeType.startsWith("video/")) return mimeType.split("/")[1] || "video";
  if (mimeType === "application/pdf") return "pdf";
  return "bin";
}

export function isAllowedMediaType(contentType = "") {
  const normalized = String(contentType || "").toLowerCase();
  if (!normalized) return false;
  return ALLOWED_MEDIA_TYPES.some((prefix) => normalized.startsWith(prefix));
}

export function validateMediaUpload({ contentType = "", sizeBytes = 0 }) {
  if (!isAllowedMediaType(contentType)) {
    return {
      valid: false,
      error: "Unsupported file type. Use image, video, or PDF files.",
    };
  }

  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return {
      valid: false,
      error: "Upload failed because the selected file is empty.",
    };
  }

  if (sizeBytes > MAX_MEDIA_BYTES) {
    return {
      valid: false,
      error: "File is too large. Use files up to 25MB.",
    };
  }

  return { valid: true };
}

function encodeStoragePath(path = "") {
  return encodeURIComponent(path).replace(/%2F/g, "%2F");
}

export function buildFirebaseDownloadUrl({ bucket = "", storagePath = "", downloadToken = "" }) {
  if (!bucket || !storagePath || !downloadToken) return "";
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeStoragePath(storagePath)}?alt=media&token=${downloadToken}`;
}

export function buildMediaPublicUrl({ siteSlug = "", assetId = "", filename = "", contentType = "" }) {
  const normalizedSiteSlug = sanitizeSiteSlug(siteSlug);
  const normalizedAssetId = String(assetId || "").trim();
  if (!normalizedSiteSlug || !normalizedAssetId) return "";
  const extension = getFileExtension(filename, contentType);
  const safeName = sanitizePathSegment(filename.replace(/\.[^.]+$/, ""));
  return `/live/${normalizedSiteSlug}/images/${normalizedAssetId}-${safeName}.${extension}`;
}

export function resolveMediaAssetUrl(asset = {}, options = {}) {
  if (!asset || typeof asset !== "object") return "";
  const siteSlug = String(options?.siteSlug || asset.siteSlug || "").trim();
  return buildMediaPublicUrl({
    siteSlug,
    assetId: asset.id || "",
    filename: asset.filename || "",
    contentType: asset.contentType || "",
  });
}

export function buildMediaAssetStoragePath({ workspaceId, siteId, assetId, filename, contentType }) {
  const extension = getFileExtension(filename, contentType);
  const safeName = sanitizePathSegment(filename.replace(/\.[^.]+$/, ""));
  return `workspaces/${workspaceId}/sites/${siteId}/assets/${assetId}-${safeName}.${extension}`;
}

export function buildMediaAssetRecord({
  assetId,
  workspaceId,
  siteId,
  filename,
  contentType,
  sizeBytes,
  storagePath,
  publicUrl,
  downloadToken,
  alt,
  siteSlug,
  uploadedBy,
  createdAt,
}) {
  const isImage = String(contentType || "").toLowerCase().startsWith("image/");
  return {
    id: assetId,
    workspaceId,
    siteId,
    siteSlug: sanitizeSiteSlug(siteSlug),
    filename: String(filename || "").trim(),
    contentType: String(contentType || "").trim().toLowerCase(),
    sizeBytes: Number(sizeBytes) || 0,
    storagePath,
    publicUrl: String(publicUrl || "").trim(),
    downloadToken: String(downloadToken || "").trim(),
    alt: isImage ? String(alt || "").trim() : "",
    tags: [],
    uploadedBy: String(uploadedBy || "").trim(),
    createdAt,
    updatedAt: createdAt,
  };
}

export async function uploadMediaFileToStorage({
  workspaceId,
  siteId,
  assetId,
  filename,
  contentType,
  buffer,
}) {
  const storagePath = buildMediaAssetStoragePath({
    workspaceId,
    siteId,
    assetId,
    filename,
    contentType,
  });

  const bucket = getFirebaseAdminStorage().bucket();
  const file = bucket.file(storagePath);
  const downloadToken = randomUUID();
  await file.save(buffer, {
    resumable: false,
    metadata: {
      contentType,
      cacheControl: "public,max-age=31536000,immutable",
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  });

  const publicUrl = buildFirebaseDownloadUrl({
    bucket: bucket.name,
    storagePath,
    downloadToken,
  });

  return { storagePath, publicUrl, downloadToken };
}

export async function deleteMediaFileFromStorage(storagePath = "") {
  if (!storagePath) return;
  const bucket = getFirebaseAdminStorage().bucket();
  const file = bucket.file(storagePath);
  await file.delete({ ignoreNotFound: true });
}
