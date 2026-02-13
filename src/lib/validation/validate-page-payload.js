import { validateBlock } from "./validate-block";

export function validatePagePayload(pagePayload) {
  if (!pagePayload || typeof pagePayload !== "object") {
    return { valid: false, errors: ["page payload must be an object"] };
  }

  const errors = [];

  if (!pagePayload.pageId) errors.push("pageId is required");
  if (!pagePayload.slug) errors.push("slug is required");

  if (!Array.isArray(pagePayload.blocks)) {
    errors.push("blocks must be an array");
  } else {
    pagePayload.blocks.forEach((block, index) => {
      const result = validateBlock(block);
      if (!result.valid) {
        result.errors.forEach((error) => {
          errors.push(`blocks[${index}].${error}`);
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
