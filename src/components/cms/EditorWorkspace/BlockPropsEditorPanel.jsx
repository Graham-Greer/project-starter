import { Button } from "@/components/ui";
import { getDefaultValueForRule, getFieldHelpText, getFieldLabel } from "@/lib/cms/cms-utils";

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
  onChange([...currentArray, getDefaultValueForRule(itemRule, true)]);
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

function renderStandardField(styles, fieldName, rule, fieldValue, isRequired, onChange, keyPrefix = "root") {
  const fieldLabel = getFieldLabel(fieldName);
  const fieldKey = `${keyPrefix}-${fieldName}`;

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
          <select className={styles.input} value={safeValue || rule.options[0]} onChange={(event) => onChange(event.target.value)}>
            {rule.options.map((option) => (
              <option key={`${fieldKey}-opt-${option}`} value={option}>
                {getFieldLabel(option)}
              </option>
            ))}
          </select>
        ) : useTextarea ? (
          <textarea
            className={styles.textarea}
            value={safeValue}
            maxLength={typeof rule.maxLength === "number" ? rule.maxLength : undefined}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : (
          <input
            className={styles.input}
            type="text"
            value={safeValue}
            maxLength={typeof rule.maxLength === "number" ? rule.maxLength : undefined}
            onChange={(event) => onChange(event.target.value)}
          />
        )}
        <span className={styles.helpText}>
          {getFieldHelpText(fieldName, rule)}
          {typeof rule.maxLength === "number" ? ` ${safeValue.length}/${rule.maxLength}` : ""}
        </span>
      </label>
    );
  }

  if (rule.type === "object") {
    const objectValue = (fieldValue && typeof fieldValue === "object" && !Array.isArray(fieldValue)) ? fieldValue : {};
    const childEntries = Object.entries(rule.fields || {});
    const hasDynamicEntries = !childEntries.length && rule.additionalProperties;

    if (hasDynamicEntries) {
      return (
        <div className={styles.form} key={fieldKey}>
          <p className={styles.listTitle}>{fieldLabel} {isRequired ? "(Required)" : ""}</p>
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
                `${fieldKey}-dyn-value-${index}`
              )}
              <div className={styles.row}>
                <Button variant="secondary" onClick={() => removeDynamicObjectEntry(objectValue, dynamicKey, onChange)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <div className={styles.row}>
            <Button variant="secondary" onClick={() => addDynamicObjectEntry(objectValue, rule, onChange)}>
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
        {childEntries.map(([childFieldName, childRule]) =>
          renderStandardField(
            styles,
            childFieldName,
            childRule,
            objectValue[childFieldName],
            false,
            (nextChildValue) => onChange({ ...objectValue, [childFieldName]: nextChildValue }),
            fieldKey
          )
        )}
      </div>
    );
  }

  if (rule.type === "array") {
    const arrayValue = Array.isArray(fieldValue) ? fieldValue : [];
    const itemRule = rule.item || { type: "string" };

    return (
      <div className={styles.form} key={fieldKey}>
        <p className={styles.listTitle}>{fieldLabel} {isRequired ? "(Required)" : ""}</p>
        {arrayValue.map((itemValue, index) => (
          <div className={styles.listItem} key={`${fieldKey}-item-${index}`}>
            {renderStandardField(
              styles,
              `${fieldLabel} Item ${index + 1}`,
              itemRule,
              itemValue,
              false,
              (nextItemValue) => updateArrayItemValue(arrayValue, index, nextItemValue, onChange),
              fieldKey
            )}
            <div className={styles.row}>
              <Button
                variant="secondary"
                disabled={typeof rule.minLength === "number" && arrayValue.length <= rule.minLength}
                onClick={() => removeArrayItemValue(arrayValue, index, onChange)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => addArrayItemValue(arrayValue, rule, onChange)}>
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

export default function BlockPropsEditorPanel({
  styles,
  selectedBlock,
  selectedBlockId,
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
  handleSaveBlocks,
  saveNotice,
}) {
  if (!selectedBlock) return null;

  return (
    <section id="block-editor" className={styles.panel}>
      <h2 className={styles.panelTitle}>Block props editor</h2>
      <p className={styles.status}>Selected block: {selectedBlockId || "None"}</p>
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
          {selectedBlockFields.map(([fieldName, rule]) => {
            const fieldValue = selectedBlock.props?.[fieldName];
            const isRequired = selectedBlockRequiredFields.has(fieldName);
            return renderStandardField(
              styles,
              fieldName,
              rule,
              fieldValue,
              isRequired,
              (nextValue) => handleUpdateSelectedBlockProps(fieldName, nextValue)
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
      <div className={styles.row}>
        <Button type="button" onClick={handleSaveBlocks}>
          Save blocks
        </Button>
      </div>
      {saveNotice.message ? (
        <p className={saveNotice.type === "error" ? styles.errorNotice : styles.successNotice}>{saveNotice.message}</p>
      ) : null}
    </section>
  );
}
