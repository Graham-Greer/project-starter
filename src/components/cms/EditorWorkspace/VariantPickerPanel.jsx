import { useState } from "react";
import { Button } from "@/components/ui";
import { renderSectionBlock } from "@/lib/registry";
import { getSectionMetadata, getVariantMetadata } from "@/lib/registry/sections.registry";

export default function VariantPickerPanel({
  styles,
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
}) {
  const [pickerStep, setPickerStep] = useState("library");

  const handlePickSection = (sectionType) => {
    onSelectSectionType(sectionType);
    setPickerStep("variant");
  };

  const handleAddSection = (event) => {
    const added = onAddBlock(event);
    if (added) {
      setPickerStep("library");
    }
    window.requestAnimationFrame(() => {
      const editor = document.getElementById("block-editor");
      editor?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <section id="page-sections" className={styles.panel}>
      <div className={styles.pageSectionHeader}>
        <h2 className={styles.panelTitle}>
          {pickerStep === "library" ? "Section library" : `Variant picker - ${selectedSectionLabel}`}
        </h2>
        {pickerStep === "variant" ? (
          <Button type="button" size="sm" variant="secondary" onClick={() => setPickerStep("library")}>
            Back
          </Button>
        ) : null}
      </div>

      {pickerStep === "library" ? (
        <div className={styles.libraryGrid}>
          {sectionTypes.map((sectionType) => {
            const isSelected = sectionType === newBlockSectionType;
            const sectionMeta = getSectionMetadata(sectionType);
            return (
              <button
                key={`section-${sectionType}`}
                type="button"
                className={`${styles.libraryCard} ${isSelected ? styles.libraryCardActive : ""}`.trim()}
                onClick={() => handlePickSection(sectionType)}
              >
                <span className={styles.libraryCardTitle}>{getSectionLabel(sectionType)}</span>
                <span className={styles.libraryCardSubtitle}>
                  {sectionMeta?.description || "Select section"}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className={styles.libraryGrid}>
          {selectedSectionVariants.map((variant) => {
            const isSelected = variant === newBlockVariant;
            const variantMeta = getVariantMetadata(newBlockSectionType, variant);
            return (
              <button
                key={`${newBlockSectionType}.${variant}`}
                type="button"
                className={`${styles.libraryCard} ${isSelected ? styles.libraryCardActive : ""}`.trim()}
                onClick={() => setNewBlockVariant(variant)}
              >
                <span className={styles.libraryCardTitle}>{selectedSectionLabel}</span>
                <span className={styles.libraryCardSubtitle}>{formatVariantLabel(variant)}</span>
                {variantMeta?.description ? (
                  <span className={styles.helpText}>{variantMeta.description}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {pickerStep === "variant" && libraryPreviewBlock ? (
        <div className={styles.blockVisualPreview}>
          <p className={styles.status}>Selected block preview</p>
          {renderSectionBlock(libraryPreviewBlock, { key: "library-preview" })}
        </div>
      ) : null}

      {pickerStep === "variant" ? (
        <div className={styles.inlineForm}>
          <Button type="button" disabled={!selectedPageId} onClick={handleAddSection}>
            Add section to page
          </Button>
        </div>
      ) : null}
    </section>
  );
}
