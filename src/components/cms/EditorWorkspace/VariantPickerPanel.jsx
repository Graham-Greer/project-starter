import { Button } from "@/components/ui";
import { renderSectionBlock } from "@/lib/registry";

export default function VariantPickerPanel({
  styles,
  selectedSectionLabel,
  selectedSectionVariants,
  newBlockSectionType,
  newBlockVariant,
  setNewBlockVariant,
  formatVariantLabel,
  libraryPreviewBlock,
  selectedPageId,
  onAddBlock,
}) {
  return (
    <section id="page-sections" className={styles.panel}>
      <h2 className={styles.panelTitle}>Variant picker - {selectedSectionLabel}</h2>
      <div className={styles.libraryGrid}>
        {selectedSectionVariants.map((variant) => {
          const isSelected = variant === newBlockVariant;
          return (
            <button
              key={`${newBlockSectionType}.${variant}`}
              type="button"
              className={`${styles.libraryCard} ${isSelected ? styles.libraryCardActive : ""}`.trim()}
              onClick={() => setNewBlockVariant(variant)}
            >
              <span className={styles.libraryCardTitle}>{selectedSectionLabel}</span>
              <span className={styles.libraryCardSubtitle}>{formatVariantLabel(variant)}</span>
            </button>
          );
        })}
      </div>

      {libraryPreviewBlock ? (
        <div className={styles.blockVisualPreview}>
          <p className={styles.status}>Selected block preview</p>
          {renderSectionBlock(libraryPreviewBlock, { key: "library-preview" })}
        </div>
      ) : null}

      <div className={styles.inlineForm}>
        <Button type="button" disabled={!selectedPageId} onClick={onAddBlock}>
          Add section to page
        </Button>
      </div>
    </section>
  );
}
