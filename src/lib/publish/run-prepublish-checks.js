import { validateBlock } from "@/lib/validation";
import { validateImageUrlReachable, validateSeoPayload } from "@/lib/validation/seo";

function passCheck(id, label, message = "Passed") {
  return { id, label, status: "pass", message };
}

function failCheck(id, label, message) {
  return { id, label, status: "fail", message };
}

export async function runPrePublishChecks({ cms, siteId, pageId }) {
  const page = await cms.pages.getPage(siteId, pageId);
  if (!page) {
    return {
      ok: false,
      error: `Page "${pageId}" not found.`,
      statusCode: 404,
    };
  }

  const checks = [];

  if (typeof page.title === "string" && page.title.trim().length > 0) {
    checks.push(passCheck("title", "Page title"));
  } else {
    checks.push(failCheck("title", "Page title", "Page title is required."));
  }

  if (typeof page.slug === "string" && page.slug.trim().length > 0) {
    checks.push(passCheck("slug", "Page slug"));
  } else {
    checks.push(failCheck("slug", "Page slug", "Page slug is required."));
  }

  const seoValidation = validateSeoPayload(page?.seo || {});
  if (!seoValidation.valid) {
    checks.push(failCheck("seo", "SEO metadata", seoValidation.error));
  } else {
    checks.push(passCheck("seo", "SEO metadata"));
  }

  const metaTitle = seoValidation.valid ? seoValidation.seo.metaTitle : "";
  const metaDescription = seoValidation.valid ? seoValidation.seo.metaDescription : "";
  if (!metaTitle) {
    checks.push(failCheck("seo-meta-title", "SEO title", "SEO title is required before publish."));
  } else {
    checks.push(passCheck("seo-meta-title", "SEO title"));
  }
  if (!metaDescription) {
    checks.push(failCheck("seo-meta-description", "SEO description", "SEO description is required before publish."));
  } else {
    checks.push(passCheck("seo-meta-description", "SEO description"));
  }

  const ogImageUrl = seoValidation.valid ? seoValidation.seo.ogImageUrl : "";
  if (ogImageUrl) {
    const ogValidation = await validateImageUrlReachable(ogImageUrl);
    if (!ogValidation.valid) {
      checks.push(failCheck("seo-og-image", "OG image URL", ogValidation.error));
    } else {
      checks.push(passCheck("seo-og-image", "OG image URL"));
    }
  } else {
    checks.push(failCheck("seo-og-image", "OG image URL", "OG image URL is required before publish."));
  }

  const blocks = Array.isArray(page.blocks) ? page.blocks : [];
  if (blocks.length === 0) {
    checks.push(failCheck("blocks", "Page sections", "At least one page section is required."));
  } else {
    checks.push(passCheck("blocks", "Page sections"));
  }

  const invalidBlocks = [];
  blocks.forEach((block, index) => {
    const result = validateBlock(block);
    if (!result.valid) {
      invalidBlocks.push(`Block ${index + 1}: ${result.errors.join(", ")}`);
    }
  });
  if (invalidBlocks.length > 0) {
    checks.push(failCheck("blocks-schema", "Section schema validation", invalidBlocks.join(" | ")));
  } else {
    checks.push(passCheck("blocks-schema", "Section schema validation"));
  }

  const valid = checks.every((check) => check.status === "pass");
  return {
    ok: true,
    valid,
    checks,
    page,
  };
}
