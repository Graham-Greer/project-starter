const FIELD_LABEL_OVERRIDES = {
  primaryAction: "Primary CTA",
  secondaryAction: "Secondary CTA",
  href: "Link URL",
  ogImageUrl: "OG image URL",
  helperText: "Helper text",
};

const FIELD_HELP_TEXT_OVERRIDES = {
  eyebrow: "Short supporting line above the heading.",
  title: "Main heading users should read first.",
  description: "Supporting paragraph that explains the section.",
  primaryAction: "Main call to action button.",
  secondaryAction: "Secondary call to action button.",
  media: "Optional image or video supporting this section.",
  items: "Add one or more content items.",
  plans: "Add your pricing plans for this section.",
  members: "Add team members to display.",
  links: "Add navigation links to display.",
  columns: "Add columns to structure this section.",
  rows: "Add comparison rows for each feature.",
};

export function getDefaultValueForRule(rule = {}, isRequired = false) {
  if (!rule || !rule.type) return "";

  if (rule.type === "boolean") return false;
  if (rule.type === "string") {
    if (Array.isArray(rule.options) && rule.options.length > 0) {
      return rule.options[0];
    }
    return "";
  }
  if (rule.type === "array") {
    const itemRule = rule.item || { type: "string" };
    if (isRequired && typeof rule.minLength === "number" && rule.minLength > 0) {
      return Array.from({ length: rule.minLength }, () => getDefaultValueForRule(itemRule, true));
    }
    return [];
  }
  if (rule.type === "object") {
    if (!isRequired) {
      return undefined;
    }
    const fields = rule.fields || {};
    const requiredChildren = new Set(rule.required || []);
    const result = {};
    Object.entries(fields).forEach(([childFieldName, childRule]) => {
      result[childFieldName] = getDefaultValueForRule(childRule, requiredChildren.has(childFieldName));
    });
    return result;
  }
  return "";
}

export function getFieldLabel(fieldName = "") {
  if (FIELD_LABEL_OVERRIDES[fieldName]) {
    return FIELD_LABEL_OVERRIDES[fieldName];
  }
  return fieldName
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());
}

export function getFieldHelpText(fieldName, rule = {}) {
  if (FIELD_HELP_TEXT_OVERRIDES[fieldName]) {
    return FIELD_HELP_TEXT_OVERRIDES[fieldName];
  }
  if (rule.type === "array") return `${getFieldLabel(fieldName)} is a list field.`;
  if (rule.type === "object") return `${getFieldLabel(fieldName)} is a grouped field.`;
  if (rule.type === "boolean") return `Enable or disable ${getFieldLabel(fieldName).toLowerCase()}.`;
  return `Edit ${getFieldLabel(fieldName).toLowerCase()}.`;
}

export function formatVariantLabel(variant = "") {
  if (!variant) return "";
  return variant
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());
}

export function buildSchemaTemplate(schema) {
  const fields = schema?.fields || {};
  const required = new Set(schema?.required || []);
  const template = {};

  Object.entries(fields).forEach(([fieldName, rule]) => {
    template[fieldName] = getDefaultValueForRule(rule, required.has(fieldName));
  });

  return template;
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergePreviewProps(baseValue, seedValue) {
  if (seedValue === undefined) return baseValue;

  if (Array.isArray(seedValue)) {
    return seedValue;
  }

  if (isPlainObject(baseValue) && isPlainObject(seedValue)) {
    const merged = { ...baseValue };
    Object.keys(seedValue).forEach((key) => {
      merged[key] = mergePreviewProps(baseValue[key], seedValue[key]);
    });
    return merged;
  }

  return seedValue;
}

export function buildPageTree(pages = []) {
  const byParent = new Map();
  pages.forEach((page) => {
    const parentId = page.parentPageId || null;
    if (!byParent.has(parentId)) byParent.set(parentId, []);
    byParent.get(parentId).push(page);
  });

  const sortPages = (list) =>
    [...list].sort((a, b) => {
      const orderA = typeof a.order === "number" ? a.order : 0;
      const orderB = typeof b.order === "number" ? b.order : 0;
      if (orderA !== orderB) return orderA - orderB;
      return (a.title || "").localeCompare(b.title || "");
    });

  const makeNode = (page) => ({
    page,
    children: sortPages(byParent.get(page.id) || []).map(makeNode),
  });

  return sortPages(byParent.get(null) || []).map(makeNode);
}

export function collectDescendantPageIds(nodes = [], targetPageId, acc = new Set()) {
  const walk = (node, isInTargetBranch = false) => {
    const nextBranch = isInTargetBranch || node.page.id === targetPageId;
    if (nextBranch && node.page.id !== targetPageId) {
      acc.add(node.page.id);
    }
    node.children.forEach((childNode) => walk(childNode, nextBranch));
  };

  nodes.forEach((node) => walk(node, false));
  return acc;
}
