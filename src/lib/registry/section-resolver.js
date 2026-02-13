import { getSectionDefinition } from "./sections.registry";

export const FALLBACK_COMPONENT_KEY = "SectionRenderFallback";

export function resolveSectionComponentKey(sectionType, variant) {
  const definition = getSectionDefinition(sectionType, variant);
  return definition?.componentKey || FALLBACK_COMPONENT_KEY;
}
