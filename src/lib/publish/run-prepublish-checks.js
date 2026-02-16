import { validateBlock } from "@/lib/validation";
import { collectAssetReferences } from "@/lib/cms/media-references";
import { resolveSiteRuntimeConfig, validateHeaderConfig, validateHeaderPresetsConfig, validateNavigationConfig } from "@/lib/cms/site-config";
import { validateImageUrlReachable, validateSeoPayload } from "@/lib/validation/seo";

function passCheck(id, label, message = "Passed") {
  return { id, label, status: "pass", message };
}

function failCheck(id, label, message) {
  return { id, label, status: "fail", message };
}

function toFriendlyFieldPath(rawPath = "") {
  if (typeof rawPath !== "string") return "Field";
  const trimmed = rawPath.replace(/^props\./, "").trim();
  if (!trimmed) return "Field";
  return trimmed
    .replace(/\[(\d+)\]/g, (_match, index) => ` item ${Number(index) + 1}`)
    .split(".")
    .map((part) => part.replace(/([a-z])([A-Z])/g, "$1 $2"))
    .join(" > ");
}

function toFriendlyBlockError(rawError = "") {
  if (typeof rawError !== "string") return "Invalid section content.";
  const text = rawError.trim();

  const requiredMatch = text.match(/^(.+)\s+is required$/i);
  if (requiredMatch) {
    return `${toFriendlyFieldPath(requiredMatch[1])}: required.`;
  }

  const maxLengthMatch = text.match(/^(.+)\s+must be <=\s*(\d+)\s+characters$/i);
  if (maxLengthMatch) {
    return `${toFriendlyFieldPath(maxLengthMatch[1])}: use ${maxLengthMatch[2]} characters or fewer.`;
  }

  const oneOfMatch = text.match(/^(.+)\s+must be one of:\s+(.+)$/i);
  if (oneOfMatch) {
    return `${toFriendlyFieldPath(oneOfMatch[1])}: select one of the available options (${oneOfMatch[2]}).`;
  }

  const typeMatch = text.match(/^(.+)\s+must be (.+)$/i);
  if (typeMatch) {
    return `${toFriendlyFieldPath(typeMatch[1])}: ${typeMatch[2]}.`;
  }

  return text;
}

function toSectionLabel(block = {}, index = 0) {
  const sectionType = typeof block?.sectionType === "string" ? block.sectionType.trim() : "";
  const variant = typeof block?.variant === "string" ? block.variant.trim() : "";
  if (sectionType && variant) return `Section ${index + 1} (${sectionType} - ${variant})`;
  if (sectionType) return `Section ${index + 1} (${sectionType})`;
  return `Section ${index + 1}`;
}

