function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function validateFieldValue(value, rule, fieldName) {
  if (value === undefined || value === null) return [];

  const errors = [];

  if (!rule || !rule.type) return errors;

  if (rule.type === "string") {
    if (typeof value !== "string") {
      errors.push(`${fieldName} must be a string`);
      return errors;
    }
    if (Array.isArray(rule.options) && rule.options.length > 0 && !rule.options.includes(value)) {
      errors.push(`${fieldName} must be one of: ${rule.options.join(", ")}`);
    }
    if (typeof rule.maxLength === "number" && value.length > rule.maxLength) {
      errors.push(`${fieldName} must be <= ${rule.maxLength} characters`);
    }
    return errors;
  }

  if (rule.type === "boolean") {
    if (typeof value !== "boolean") {
      errors.push(`${fieldName} must be a boolean`);
    }
    return errors;
  }

  if (rule.type === "array") {
    if (!Array.isArray(value)) {
      errors.push(`${fieldName} must be an array`);
      return errors;
    }
    if (typeof rule.minLength === "number" && value.length < rule.minLength) {
      errors.push(`${fieldName} must have at least ${rule.minLength} item(s)`);
    }
    if (rule.item) {
      value.forEach((itemValue, index) => {
        errors.push(...validateFieldValue(itemValue, rule.item, `${fieldName}[${index}]`));
      });
    }
    return errors;
  }

  if (rule.type === "object") {
    if (!isObject(value)) {
      errors.push(`${fieldName} must be an object`);
      return errors;
    }
    const requiredFields = Array.isArray(rule.required) ? rule.required : [];
    requiredFields.forEach((childField) => {
      const childRule = rule?.fields?.[childField];
      if (isMissingRequiredValue(value[childField], childRule)) {
        errors.push(`${fieldName}.${childField} is required`);
      }
    });
    if (rule.fields && isObject(rule.fields)) {
      Object.entries(rule.fields).forEach(([childField, childRule]) => {
        errors.push(...validateFieldValue(value[childField], childRule, `${fieldName}.${childField}`));
      });
    }
    if (rule.additionalProperties) {
      Object.entries(value).forEach(([dynamicFieldName, dynamicValue]) => {
        errors.push(...validateFieldValue(dynamicValue, rule.additionalProperties, `${fieldName}.${dynamicFieldName}`));
      });
    }
    return errors;
  }

  return errors;
}

export function validateProps(props = {}, schema = {}) {
  const errors = [];
  const fieldRules = schema.fields || {};
  const required = schema.required || [];

  if (!isObject(props)) {
    return ["props must be an object"];
  }

  required.forEach((fieldName) => {
    const value = props[fieldName];
    const fieldRule = fieldRules[fieldName];
    const missing = isMissingRequiredValue(value, fieldRule);
    if (missing) errors.push(`${fieldName} is required`);
  });

  Object.entries(fieldRules).forEach(([fieldName, rule]) => {
    const value = props[fieldName];
    const isTopLevelRequired = required.includes(fieldName);
    const isOptionalEmptyObject = !isTopLevelRequired
      && rule?.type === "object"
      && isObject(value)
      && Object.keys(value).length === 0;

    if (isOptionalEmptyObject) return;
    errors.push(...validateFieldValue(value, rule, fieldName));
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
