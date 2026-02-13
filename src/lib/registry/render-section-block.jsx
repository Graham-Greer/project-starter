import { validateBlock } from "@/lib/validation";
import { getSectionComponent } from "./section-component-map";
import { FALLBACK_COMPONENT_KEY, resolveSectionComponentKey } from "./section-resolver";

function buildFallbackProps(block, message, errors = []) {
  return {
    title: "Section unavailable",
    message,
    blockId: block?.id,
    sectionType: block?.sectionType,
    variant: block?.variant,
    errors,
  };
}

export function resolveSectionBlockComponent(block) {
  const validation = validateBlock(block);
  const fallbackComponent = getSectionComponent(FALLBACK_COMPONENT_KEY);

  if (!validation.valid) {
    return {
      Component: fallbackComponent,
      props: buildFallbackProps(block, "This block failed validation and was replaced with a safe fallback.", validation.errors),
      isFallback: true,
      errors: validation.errors,
    };
  }

  const componentKey = resolveSectionComponentKey(block.sectionType, block.variant);
  const Component = getSectionComponent(componentKey) || fallbackComponent;

  if (!Component) {
    return {
      Component: null,
      props: null,
      isFallback: true,
      errors: ["No fallback section component is registered."],
    };
  }

  if (Component === fallbackComponent) {
    return {
      Component,
      props: buildFallbackProps(block, `No renderer found for ${block.sectionType}.${block.variant}.`),
      isFallback: true,
      errors: [],
    };
  }

  return {
    Component,
    props: block.props || {},
    isFallback: false,
    errors: [],
  };
}

export function renderSectionBlock(block, options = {}) {
  const { Component, props } = resolveSectionBlockComponent(block);
  if (!Component) return null;
  const key = options.key || block?.id || `${block?.sectionType || "unknown"}-${block?.variant || "unknown"}`;
  return <Component key={key} {...props} />;
}
