export function isHttpsUrl(value = "") {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch (_error) {
    return false;
  }
}

export function isInternalMediaPath(value = "") {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized.startsWith("/live/") && normalized.includes("/images/");
}

export function validateSeoPayload(seo = {}) {
  const metaTitle = typeof seo?.metaTitle === "string" ? seo.metaTitle.trim() : "";
  const metaDescription = typeof seo?.metaDescription === "string" ? seo.metaDescription.trim() : "";
  const ogImageUrl = typeof seo?.ogImageUrl === "string" ? seo.ogImageUrl.trim() : "";
  const ogImageAssetId = typeof seo?.ogImageAssetId === "string" ? seo.ogImageAssetId.trim() : "";

  if (metaTitle.length > 70) {
    return { valid: false, error: "SEO title must be 70 characters or fewer." };
  }
  if (metaDescription.length > 170) {
    return { valid: false, error: "SEO description must be 170 characters or fewer." };
  }
  if (ogImageUrl.length > 2048) {
    return { valid: false, error: "OG image URL must be 2048 characters or fewer." };
  }
  if (ogImageUrl && !isHttpsUrl(ogImageUrl) && !isInternalMediaPath(ogImageUrl)) {
    return { valid: false, error: "OG image URL must use https (or be a CMS media URL)." };
  }

  return {
    valid: true,
    seo: {
      metaTitle,
      metaDescription,
      ogImageUrl,
      ogImageAssetId,
    },
  };
}

export async function validateImageUrlReachable(url, { timeoutMs = 5000 } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok || !response.headers.get("content-type")) {
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { Range: "bytes=0-0" },
        signal: controller.signal,
      });
    }

    if (!response.ok) {
      return { valid: false, error: "OG image URL could not be fetched." };
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      return { valid: false, error: "OG image URL must point to an image resource." };
    }

    return { valid: true };
  } catch (_error) {
    return { valid: false, error: "Unable to verify OG image URL. Check the link and try again." };
  } finally {
    clearTimeout(timeoutId);
  }
}