export async function runPrePublishChecks({ cms, siteId, pageId }) {
  const site = await cms.sites.getSiteById(siteId);
  if (!site) {
    return {
      ok: false,
      error: `Site "${siteId}" not found.`,
      statusCode: 404,
    };
  }

  const page = await cms.pages.getPage(siteId, pageId);
  if (!page) {
    return {
      ok: false,
      error: `Page "${pageId}" not found.`,
      statusCode: 404,
    };
  }

  const checks = [];
  const runtimeConfig = resolveSiteRuntimeConfig(site);

  const headerPresetsValidation = validateHeaderPresetsConfig(runtimeConfig.headers || []);
  const activeHeaderValidation = validateHeaderConfig(runtimeConfig.header || {});
  if (!headerPresetsValidation.valid) {
    checks.push(failCheck("header-config", "Header configuration", headerPresetsValidation.error));
  } else if (!activeHeaderValidation.valid) {
    checks.push(failCheck("header-config", "Header configuration", activeHeaderValidation.error));
  } else {
    checks.push(passCheck("header-config", "Header configuration"));
  }

  const rawNavItems = [
    ...(Array.isArray(site?.navigation?.primary) ? site.navigation.primary : []),
    ...(Array.isArray(site?.navigation?.footer) ? site.navigation.footer : []),
    ...(Array.isArray(site?.navigation?.legal) ? site.navigation.legal : []),
  ];
  const duplicateNavIds = (() => {
    const seen = new Set();
    const duplicates = new Set();
    rawNavItems.forEach((item) => {
      const id = typeof item?.id === "string" ? item.id.trim() : "";
      if (!id) return;
      if (seen.has(id)) duplicates.add(id);
      seen.add(id);
    });
    return Array.from(duplicates);
  })();

  const navigationValidation = validateNavigationConfig(site.navigation || {});
  if (!navigationValidation.valid) {
    checks.push(failCheck("navigation-config", "Navigation configuration", navigationValidation.error));
  } else if (duplicateNavIds.length > 0) {
    checks.push(
      failCheck(
        "navigation-config",
        "Navigation configuration",
        `Duplicate navigation item IDs found: ${duplicateNavIds.join(", ")}.`
      )
    );
  } else {
    checks.push(passCheck("navigation-config", "Navigation configuration"));
  }

  const navTargetIssues = [];
  if (navigationValidation.valid && duplicateNavIds.length === 0) {
    const pages = await cms.pages.listSitePages(siteId);
    const pageIdSet = new Set((Array.isArray(pages) ? pages : []).map((item) => item.id));
    const visibleItems = [
      ...(navigationValidation.value.primary || []),
      ...(navigationValidation.value.footer || []),
      ...(navigationValidation.value.legal || []),
    ].filter((item) => item.visible !== false);

    visibleItems.forEach((item) => {
      if (item.type === "page" && item.pageId && !pageIdSet.has(item.pageId)) {
        navTargetIssues.push(
          `"${item.label || item.id}" points to missing page "${item.pageId}".`
        );
      }
      if (item.type === "page" && !item.pageId) {
        navTargetIssues.push(`"${item.label || item.id}" is missing a page target.`);
      }
      if (item.type === "url" && !item.href) {
        navTargetIssues.push(`"${item.label || item.id}" is missing a URL target.`);
      }
    });
  }

  if (navTargetIssues.length > 0) {
    checks.push(failCheck("navigation-links", "Navigation link targets", navTargetIssues.join(" | ")));
  } else {
    checks.push(passCheck("navigation-links", "Navigation link targets"));
  }

  if (page?.headerMode === "override") {
    const presetId = typeof page?.headerPresetId === "string" ? page.headerPresetId.trim() : "";
    const exists = (runtimeConfig.headers || []).some((preset) => preset.id === presetId);
    if (!presetId || !exists) {
      checks.push(failCheck("page-header-override", "Page header override", "Selected page header preset is missing or invalid."));
    } else {
      checks.push(passCheck("page-header-override", "Page header override"));
    }
  } else {
    checks.push(passCheck("page-header-override", "Page header override"));
  }

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
  const ogImageAssetId = seoValidation.valid ? seoValidation.seo.ogImageAssetId : "";
  if (ogImageUrl && !ogImageAssetId) {
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
      const label = toSectionLabel(block, index);
      const formattedErrors = result.errors.map((error) => toFriendlyBlockError(error));
      invalidBlocks.push(`${label}: ${formattedErrors.join(" ")}`);
    }
  });
  if (invalidBlocks.length > 0) {
    checks.push(failCheck("blocks-schema", "Section schema validation", invalidBlocks.join(" | ")));
  } else {
    checks.push(passCheck("blocks-schema", "Section schema validation"));
  }

  const rawAssetRefs = collectAssetReferences({ site, page, includeHeaderPresets: true });
  const uniqueRefs = Array.from(
    rawAssetRefs.reduce((map, ref) => {
      const key = `${ref.assetId}::${ref.source}::${ref.detail}`;
      if (!map.has(key)) map.set(key, ref);
      return map;
    }, new Map()).values()
  );

  const missingAssets = [];
  const invalidScopeAssets = [];
  const invalidTypeAssets = [];
  const resolvedRefs = await Promise.all(
    uniqueRefs.map(async (ref) => ({
      ref,
      asset: await cms.assets.getAssetById(ref.assetId),
    }))
  );

  resolvedRefs.forEach(({ ref, asset }) => {
    if (!asset) {
      missingAssets.push(`${ref.detail}: selected media is missing. Re-select it from Media library.`);
      return;
    }
    if (asset.workspaceId !== site.workspaceId || asset.siteId !== siteId) {
      invalidScopeAssets.push(`${ref.detail}: selected media belongs to a different site. Choose media uploaded to this site.`);
      return;
    }
    if (ref.source === "page-seo" && !String(asset.contentType || "").startsWith("image/")) {
      invalidTypeAssets.push(`${ref.detail}: must use an image file.`);
    }
  });

  const mediaReferenceIssues = [...missingAssets, ...invalidScopeAssets, ...invalidTypeAssets];
  if (mediaReferenceIssues.length > 0) {
    checks.push(failCheck("media-assets", "Media asset references", mediaReferenceIssues.join(" | ")));
  } else {
    checks.push(passCheck("media-assets", "Media asset references"));
  }

  const valid = checks.every((check) => check.status === "pass");
  return {
    ok: true,
    valid,
    checks,
    page,
  };
}
