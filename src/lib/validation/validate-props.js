function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
    const missing = value === undefined || value === null || value === "";
    if (missing) errors.push(`${fieldName} is required`);
  });

  Object.entries(fieldRules).forEach(([fieldName, rule]) => {
    errors.push(...validateFieldValue(props[fieldName], rule, fieldName));
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
