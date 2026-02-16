import { NextResponse } from "next/server";
import { buildFirebaseDownloadUrl } from "@/lib/cms/media-assets";
import { getFirebaseAdminStorage } from "@/lib/firebase";
import { createDataServices } from "@/lib/data";

function normalizeSiteSlug(value = "") {
  return String(value || "").trim().toLowerCase();
}

function pickMostRecentlyUpdatedSite(sites = []) {
  if (!sites.length) return null;
  return [...sites].sort((a, b) => {
    const aTime = Date.parse(a?.updatedAt || a?.createdAt || 0);
    const bTime = Date.parse(b?.updatedAt || b?.createdAt || 0);
    return bTime - aTime;
  })[0];
}

function parseAssetId(assetRef = "") {
  const normalizedRef = String(assetRef || "").trim();
  if (!normalizedRef) return "";
  const withoutExtension = normalizedRef.replace(/\.[^.]+$/, "");
  const candidate = withoutExtension.split("-")[0] || "";
  return candidate.startsWith("asset_") ? candidate : "";
}

export async function GET(_request, { params }) {
  const { siteSlug, assetRef } = await params;
  const normalizedSiteSlug = normalizeSiteSlug(siteSlug);
  const assetId = parseAssetId(assetRef);
  if (!normalizedSiteSlug || !assetId) {
    return NextResponse.json({ ok: false, error: "Media not found." }, { status: 404 });
  }

  const cms = createDataServices();
  const sites = await cms.sites.listSitesBySlug(normalizedSiteSlug);
  const site = pickMostRecentlyUpdatedSite(Array.isArray(sites) ? sites : []);
  if (!site?.id) {
    return NextResponse.json({ ok: false, error: "Media not found." }, { status: 404 });
  }

  const asset = await cms.assets.getAssetById(assetId);
  if (!asset || asset.siteId !== site.id) {
    return NextResponse.json({ ok: false, error: "Media not found." }, { status: 404 });
  }

  const bucket = getFirebaseAdminStorage().bucket();
  const downloadUrl = buildFirebaseDownloadUrl({
    bucket: bucket.name,
    storagePath: asset.storagePath || "",
    downloadToken: asset.downloadToken || "",
  });

  if (!downloadUrl) {
    return NextResponse.json({ ok: false, error: "Media URL is unavailable." }, { status: 404 });
  }

  return NextResponse.redirect(downloadUrl, 307);
}
