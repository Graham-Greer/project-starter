import { useState } from "react";
import { Button } from "@/components/ui";
import MediaPicker from "@/components/cms/MediaPicker";
import { getDefaultValueForRule, getFieldHelpText, getFieldLabel } from "@/lib/cms/cms-utils";

const GUIDED_FIELD_PRESETS = {
  "hero.centered": {
    core: ["eyebrow", "title", "description"],
    optional: ["primaryAction", "secondaryAction", "media"],
  },
  "hero.split": {
    core: ["title", "description"],
    optional: ["primaryAction", "secondaryAction", "media", "reverse"],
  },
  "featureSplit.mediaLeft": {
    core: ["title", "description"],
    optional: ["primaryAction", "secondaryAction", "media"],
  },
  "featureSplit.mediaRight": {
    core: ["title", "description"],
    optional: ["primaryAction", "secondaryAction", "media"],
  },
  "cta.centered": {
    core: ["eyebrow", "title", "description"],
    optional: ["primaryAction", "secondaryAction"],
  },
  "cta.split": {
    core: ["title", "description"],
    optional: ["primaryAction", "secondaryAction"],
  },
  "pricing.3-tier": {
    core: ["eyebrow", "title", "description", "plans"],
    optional: [],
  },
  "pricing.enterprise": {
    core: ["eyebrow", "title", "description", "plans"],
    optional: ["enterpriseNote"],
  },
  "testimonials.grid": {
    core: ["eyebrow", "title", "description", "items"],
    optional: [],
  },
  "testimonials.spotlight": {
    core: ["eyebrow", "title", "description", "items"],
    optional: ["highlight"],
  },
  "faq.compact": {
    core: ["eyebrow", "title", "description", "items"],
    optional: [],
  },
  "faq.detailed": {
    core: ["title", "description", "items"],
    optional: ["helperText"],
  },
  "team.grid": {
    core: ["eyebrow", "title", "description", "members"],
    optional: [],
  },
  "team.lead": {
    core: ["eyebrow", "title", "description", "lead", "members"],
    optional: [],
  },
  "stats.row": {
    core: ["eyebrow", "title", "description", "items"],
    optional: [],
  },
  "stats.cards": {
    core: ["eyebrow", "title", "description", "items"],
    optional: [],
  },
  "featureComparison.compact": {
    core: ["eyebrow", "title", "description", "columns", "rows"],
    optional: [],
  },
  "featureComparison.detailed": {
    core: ["eyebrow", "title", "description", "columns", "rows"],
    optional: [],
  },
  "footer.simple": {
    core: ["links"],
    optional: ["copyright"],
  },
  "footer.columns": {
    core: ["brand", "columns"],
    optional: ["description", "legal"],
  },
  "footerCta.centered": {
    core: ["title", "description", "primaryAction"],
    optional: ["secondaryAction"],
  },
  "footerCta.split": {
    core: ["title", "description", "primaryAction"],
    optional: ["secondaryAction"],
  },
};

const OPTIONAL_ACTION_LABELS = {
  primaryAction: "Add primary CTA",
  secondaryAction: "Add secondary CTA",
  media: "Add media",
  reverse: "Enable reverse layout",
  enterpriseNote: "Add enterprise note",
  highlight: "Add spotlight highlight",
  helperText: "Add helper text",
  legal: "Add legal links",
  description: "Add description",
  copyright: "Add copyright",
};

function buildIsMultilineField(fieldName = "") {
  return /description|content|note|summary|quote|bio|copyright/i.test(fieldName);
}

function updateArrayItemValue(currentValue, index, nextItemValue, onChange) {
  const currentArray = Array.isArray(currentValue) ? currentValue : [];
  const nextArray = [...currentArray];
  nextArray[index] = nextItemValue;
  onChange(nextArray);
}

function removeArrayItemValue(currentValue, index, onChange) {
  const currentArray = Array.isArray(currentValue) ? currentValue : [];
  onChange(currentArray.filter((_, itemIndex) => itemIndex !== index));
}

