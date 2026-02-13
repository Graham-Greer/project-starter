import { getPropsSchema } from "../registry/props.schemas";
import { getSectionDefinition } from "../registry/sections.registry";
import { validateProps } from "./validate-props";

export function validateBlock(block) {
  if (!block || typeof block !== "object") {
    return { valid: false, errors: ["block must be an object"] };
  }

  const errors = [];

  const { id, sectionType, variant, props } = block;

  if (!id) errors.push("block.id is required");
  if (!sectionType) errors.push("block.sectionType is required");
  if (!variant) errors.push("block.variant is required");

  const sectionDef = getSectionDefinition(sectionType, variant);
  if (!sectionDef) {
    errors.push(`unknown section variant: ${sectionType}.${variant}`);
    return { valid: false, errors };
  }

  const schema = getPropsSchema(sectionDef.propsSchema);
  if (!schema) {
    errors.push(`missing schema for ${sectionDef.propsSchema}`);
    return { valid: false, errors };
  }

  const propsResult = validateProps(props || {}, schema);
  if (!propsResult.valid) {
    propsResult.errors.forEach((error) => {
      errors.push(`props.${error}`);
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
