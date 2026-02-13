import { useMemo } from "react";
import { getPropsSchema } from "@/lib/registry/props.schemas";
import { getSectionPreviewSeed } from "@/lib/registry/preview-seeds";
import { getSectionDefinition, SECTIONS_REGISTRY } from "@/lib/registry/sections.registry";
import {
  buildPageTree,
  buildSchemaTemplate,
  collectDescendantPageIds,
  getFieldLabel,
  mergePreviewProps,
} from "@/lib/cms/cms-utils";

export function useCmsPageViewModel({
  newBlockSectionType,
  newBlockVariant,
  sites,
  selectedSiteId,
  sitePagesMap,
  pageListPagination,
  selectedPageId,
  pageBlocks,
  selectedBlockId,
  saveNotice,
  previewTheme,
  previewRefreshNonce,
  buildDefaultPropsForSection,
}) {
  return useMemo(() => {
    const selectedSectionVariants = Object.keys(SECTIONS_REGISTRY[newBlockSectionType]?.variants || {});
    const selectedSectionLabel = SECTIONS_REGISTRY[newBlockSectionType]?.label || getFieldLabel(newBlockSectionType);
    const selectedSite = sites.find((site) => site.id === selectedSiteId) || null;

    const libraryPreviewBlock = newBlockSectionType && newBlockVariant
      ? {
          id: "library-preview",
          sectionType: newBlockSectionType,
          variant: newBlockVariant,
          props: mergePreviewProps(
            buildDefaultPropsForSection(newBlockSectionType, newBlockVariant),
            getSectionPreviewSeed(newBlockSectionType, newBlockVariant)
          ),
        }
      : null;

    const selectedSitePages = sitePagesMap[selectedSiteId] || [];
    const selectedSitePageTree = buildPageTree(selectedSitePages);
    const totalPageRows = pageListPagination.totalItems;
    const maxPageListPage = pageListPagination.totalPages;
    const safePageListPage = pageListPagination.page;
    const selectedPage = selectedSitePages.find((page) => page.id === selectedPageId) || null;
    const selectedPageDescendantIds = collectDescendantPageIds(selectedSitePageTree, selectedPageId, new Set());
    const availableParentPages = selectedSitePages.filter(
      (page) => page.id !== selectedPageId && !selectedPageDescendantIds.has(page.id)
    );

    const selectedBlock = pageBlocks.find((block) => block.id === selectedBlockId) || null;
    const selectedBlockDefinition = selectedBlock
      ? getSectionDefinition(selectedBlock.sectionType, selectedBlock.variant)
      : null;
    const selectedBlockSchema = selectedBlockDefinition
      ? getPropsSchema(selectedBlockDefinition.propsSchema)
      : null;
    const selectedBlockFields = Object.entries(selectedBlockSchema?.fields || {});
    const selectedBlockRequiredFields = new Set(selectedBlockSchema?.required || []);
    const selectedBlockJson = JSON.stringify(selectedBlock?.props || {}, null, 2);
    const selectedBlockTemplateJson = JSON.stringify(buildSchemaTemplate(selectedBlockSchema), null, 2);
    const compactSaveMessage = saveNotice?.message ? saveNotice.message.replace(/\sat .*/, "") : "";
    const previewSrc = selectedSiteId && selectedPageId
      ? `/cms/preview/${selectedSiteId}/${selectedPageId}?theme=${previewTheme}&v=${previewRefreshNonce}`
      : "";

    return {
      selectedSectionVariants,
      selectedSectionLabel,
      selectedSite,
      libraryPreviewBlock,
      selectedSitePages,
      totalPageRows,
      maxPageListPage,
      safePageListPage,
      selectedPage,
      availableParentPages,
      selectedBlock,
      selectedBlockSchema,
      selectedBlockFields,
      selectedBlockRequiredFields,
      selectedBlockJson,
      selectedBlockTemplateJson,
      compactSaveMessage,
      previewSrc,
    };
  }, [
    newBlockSectionType,
    newBlockVariant,
    sites,
    selectedSiteId,
    sitePagesMap,
    pageListPagination,
    selectedPageId,
    pageBlocks,
    selectedBlockId,
    saveNotice,
    previewTheme,
    previewRefreshNonce,
    buildDefaultPropsForSection,
  ]);
}
