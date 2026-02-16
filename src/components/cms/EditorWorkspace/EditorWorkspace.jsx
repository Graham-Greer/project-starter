import { Button } from "@/components/ui";
import BlockPropsEditorPanel from "@/components/cms/EditorWorkspace/BlockPropsEditorPanel";
import LivePreviewPanel from "@/components/cms/EditorWorkspace/LivePreviewPanel";
import PageHeaderPanel from "@/components/cms/EditorWorkspace/PageHeaderPanel";
import PageSectionsPanel from "@/components/cms/EditorWorkspace/PageSectionsPanel";
import VariantPickerPanel from "@/components/cms/EditorWorkspace/VariantPickerPanel";

export default function EditorWorkspace({
  styles,
  selectedPage,
  selectedSite,
  onExitEditMode,
  onUpdatePageHeaderOverride,
  isUpdatingPageHeader,
  pageHeaderStatusMessage,
  selectedSectionLabel,
  selectedSectionVariants,
  sectionTypes,
  newBlockSectionType,
  onSelectSectionType,
  getSectionLabel,
  newBlockVariant,
  setNewBlockVariant,
  formatVariantLabel,
  libraryPreviewBlock,
  selectedPageId,
  onAddBlock,
  isSavingBlocks,
  saveNotice,
  compactSaveMessage,
  blockStatusMessage,
  isLoadingBlocks,
  pageBlocks,
  draggedBlockId,
  dragOverBlockId,
  onBlockDragStart,
  onBlockDragOver,
  onBlockDrop,
  onBlockDragEnd,
  selectedBlockId,
  onSelectBlock,
  onRequestRemoveBlock,
  sectionLabelForType,
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
  selectedBlockApiValidationErrors,
  handleSaveBlocks,
  handleCancelSelectedBlockEdits,
  previewViewport,
  setPreviewViewport,
  previewTheme,
  handleTogglePreviewTheme,
  previewSrc,
}) {
  return (
    <>
      <div className={styles.row}>
        <Button type="button" variant="secondary" onClick={onExitEditMode}>
          Exit edit mode
        </Button>
      </div>

      <PageHeaderPanel
        key={`${selectedSite?.id || "site"}:${selectedPage?.id || "page"}`}
        styles={styles}
        selectedPage={selectedPage}
        selectedSite={selectedSite}
        onUpdatePageHeaderOverride={onUpdatePageHeaderOverride}
        isUpdatingPageHeader={isUpdatingPageHeader}
        pageHeaderStatusMessage={pageHeaderStatusMessage}
      />

      <div className={styles.composerGrid}>
        <PageSectionsPanel
          styles={styles}
          selectedPage={selectedPage}
          isSavingBlocks={isSavingBlocks}
          saveNotice={saveNotice}
          compactSaveMessage={compactSaveMessage}
          blockStatusMessage={blockStatusMessage}
          isLoadingBlocks={isLoadingBlocks}
          pageBlocks={pageBlocks}
          draggedBlockId={draggedBlockId}
          dragOverBlockId={dragOverBlockId}
          onBlockDragStart={onBlockDragStart}
          onBlockDragOver={onBlockDragOver}
          onBlockDrop={onBlockDrop}
          onBlockDragEnd={onBlockDragEnd}
          selectedBlockId={selectedBlockId}
          onSelectBlock={onSelectBlock}
          onRequestRemoveBlock={onRequestRemoveBlock}
          sectionLabelForType={sectionLabelForType}
          formatVariantLabel={formatVariantLabel}
        />
        <VariantPickerPanel
          styles={styles}
          selectedSectionLabel={selectedSectionLabel}
          selectedSectionVariants={selectedSectionVariants}
          sectionTypes={sectionTypes}
          newBlockSectionType={newBlockSectionType}
          onSelectSectionType={onSelectSectionType}
          getSectionLabel={getSectionLabel}
          newBlockVariant={newBlockVariant}
          setNewBlockVariant={setNewBlockVariant}
          formatVariantLabel={formatVariantLabel}
          libraryPreviewBlock={libraryPreviewBlock}
          selectedPageId={selectedPageId}
          onAddBlock={onAddBlock}
        />
      </div>

      <BlockPropsEditorPanel
        styles={styles}
        workspaceId={selectedSite?.workspaceId || ""}
        siteId={selectedSite?.id || ""}
        selectedBlock={selectedBlock}
        hasUnsavedBlockChanges={hasUnsavedBlockChanges}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
        selectedBlockFields={selectedBlockFields}
        selectedBlockRequiredFields={selectedBlockRequiredFields}
        handleUpdateSelectedBlockProps={handleUpdateSelectedBlockProps}
        advancedPropsInputRef={advancedPropsInputRef}
        selectedBlockJson={selectedBlockJson}
        handleApplyAdvancedProps={handleApplyAdvancedProps}
        handleFormatAdvancedPropsInput={handleFormatAdvancedPropsInput}
        handleResetAdvancedPropsToSchema={handleResetAdvancedPropsToSchema}
        selectedBlockTemplateJson={selectedBlockTemplateJson}
        propsEditorMessage={propsEditorMessage}
        selectedBlockApiValidationErrors={selectedBlockApiValidationErrors}
        handleSaveBlocks={handleSaveBlocks}
        handleCancelSelectedBlockEdits={handleCancelSelectedBlockEdits}
        saveNotice={saveNotice}
      />

      <LivePreviewPanel
        styles={styles}
        selectedPage={selectedPage}
        previewViewport={previewViewport}
        setPreviewViewport={setPreviewViewport}
        previewTheme={previewTheme}
        handleTogglePreviewTheme={handleTogglePreviewTheme}
        previewSrc={previewSrc}
      />
    </>
  );
}