function addArrayItemValue(currentValue, rule, onChange) {
  const currentArray = Array.isArray(currentValue) ? currentValue : [];
  const itemRule = rule?.item || { type: "string" };
  const nextItem = getDefaultValueForRule(itemRule, true);

  if (itemRule?.type === "object" && itemRule?.fields?.id?.type === "string") {
    const normalizedItem = (nextItem && typeof nextItem === "object" && !Array.isArray(nextItem)) ? nextItem : {};
    if (!String(normalizedItem.id || "").trim()) {
      normalizedItem.id = `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
    onChange([...currentArray, normalizedItem]);
    return;
  }

  onChange([...currentArray, nextItem]);
}

function addDynamicObjectEntry(currentValue, rule, onChange) {
  const currentObject = (currentValue && typeof currentValue === "object" && !Array.isArray(currentValue)) ? currentValue : {};
  const nextIndex = Object.keys(currentObject).length + 1;
  const nextKey = `key${nextIndex}`;
  const additionalRule = rule?.additionalProperties || { type: "string" };
  onChange({
    ...currentObject,
    [nextKey]: getDefaultValueForRule(additionalRule, true),
  });
}

function removeDynamicObjectEntry(currentValue, dynamicKey, onChange) {
  const currentObject = (currentValue && typeof currentValue === "object" && !Array.isArray(currentValue)) ? currentValue : {};
  const nextObject = { ...currentObject };
  delete nextObject[dynamicKey];
  onChange(nextObject);
}

function updateDynamicObjectKey(currentValue, oldKey, nextKey, onChange) {
  const trimmedKey = nextKey.trim();
  if (!trimmedKey || trimmedKey === oldKey) return;
  const currentObject = (currentValue && typeof currentValue === "object" && !Array.isArray(currentValue)) ? currentValue : {};
  if (Object.hasOwn(currentObject, trimmedKey)) return;
  const nextObject = {};
  Object.entries(currentObject).forEach(([existingKey, existingValue]) => {
    nextObject[existingKey === oldKey ? trimmedKey : existingKey] = existingValue;
  });
  onChange(nextObject);
}

function isMissingRequiredValue(value, rule) {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized === "" || normalized.toLowerCase() === "placeholder";
  }
  if (rule?.type === "array") return !Array.isArray(value) || value.length === 0;
  return false;
}

function shouldValidateAsUrl(fieldPath) {
  return /(^|\.)(href|url|src|videoSrc|poster)$/.test(fieldPath || "");
}

function isMediaSourceFieldPath(fieldPath = "") {
  return /(^|\.)(src|videoSrc|poster|ogImageUrl)$/.test(fieldPath || "");
}

function isValidUrlLike(value = "") {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return true;
  return /^https:\/\/[^\s]+$/i.test(trimmed);
}

function addFieldError(errorMap, fieldPath, message) {
  if (!fieldPath || !message) return;
  if (!errorMap[fieldPath]) errorMap[fieldPath] = [];
  errorMap[fieldPath].push(message);
}

function buildFieldValidationMap(fieldValue, rule, fieldPath, isRequired, errorMap) {
  if (!fieldPath || !rule) return;

  if (isRequired && isMissingRequiredValue(fieldValue, rule)) {
    addFieldError(errorMap, fieldPath, "This field is required.");
  }

  if (fieldValue === undefined || fieldValue === null) return;

  if (rule.type === "string") {
    const safeValue = typeof fieldValue === "string" ? fieldValue : "";
    if (typeof fieldValue !== "string") {
      addFieldError(errorMap, fieldPath, "This field must be text.");
      return;
    }
    if (typeof rule.maxLength === "number" && safeValue.length > rule.maxLength) {
      addFieldError(errorMap, fieldPath, `Use ${rule.maxLength} characters or fewer.`);
    }
    if (Array.isArray(rule.options) && rule.options.length > 0 && !rule.options.includes(safeValue)) {
      addFieldError(errorMap, fieldPath, "Select one of the available options.");
    }
    if (shouldValidateAsUrl(fieldPath) && safeValue.trim() && !isValidUrlLike(safeValue)) {
      addFieldError(errorMap, fieldPath, "Use a valid URL (https://...) or site path (/...).");
    }
    return;
  }

  if (rule.type === "boolean") return;

  if (rule.type === "array") {
    if (!Array.isArray(fieldValue)) {
      addFieldError(errorMap, fieldPath, "This field must be a list.");
      return;
    }
    if (typeof rule.minLength === "number" && fieldValue.length < rule.minLength) {
      addFieldError(errorMap, fieldPath, `Add at least ${rule.minLength} item(s).`);
    }
    if (rule.item) {
      fieldValue.forEach((itemValue, index) => {
        buildFieldValidationMap(itemValue, rule.item, `${fieldPath}[${index}]`, true, errorMap);
      });
    }
    return;
  }

  if (rule.type === "object") {
    const safeValue = (fieldValue && typeof fieldValue === "object" && !Array.isArray(fieldValue)) ? fieldValue : null;
    if (!safeValue) {
      addFieldError(errorMap, fieldPath, "This field must be an object.");
      return;
    }

    if (rule.fields && typeof rule.fields === "object") {
      const requiredChildren = new Set(rule.required || []);
      Object.entries(rule.fields)
        .filter(([childFieldName]) => childFieldName !== "id")
        .forEach(([childFieldName, childRule]) => {
          buildFieldValidationMap(
            safeValue[childFieldName],
            childRule,
            `${fieldPath}.${childFieldName}`,
            requiredChildren.has(childFieldName),
            errorMap
          );
        });
    }

    if (rule.additionalProperties && safeValue && typeof safeValue === "object") {
      Object.entries(safeValue).forEach(([dynamicKey, dynamicValue]) => {
        buildFieldValidationMap(dynamicValue, rule.additionalProperties, `${fieldPath}.${dynamicKey}`, true, errorMap);
      });
    }
  }
}

function renderStandardField(
  styles,
  fieldName,
  rule,
  fieldValue,
  isRequired,
  onChange,
  keyPrefix = "root",
  fieldPath = fieldName,
  fieldErrorMap = {},
  onOpenMediaPicker = null
) {
  const fieldLabel = getFieldLabel(fieldName);
  const fieldKey = `${keyPrefix}-${fieldName}`;
  const fieldErrors = fieldErrorMap[fieldPath] || [];
  const hasError = fieldErrors.length > 0;

  if (rule.type === "boolean") {
    return (
      <label className={styles.checkboxLabel} key={fieldKey}>
        <input
          type="checkbox"
          checked={Boolean(fieldValue)}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>{fieldLabel}</span>
      </label>
    );
  }

  if (rule.type === "string") {
    const hasOptions = Array.isArray(rule.options) && rule.options.length > 0;
    const safeValue = typeof fieldValue === "string" ? fieldValue : "";
    const useTextarea = buildIsMultilineField(fieldName);

    return (
      <label className={styles.label} key={fieldKey}>
        {fieldLabel} {isRequired ? "(Required)" : ""}
        {hasOptions ? (
          <select
            className={`${styles.input} ${hasError ? styles.inputError : ""}`.trim()}
            value={safeValue || rule.options[0]}
            onChange={(event) => onChange(event.target.value)}
          >
            {rule.options.map((option) => (
              <option key={`${fieldKey}-opt-${option}`} value={option}>
                {getFieldLabel(option)}
              </option>
            ))}
          </select>
        ) : useTextarea ? (
          <textarea
            className={`${styles.textarea} ${hasError ? styles.textareaError : ""}`.trim()}
            value={safeValue}
            maxLength={typeof rule.maxLength === "number" ? rule.maxLength : undefined}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : (
          <>
            <input
              className={`${styles.input} ${hasError ? styles.inputError : ""}`.trim()}
              type="text"
              value={safeValue}
              maxLength={typeof rule.maxLength === "number" ? rule.maxLength : undefined}
              onChange={(event) => onChange(event.target.value)}
            />
            {typeof onOpenMediaPicker === "function" && isMediaSourceFieldPath(fieldPath) ? (
              <div className={styles.row}>
                <Button type="button" size="sm" variant="secondary" onClick={() => onOpenMediaPicker(fieldPath)}>
                  Choose from media library
                </Button>
              </div>
            ) : null}
          </>
        )}
        <span className={styles.helpText}>
          {getFieldHelpText(fieldName, rule)}
          {typeof rule.maxLength === "number" ? ` ${safeValue.length}/${rule.maxLength}` : ""}
        </span>
        {hasError ? <span className={styles.fieldError}>{fieldErrors[0]}</span> : null}
      </label>
    );
  }

  if (rule.type === "object") {
    const objectValue = (fieldValue && typeof fieldValue === "object" && !Array.isArray(fieldValue)) ? fieldValue : {};
    const childEntries = Object.entries(rule.fields || {}).filter(([childFieldName]) => childFieldName !== "id");
    const hasDynamicEntries = !childEntries.length && rule.additionalProperties;

    if (hasDynamicEntries) {
      return (
        <div className={styles.form} key={fieldKey}>
          <p className={styles.listTitle}>{fieldLabel} {isRequired ? "(Required)" : ""}</p>
          {hasError ? <p className={styles.fieldError}>{fieldErrors[0]}</p> : null}
          {Object.entries(objectValue).length === 0 ? (
            <p className={styles.helpText}>No entries added yet. Use Add entry to create the first item.</p>
          ) : null}
          {Object.entries(objectValue).map(([dynamicKey, dynamicValue], index) => (
            <div className={styles.listItem} key={`${fieldKey}-dyn-${dynamicKey}-${index}`}>
              <label className={styles.label}>
                Key
                <input
                  className={styles.input}
                  type="text"
                  value={dynamicKey}
                  onChange={(event) => updateDynamicObjectKey(objectValue, dynamicKey, event.target.value, onChange)}
                />
              </label>
              {renderStandardField(
                styles,
                "value",
                rule.additionalProperties,
                dynamicValue,
                false,
                (nextValue) => onChange({ ...objectValue, [dynamicKey]: nextValue }),
                `${fieldKey}-dyn-value-${index}`,
                `${fieldPath}.${dynamicKey}`,
                fieldErrorMap,
                onOpenMediaPicker
              )}
              <div className={styles.row}>
                <Button variant="secondary" size="sm" tone="danger" onClick={() => removeDynamicObjectEntry(objectValue, dynamicKey, onChange)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <div className={styles.row}>
            <Button variant="secondary" size="sm" onClick={() => addDynamicObjectEntry(objectValue, rule, onChange)}>
              Add entry
            </Button>
          </div>
        </div>
      );
    }

    if (!childEntries.length) {
      return (
        <label className={styles.label} key={fieldKey}>
          {fieldLabel} ({rule.type || "unknown"}) {isRequired ? "(Required)" : ""}
          <span className={styles.helpText}>This is a complex field. Use Advanced mode for full editing.</span>
        </label>
      );
    }

    return (
      <div className={styles.form} key={fieldKey}>
        <p className={styles.listTitle}>{fieldLabel} {isRequired ? "(Required)" : ""}</p>
        {hasError ? <p className={styles.fieldError}>{fieldErrors[0]}</p> : null}
        {childEntries.map(([childFieldName, childRule]) => {
          const childRequired = Array.isArray(rule.required) && rule.required.includes(childFieldName);
          return renderStandardField(
            styles,
            childFieldName,
            childRule,
            objectValue[childFieldName],
            childRequired,
            (nextChildValue) => onChange({ ...objectValue, [childFieldName]: nextChildValue }),
            fieldKey,
            `${fieldPath}.${childFieldName}`,
            fieldErrorMap,
            onOpenMediaPicker
          );
        })}
      </div>
    );
  }

  if (rule.type === "array") {
    const arrayValue = Array.isArray(fieldValue) ? fieldValue : [];
    const itemRule = rule.item || { type: "string" };

    return (
      <div className={styles.form} key={fieldKey}>
        <p className={styles.listTitle}>{fieldLabel} {isRequired ? "(Required)" : ""}</p>
        {hasError ? <p className={styles.fieldError}>{fieldErrors[0]}</p> : null}
        {arrayValue.length === 0 ? (
          <p className={styles.helpText}>No items added yet. Use Add item to create the first entry.</p>
        ) : null}
        {arrayValue.map((itemValue, index) => (
          <div className={styles.listItem} key={`${fieldKey}-item-${index}`}>
            {renderStandardField(
              styles,
              `${fieldLabel} Item ${index + 1}`,
              itemRule,
              itemValue,
              false,
              (nextItemValue) => updateArrayItemValue(arrayValue, index, nextItemValue, onChange),
              fieldKey,
              `${fieldPath}[${index}]`,
              fieldErrorMap,
              onOpenMediaPicker
            )}
            <div className={styles.row}>
              <Button
                variant="secondary"
                size="sm"
                tone="danger"
                disabled={typeof rule.minLength === "number" && arrayValue.length <= rule.minLength}
                onClick={() => removeArrayItemValue(arrayValue, index, onChange)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        <div className={styles.row}>
          <Button variant="secondary" size="sm" onClick={() => addArrayItemValue(arrayValue, rule, onChange)}>
            Add item
          </Button>
        </div>
        <span className={styles.helpText}>
          {getFieldHelpText(fieldName, rule)}
          {typeof rule.minLength === "number" ? ` Minimum ${rule.minLength} items.` : ""}
        </span>
      </div>
    );
  }

  return (
    <label className={styles.label} key={fieldKey}>
      {fieldLabel} ({rule.type || "unknown"}) {isRequired ? "(Required)" : ""}
      <span className={styles.helpText}>This field type is not yet supported in Standard mode.</span>
    </label>
  );
}

function hasMeaningfulValue(value, rule) {
  if (value === undefined || value === null) return false;
  if (!rule || !rule.type) return Boolean(value);
  if (rule.type === "string") return String(value).trim().length > 0;
  if (rule.type === "boolean") return Boolean(value);
  if (rule.type === "array") return Array.isArray(value) && value.length > 0;
  if (rule.type === "object") {
    if (typeof value !== "object" || Array.isArray(value)) return false;
    if (rule.fields && Object.keys(rule.fields).length > 0) {
      return Object.entries(rule.fields).some(([childName, childRule]) => hasMeaningfulValue(value[childName], childRule));
    }
    return Object.keys(value).length > 0;
  }
  return Boolean(value);
}

function getOptionalFieldInitialValue(rule) {
  if (rule?.type === "boolean") return true;
  return getDefaultValueForRule(rule, true);
}

function buildFieldOrder(entries = [], order = []) {
  if (!Array.isArray(entries) || entries.length === 0) return [];
  if (!Array.isArray(order) || order.length === 0) return [...entries];
  const orderMap = new Map(order.map((fieldName, index) => [fieldName, index]));
  return [...entries].sort(([a], [b]) => {
    const aIndex = orderMap.has(a) ? orderMap.get(a) : Number.MAX_SAFE_INTEGER;
    const bIndex = orderMap.has(b) ? orderMap.get(b) : Number.MAX_SAFE_INTEGER;
    if (aIndex !== bIndex) return aIndex - bIndex;
    return a.localeCompare(b);
  });
}

function formatVariantLabel(variant = "") {
  return variant
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseFieldPath(path = "") {
  const tokens = [];
  String(path || "")
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean)
    .forEach((token) => {
      if (/^\d+$/.test(token)) {
        tokens.push(Number(token));
      } else {
        tokens.push(token);
      }
    });
  return tokens;
}

function cloneForUpdate(value) {
  if (Array.isArray(value)) return [...value];
  if (value && typeof value === "object") return { ...value };
  return {};
}

function setDeepValue(target, pathTokens, nextValue) {
  if (!pathTokens.length) return nextValue;
  const [head, ...tail] = pathTokens;
  const base = cloneForUpdate(target);

  if (tail.length === 0) {
    base[head] = nextValue;
    return base;
  }

  const existingChild = base[head];
  const childContainer = typeof tail[0] === "number"
    ? (Array.isArray(existingChild) ? [...existingChild] : [])
    : (existingChild && typeof existingChild === "object" && !Array.isArray(existingChild) ? { ...existingChild } : {});

  base[head] = setDeepValue(childContainer, tail, nextValue);
  return base;
}

function getDeepValue(target, pathTokens) {
  return pathTokens.reduce((acc, token) => {
    if (acc === null || typeof acc === "undefined") return undefined;
    return acc[token];
  }, target);
}

export default function BlockPropsEditorPanel({
  styles,
  workspaceId,
  siteId,
  selectedBlock,
  hasUnsavedBlockChanges,
  editorMode,
  setEditorMode,
  selectedBlockFields,
  selectedBlockRequiredFields,
  handleUpdateSelectedBlockProps,
  advancedPropsInputRef,
  selectedBlockJson,
  handleApplyAdvancedProps,
  handleFormatAdvancedPropsInput,
  handleResetAdvancedPropsToSchema,
  selectedBlockTemplateJson,
  propsEditorMessage,
  selectedBlockApiValidationErrors = {},
  handleSaveBlocks,
  handleCancelSelectedBlockEdits,
  saveNotice,
}) {
  const [optionalVisibilityOverrides, setOptionalVisibilityOverrides] = useState({});
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerFieldPath, setMediaPickerFieldPath] = useState("");

  const presetKey = selectedBlock ? `${selectedBlock.sectionType}.${selectedBlock.variant}` : "";
  const guidedPreset = GUIDED_FIELD_PRESETS[presetKey] || null;
  const corePriorityFields = guidedPreset?.core || ["eyebrow", "title", "description"];
  const optionalPriorityFields = guidedPreset?.optional || [];
  const selectedBlockProps = selectedBlock?.props || {};

  const coreFieldEntries = selectedBlockFields.filter(
    ([fieldName]) => fieldName !== "id" && (corePriorityFields.includes(fieldName) || selectedBlockRequiredFields.has(fieldName))
  );

  const optionalFieldEntries = selectedBlockFields.filter(
    ([fieldName]) => fieldName !== "id" && !corePriorityFields.includes(fieldName) && !selectedBlockRequiredFields.has(fieldName)
  );

  const orderedCoreFieldEntries = buildFieldOrder(coreFieldEntries, corePriorityFields);
  const orderedOptionalFieldEntries = buildFieldOrder(optionalFieldEntries, optionalPriorityFields);

  const getOptionalFieldKey = (fieldName) => `${selectedBlock?.id || "none"}::${fieldName}`;
  const isOptionalFieldVisible = (fieldName, rule) => {
    const override = optionalVisibilityOverrides[getOptionalFieldKey(fieldName)];
    if (override === true) return true;
    if (override === false) return false;
    return hasMeaningfulValue(selectedBlockProps[fieldName], rule);
  };

  const visibleOptionalFieldEntries = orderedOptionalFieldEntries.filter(([fieldName, rule]) =>
    isOptionalFieldVisible(fieldName, rule)
  );
  const hiddenOptionalFieldEntries = orderedOptionalFieldEntries.filter(([fieldName, rule]) =>
    !isOptionalFieldVisible(fieldName, rule)
  );
  const selectedSectionLabel = selectedBlock
    ? `${getFieldLabel(selectedBlock.sectionType || "Section")} - ${formatVariantLabel(selectedBlock.variant || "Variant")}`
    : "";
  const standardValidationErrors = {};
  [...orderedCoreFieldEntries, ...visibleOptionalFieldEntries].forEach(([fieldName, rule]) => {
    const isRequired = selectedBlockRequiredFields.has(fieldName);
    buildFieldValidationMap(selectedBlockProps[fieldName], rule, fieldName, isRequired, standardValidationErrors);
  });
  const mergedStandardValidationErrors = { ...standardValidationErrors };
  Object.entries(selectedBlockApiValidationErrors || {}).forEach(([fieldPath, messages]) => {
    if (fieldPath === "__global") return;
    if (!Array.isArray(messages) || messages.length === 0) return;
    if (!mergedStandardValidationErrors[fieldPath]) mergedStandardValidationErrors[fieldPath] = [];
    mergedStandardValidationErrors[fieldPath].push(...messages);
  });
  const apiGlobalErrors = Array.isArray(selectedBlockApiValidationErrors?.__global)
    ? selectedBlockApiValidationErrors.__global
    : [];
  const hasStandardValidationErrors = Object.keys(mergedStandardValidationErrors).length > 0 || apiGlobalErrors.length > 0;

  if (!selectedBlock) return null;

  const handleOpenMediaPicker = (fieldPath) => {
    setMediaPickerFieldPath(fieldPath);
    setIsMediaPickerOpen(true);
  };

  const handleSelectMedia = (asset) => {
    const tokens = parseFieldPath(mediaPickerFieldPath);
    if (!tokens.length) {
      setIsMediaPickerOpen(false);
      return;
    }

    const [topField, ...nestedPath] = tokens;
    if (typeof topField !== "string") {
      setIsMediaPickerOpen(false);
      return;
    }

    if (!nestedPath.length) {
      handleUpdateSelectedBlockProps(topField, asset?.url || "");
      if (asset?.id && typeof topField === "string") {
        handleUpdateSelectedBlockProps(`${topField}AssetId`, asset.id);
      }
      setIsMediaPickerOpen(false);
      return;
    }

    const topValue = selectedBlockProps[topField];
    const nextTopValue = setDeepValue(topValue, nestedPath, asset?.url || "");

    const lastToken = nestedPath[nestedPath.length - 1];
    const parentPath = nestedPath.slice(0, -1);
    if ((lastToken === "src" || lastToken === "videoSrc" || lastToken === "poster") && asset?.id) {
      const withAssetId = setDeepValue(nextTopValue, [...parentPath, "assetId"], asset.id);
      if (lastToken === "src" && asset?.alt) {
        const parentRef = parentPath.length ? getDeepValue(withAssetId, parentPath) : withAssetId;
        const existingAlt = parentRef && typeof parentRef === "object" ? parentRef.alt : "";
        if (!existingAlt) {
          const withAlt = setDeepValue(withAssetId, [...parentPath, "alt"], asset.alt);
          handleUpdateSelectedBlockProps(topField, withAlt);
          setIsMediaPickerOpen(false);
          return;
        }
      }
      handleUpdateSelectedBlockProps(topField, withAssetId);
      setIsMediaPickerOpen(false);
      return;
    }

    if (lastToken === "src" && asset?.alt) {
      const parentRef = parentPath.length ? getDeepValue(nextTopValue, parentPath) : nextTopValue;
      const existingAlt = parentRef && typeof parentRef === "object" ? parentRef.alt : "";
      if (!existingAlt) {
        const withAlt = setDeepValue(nextTopValue, [...parentPath, "alt"], asset.alt);
        handleUpdateSelectedBlockProps(topField, withAlt);
        setIsMediaPickerOpen(false);
        return;
      }
    }

    handleUpdateSelectedBlockProps(topField, nextTopValue);
    setIsMediaPickerOpen(false);
  };

  return (
    <section id="block-editor" className={styles.panel}>
      <h2 className={styles.panelTitle}>Block props editor</h2>
      <p className={styles.status}>Selected section: {selectedSectionLabel}</p>
      {hasUnsavedBlockChanges ? <p className={styles.warning}>Unsaved content edits</p> : null}
      <div className={styles.row}>
        <Button variant={editorMode === "standard" ? "primary" : "secondary"} onClick={() => setEditorMode("standard")}>
          Standard
        </Button>
        <Button variant={editorMode === "advanced" ? "primary" : "secondary"} onClick={() => setEditorMode("advanced")}>
          Advanced
        </Button>
      </div>

      {editorMode === "standard" && selectedBlockFields.length > 0 ? (
        <div className={styles.form}>
          {orderedCoreFieldEntries.length > 0 ? <p className={styles.listTitle}>Core content</p> : null}
          {orderedCoreFieldEntries.length > 0 ? <p className={styles.helpText}>Start with the core message this section should communicate.</p> : null}
          {orderedCoreFieldEntries.map(([fieldName, rule]) => {
            const fieldValue = selectedBlock.props?.[fieldName];
            const isRequired = selectedBlockRequiredFields.has(fieldName);
            return renderStandardField(
              styles,
              fieldName,
              rule,
              fieldValue,
              isRequired,
              (nextValue) => handleUpdateSelectedBlockProps(fieldName, nextValue),
              "root",
              fieldName,
              mergedStandardValidationErrors,
              handleOpenMediaPicker
            );
          })}

          {optionalFieldEntries.length > 0 ? <p className={styles.listTitle}>Optional enhancements</p> : null}
          {optionalFieldEntries.length > 0 ? <p className={styles.helpText}>Add enhancements only when needed for this page.</p> : null}
          {hiddenOptionalFieldEntries.length > 0 ? (
            <div className={styles.row}>
              {hiddenOptionalFieldEntries.map(([fieldName, rule]) => (
                <Button
                  key={`add-optional-${fieldName}`}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setOptionalVisibilityOverrides((prev) => ({
                      ...prev,
                      [getOptionalFieldKey(fieldName)]: true,
                    }));
                    handleUpdateSelectedBlockProps(fieldName, getOptionalFieldInitialValue(rule));
                  }}
                >
                  {OPTIONAL_ACTION_LABELS[fieldName] || `Add ${getFieldLabel(fieldName)}`}
                </Button>
              ))}
            </div>
          ) : null}
          {visibleOptionalFieldEntries.map(([fieldName, rule]) => {
            const fieldValue = selectedBlock.props?.[fieldName];
            return (
              <div className={styles.form} key={`optional-field-${fieldName}`}>
                {renderStandardField(
                  styles,
                  fieldName,
                  rule,
                  fieldValue,
                  false,
                  (nextValue) => handleUpdateSelectedBlockProps(fieldName, nextValue),
                  "root",
                  fieldName,
                  mergedStandardValidationErrors,
                  handleOpenMediaPicker
                )}
                <div className={styles.row}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    tone="danger"
                    onClick={() => {
                      setOptionalVisibilityOverrides((prev) => {
                        const next = { ...prev };
                        next[getOptionalFieldKey(fieldName)] = false;
                        return next;
                      });
                      handleUpdateSelectedBlockProps(fieldName, undefined);
                    }}
                  >
                    Remove {getFieldLabel(fieldName)}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {editorMode === "advanced" ? (
        <div className={styles.form}>
          <label className={styles.label}>
            Props JSON
            <textarea ref={advancedPropsInputRef} key={selectedBlock.id} className={styles.textarea} defaultValue={selectedBlockJson} />
          </label>
          <div className={styles.row}>
            <Button type="button" onClick={handleApplyAdvancedProps}>
              Apply JSON
            </Button>
            <Button type="button" variant="secondary" onClick={handleFormatAdvancedPropsInput}>
              Format JSON
            </Button>
            <Button type="button" variant="secondary" onClick={handleResetAdvancedPropsToSchema}>
              Reset to template
            </Button>
          </div>
          <p className={styles.helpText}>Template fields are generated from this variant schema.</p>
          <label className={styles.label}>
            Schema template (read-only)
            <textarea className={styles.textarea} value={selectedBlockTemplateJson} readOnly />
          </label>
        </div>
      ) : null}

      {propsEditorMessage ? <p className={styles.status}>{propsEditorMessage}</p> : null}
      {apiGlobalErrors.length > 0 ? (
        <div className={styles.errorNotice}>
          {apiGlobalErrors.map((message, index) => (
            <p key={`api-global-error-${index}`} className={styles.error}>{message}</p>
          ))}
        </div>
      ) : null}
      {editorMode === "standard" && hasStandardValidationErrors ? (
        <p className={styles.errorNotice}>Resolve field errors before saving this section.</p>
      ) : null}
      <div className={styles.row}>
        <Button type="button" onClick={handleSaveBlocks} disabled={editorMode === "standard" && hasStandardValidationErrors}>
          Save blocks
        </Button>
        <Button type="button" variant="secondary" onClick={handleCancelSelectedBlockEdits}>
          Cancel
        </Button>
      </div>
      {saveNotice.message ? (
        <p className={saveNotice.type === "error" ? styles.errorNotice : styles.successNotice}>{saveNotice.message}</p>
      ) : null}
      <MediaPicker
        styles={styles}
        isOpen={isMediaPickerOpen}
        title="Choose media"
        workspaceId={workspaceId}
        siteId={siteId}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleSelectMedia}
      />
    </section>
  );
}
