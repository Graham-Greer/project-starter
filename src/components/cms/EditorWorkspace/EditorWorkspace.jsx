import { Button } from "@/components/ui";
import BlockPropsEditorPanel from "@/components/cms/EditorWorkspace/BlockPropsEditorPanel";
import LivePreviewPanel from "@/components/cms/EditorWorkspace/LivePreviewPanel";
import PageSectionsPanel from "@/components/cms/EditorWorkspace/PageSectionsPanel";
import VariantPickerPanel from "@/components/cms/EditorWorkspace/VariantPickerPanel";

export default function EditorWorkspace({
  styles,
  selectedPage,
  onExitEditMode,
  selectedSectionLabel,
  selectedSectionVariants,
  newBlockSectionType,
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
  onRemoveBlock,
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
  handleSaveBlocks,
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
          onRemoveBlock={onRemoveBlock}
          sectionLabelForType={sectionLabelForType}
          formatVariantLabel={formatVariantLabel}
        />
        <VariantPickerPanel
          styles={styles}
          selectedSectionLabel={selectedSectionLabel}
          selectedSectionVariants={selectedSectionVariants}
          newBlockSectionType={newBlockSectionType}
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
        selectedBlock={selectedBlock}
        selectedBlockId={selectedBlockId}
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
        handleSaveBlocks={handleSaveBlocks}
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
