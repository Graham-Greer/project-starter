import { Icon } from "@/components/primitives";
import { Button } from "@/components/ui";

export default function PageSectionsPanel({
  styles,
  selectedPage,
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
  formatVariantLabel,
}) {
  return (
    <section id="page-sections-list" className={styles.panel}>
      <div className={styles.pageSectionHeader}>
        <h2 className={styles.panelTitle}>Page sections{selectedPage ? ` - ${selectedPage.title}` : ""}</h2>
        <p
          className={`${styles.pageSectionSaveState} ${
            isSavingBlocks || saveNotice?.type === "success" ? styles.pageSectionSaveStateSuccess : ""
          } ${saveNotice?.type === "error" ? styles.pageSectionSaveStateError : ""}`.trim()}
        >
          {isSavingBlocks ? "Saving..." : saveNotice?.type === "success" && compactSaveMessage ? compactSaveMessage : ""}
        </p>
      </div>
      {blockStatusMessage && saveNotice?.type !== "success" ? <p className={styles.status}>{blockStatusMessage}</p> : null}
      {saveNotice?.type === "error" && saveNotice.message ? <p className={styles.errorNotice}>{saveNotice.message}</p> : null}
      {isLoadingBlocks ? <p className={styles.status}>Loading blocks...</p> : null}
      {!isLoadingBlocks && pageBlocks.length === 0 ? <p className={styles.status}>No blocks yet for this page.</p> : null}
      {!isLoadingBlocks && pageBlocks.length > 0 ? (
        <ul className={styles.list}>
          {pageBlocks.map((block) => (
            <li
              key={block.id}
              className={`${styles.listItem} ${styles.composerItem} ${draggedBlockId === block.id ? styles.draggingItem : ""} ${dragOverBlockId === block.id ? styles.dragOverItem : ""}`.trim()}
              draggable
              onDragStart={() => onBlockDragStart(block.id)}
              onDragOver={(event) => onBlockDragOver(event, block.id)}
              onDrop={(event) => onBlockDrop(event, block.id)}
              onDragEnd={onBlockDragEnd}
            >
              <div className={styles.composerItemBody}>
                <div className={styles.composerItemTopRow}>
                  <div className={styles.composerItemHeader}>
                    <span className={styles.composerGrabHandle} aria-hidden="true">
                      <Icon name="gripVertical" size="0.95rem" />
                    </span>
                    <div className={styles.composerItemText}>
                      <p className={styles.listTitle}>{sectionLabelForType(block.sectionType)}</p>
                      <p className={styles.composerVariantText}>Variant: {formatVariantLabel(block.variant)}</p>
                    </div>
                  </div>
                  <div className={styles.composerItemActions}>
                    <Button
                      size="sm"
                      variant={selectedBlockId === block.id ? "primary" : "secondary"}
                      iconOnly
                      onClick={() => onSelectBlock(block.id)}
                      aria-label={selectedBlockId === block.id ? "Editing section" : "Edit section"}
                      title={selectedBlockId === block.id ? "Editing" : "Edit"}
                      iconLeft={<Icon name="edit" size="1rem" decorative={true} />}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      tone="danger"
                      iconOnly
                      onClick={() => onRemoveBlock(block.id)}
                      aria-label="Remove section"
                      title="Remove"
                      iconLeft={<Icon name="trash" size="1rem" decorative={true} />}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
