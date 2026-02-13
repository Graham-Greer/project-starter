export default function SectionLibraryPanel({
  styles,
  sectionTypes,
  newBlockSectionType,
  onSelectSectionType,
  getSectionLabel,
}) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>Section library</h2>
      <div className={styles.sideNav}>
        {sectionTypes.map((sectionType) => (
          <button
            key={`section-link-${sectionType}`}
            type="button"
            className={`${styles.sideNavLink} ${newBlockSectionType === sectionType ? styles.sideNavLinkActive : ""}`.trim()}
            onClick={() => onSelectSectionType(sectionType)}
          >
            {getSectionLabel(sectionType)}
          </button>
        ))}
      </div>
    </section>
  );
}
