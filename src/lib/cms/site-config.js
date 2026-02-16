import "server-only";

const HEADER_VARIANTS = new Set(["simple", "minimal", "split-cta"]);
const HEADER_OVERLAY_MODES = new Set(["auto", "off"]);
const MOBILE_PATTERNS = new Set(["drawer"]);

function isValidHref(value) {
  if (typeof value !== "string") return false;
  const href = value.trim();
  if (!href) return false;
  return (
    href.startsWith("/") ||
    href.startsWith("#") ||
    href.startsWith("https://") ||
    href.startsWith("http://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

function normalizeAction(action) {
  if (!action || typeof action !== "object") return null;
  const label = typeof action.label === "string" ? action.label.trim() : "";
  const href = typeof action.href === "string" ? action.href.trim() : "";
  if (!label && !href) return null;
  return {
    label,
    href,
  };
}

function normalizeLogo(logo) {
  if (!logo || typeof logo !== "object") return null;
  const src = typeof logo.src === "string" ? logo.src.trim() : "";
  const alt = typeof logo.alt === "string" ? logo.alt.trim() : "";
  const assetId = typeof logo.assetId === "string" ? logo.assetId.trim() : "";
  if (!src) return null;
  return {
    src,
    alt,
    assetId,
  };
}

function toHeaderPresetId(value = "", index = 0) {
  const cleaned = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (cleaned) return cleaned.slice(0, 48);
  return `header-${index + 1}`;
}

function withStableUniqueIds(items) {
  const seen = new Set();
  return items.map((item, index) => {
    const rawId = item.id || `nav-${index + 1}`;
    let nextId = rawId;
    let suffix = 2;
    while (seen.has(nextId)) {
      nextId = `${rawId}-${suffix}`;
      suffix += 1;
    }
    seen.add(nextId);
    return { ...item, id: nextId };
  });
}

function normalizeNavItems(items = [], level = 0) {
  const normalized = items.map((item, index) => {
    const label = typeof item?.label === "string" ? item.label.trim() : "";
    const pageId = typeof item?.pageId === "string" ? item.pageId.trim() : "";
    const href = typeof item?.href === "string" ? item.href.trim() : "";
    const explicitType = typeof item?.type === "string" ? item.type.trim() : "";
    const type = explicitType || (pageId ? "page" : "url");
    const visible = typeof item?.visible === "boolean" ? item.visible : true;
    const openInNewTab = typeof item?.openInNewTab === "boolean" ? item.openInNewTab : false;
    const order = Number.isFinite(Number(item?.order)) ? Number(item.order) : index;
    const children = Array.isArray(item?.children) && level < 2
      ? normalizeNavItems(item.children, level + 1)
      : [];

    return {
      id: typeof item?.id === "string" ? item.id.trim() : "",
      label,
      type,
      pageId,
      href,
      visible,
      openInNewTab,
      order,
      children,
    };
  });

  const sorted = [...normalized].sort((a, b) => a.order - b.order);
  return withStableUniqueIds(sorted).map((item, index) => ({
    ...item,
    order: index,
  }));
}

function normalizeNavigationMenu(input, level = 0) {
  return normalizeNavItems(Array.isArray(input) ? input : [], level);
}

export function getDefaultHeaderConfig() {
  return {
    variant: "simple",
    overlayMode: "off",
    sticky: true,
    mobilePattern: "drawer",
    logo: null,
    primaryAction: null,
    secondaryAction: null,
  };
}

export function getDefaultHeaderPreset() {
  return {
    id: "header-default",
    name: "Default header",
    config: getDefaultHeaderConfig(),
  };
}

export function getDefaultNavigationConfig() {
  return {
    primary: [],
    footer: [],
    legal: [],
  };
}

export function normalizeHeaderConfig(input) {
  const defaults = getDefaultHeaderConfig();
  const source = input && typeof input === "object" ? input : {};
  const variant = HEADER_VARIANTS.has(source.variant) ? source.variant : defaults.variant;
  const overlayMode = HEADER_OVERLAY_MODES.has(source.overlayMode) ? source.overlayMode : defaults.overlayMode;
  const sticky = typeof source.sticky === "boolean" ? source.sticky : defaults.sticky;
  const mobilePattern = MOBILE_PATTERNS.has(source.mobilePattern) ? source.mobilePattern : defaults.mobilePattern;
  const logo = normalizeLogo(source.logo);
  const primaryAction = normalizeAction(source.primaryAction);
  const secondaryAction = normalizeAction(source.secondaryAction);

  return {
    variant,
    overlayMode,
    sticky,
    mobilePattern,
    logo,
    primaryAction,
    secondaryAction,
  };
}

function withStableUniqueHeaderIds(items) {
  const seen = new Set();
  return items.map((item, index) => {
    const rawId = toHeaderPresetId(item.id, index);
    let nextId = rawId;
    let suffix = 2;
    while (seen.has(nextId)) {
      nextId = `${rawId}-${suffix}`;
      suffix += 1;
    }
    seen.add(nextId);
    return { ...item, id: nextId };
  });
}

export function normalizeHeaderPresetsConfig(input, fallbackHeader = null) {
  const source = Array.isArray(input) ? input : [];
  const normalized = source.map((item, index) => {
    const itemSource = item && typeof item === "object" ? item : {};
    const name = typeof itemSource.name === "string" && itemSource.name.trim()
      ? itemSource.name.trim().slice(0, 80)
      : `Header ${index + 1}`;
    const configInput = itemSource.config || itemSource.header || itemSource;
    return {
      id: typeof itemSource.id === "string" ? itemSource.id.trim() : "",
      name,
      config: normalizeHeaderConfig(configInput),
    };
  });

  const withIds = withStableUniqueHeaderIds(normalized);
  if (withIds.length > 0) {
    return withIds;
  }

  const fallbackConfig = normalizeHeaderConfig(fallbackHeader || getDefaultHeaderConfig());
  return [
    {
      id: "header-default",
      name: "Default header",
      config: fallbackConfig,
    },
  ];
}

export function normalizeNavigationConfig(input) {
  const source = input && typeof input === "object" ? input : {};
  const primary = normalizeNavigationMenu(source.primary);
  const footer = normalizeNavigationMenu(source.footer);
  const legal = normalizeNavigationMenu(source.legal);
  return {
    primary,
    footer,
    legal,
  };
}

export function validateHeaderConfig(input) {
  if (!input || typeof input !== "object") {
    return { valid: false, error: "header must be an object." };
  }

  if (typeof input.variant !== "undefined" && !HEADER_VARIANTS.has(input.variant)) {
    return { valid: false, error: 'header.variant must be one of: "simple", "minimal", "split-cta".' };
  }
  if (typeof input.overlayMode !== "undefined" && !HEADER_OVERLAY_MODES.has(input.overlayMode)) {
    return { valid: false, error: 'header.overlayMode must be one of: "auto", "off".' };
  }
  if (typeof input.sticky !== "undefined" && typeof input.sticky !== "boolean") {
    return { valid: false, error: "header.sticky must be a boolean." };
  }
  if (typeof input.mobilePattern !== "undefined" && !MOBILE_PATTERNS.has(input.mobilePattern)) {
    return { valid: false, error: 'header.mobilePattern must be "drawer".' };
  }

  const actions = [
    { key: "primaryAction", value: input.primaryAction },
    { key: "secondaryAction", value: input.secondaryAction },
  ];

  if (typeof input.logo !== "undefined" && input.logo !== null) {
    if (typeof input.logo !== "object") {
      return { valid: false, error: "header.logo must be an object." };
    }
    const src = typeof input.logo.src === "string" ? input.logo.src.trim() : "";
    const alt = typeof input.logo.alt === "string" ? input.logo.alt.trim() : "";
    if (!src) {
      return { valid: false, error: "header.logo.src is required when logo is set." };
    }
    if (!isValidHref(src)) {
      return { valid: false, error: "header.logo.src must be a valid URL or path." };
    }
    if (src.startsWith("http://")) {
      return { valid: false, error: "header.logo.src must use https for external URLs." };
    }
    if (!alt) {
      return { valid: false, error: "header.logo.alt is required for image accessibility." };
    }
  }

  for (const action of actions) {
    if (typeof action.value === "undefined" || action.value === null) continue;
    if (typeof action.value !== "object") {
      return { valid: false, error: `header.${action.key} must be an object.` };
    }
    const label = typeof action.value.label === "string" ? action.value.label.trim() : "";
    const href = typeof action.value.href === "string" ? action.value.href.trim() : "";
    if ((label && !href) || (!label && href)) {
      return { valid: false, error: `header.${action.key} requires both label and href when set.` };
    }
    if (href && !isValidHref(href)) {
      return { valid: false, error: `header.${action.key}.href must be a valid URL or path.` };
    }
  }

  return { valid: true, value: normalizeHeaderConfig(input) };
}

export function validateHeaderPresetsConfig(input) {
  if (!Array.isArray(input)) {
    return { valid: false, error: "headers must be an array." };
  }

  if (input.length === 0) {
    return { valid: false, error: "headers must contain at least one preset." };
  }

  const normalized = normalizeHeaderPresetsConfig(input);
  for (const preset of normalized) {
    if (!preset.name || typeof preset.name !== "string") {
      return { valid: false, error: "Each header preset requires a name." };
    }
    const configValidation = validateHeaderConfig(preset.config);
    if (!configValidation.valid) {
      return { valid: false, error: `Header preset "${preset.name}" is invalid: ${configValidation.error}` };
    }
  }

  return { valid: true, value: normalized };
}

export function validateNavigationConfig(input) {
  if (!input || typeof input !== "object") {
    return { valid: false, error: "navigation must be an object." };
  }
  const menuKeys = ["primary", "footer", "legal"];
  for (const key of menuKeys) {
    if (typeof input[key] !== "undefined" && !Array.isArray(input[key])) {
      return { valid: false, error: `navigation.${key} must be an array.` };
    }
  }

  const normalized = normalizeNavigationConfig(input);
  const validateItem = (item) => {
    if (!item.label) {
      return { valid: false, error: `navigation item "${item.id}" requires label.` };
    }
    if (item.type !== "page" && item.type !== "url") {
      return { valid: false, error: `navigation item "${item.id}" has invalid type.` };
    }
    if (item.type === "page" && !item.pageId) {
      return { valid: false, error: `navigation item "${item.id}" requires pageId when type is "page".` };
    }
    if (item.type === "url") {
      if (!item.href) {
        return { valid: false, error: `navigation item "${item.id}" requires href when type is "url".` };
      }
      if (!isValidHref(item.href)) {
        return { valid: false, error: `navigation item "${item.id}" has invalid href.` };
      }
    }
    if (item.children?.length) {
      for (const child of item.children) {
        const childValidation = validateItem(child);
        if (!childValidation.valid) return childValidation;
      }
    }
    return { valid: true };
  };

  for (const key of menuKeys) {
    for (const item of normalized[key] || []) {
      const result = validateItem(item);
      if (!result.valid) return result;
    }
  }

  return { valid: true, value: normalized };
}

export function resolveSiteRuntimeConfig(site) {
  const headers = normalizeHeaderPresetsConfig(site?.headers, site?.header);
  const requestedActiveHeaderId = typeof site?.activeHeaderId === "string" ? site.activeHeaderId.trim() : "";
  const hasRequestedHeader = headers.some((preset) => preset.id === requestedActiveHeaderId);
  const activeHeaderId = hasRequestedHeader ? requestedActiveHeaderId : headers[0].id;
  const activeHeaderConfig = headers.find((preset) => preset.id === activeHeaderId)?.config || getDefaultHeaderConfig();

  return {
    header: normalizeHeaderConfig(activeHeaderConfig),
    headers,
    activeHeaderId,
    navigation: normalizeNavigationConfig(site?.navigation),
  };
}
