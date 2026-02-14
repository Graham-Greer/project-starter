import { Icon } from "@/components/primitives";
import { Button } from "@/components/ui";

export default function LivePreviewPanel({
  styles,
  selectedPage,
  previewViewport,
  setPreviewViewport,
  previewTheme,
  handleTogglePreviewTheme,
  previewSrc,
}) {
  return (
    <section id="live-preview" className={styles.panel}>
      <div className={styles.previewHeader}>
        <h2 className={styles.panelTitle}>Live preview{selectedPage ? ` - ${selectedPage.title}` : ""}</h2>
        <div className={styles.previewHeaderActions}>
          <Button size="sm" variant={previewViewport === "desktop" ? "primary" : "secondary"} onClick={() => setPreviewViewport("desktop")}>
            Desktop
          </Button>
          <Button size="sm" variant={previewViewport === "tablet" ? "primary" : "secondary"} onClick={() => setPreviewViewport("tablet")}>
            Tablet
          </Button>
          <Button size="sm" variant={previewViewport === "mobile" ? "primary" : "secondary"} onClick={() => setPreviewViewport("mobile")}>
            Mobile
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            iconOnly
            className={styles.previewThemeToggle}
            onClick={handleTogglePreviewTheme}
            aria-label={previewTheme === "dark" ? "Switch preview to light theme" : "Switch preview to dark theme"}
            title={previewTheme === "dark" ? "Switch preview to light theme" : "Switch preview to dark theme"}
            iconLeft={<Icon name={previewTheme === "dark" ? "sun" : "moon"} className={styles.previewThemeIcon} decorative={true} />}
          />
        </div>
      </div>

      {!previewSrc ? <p className={styles.status}>Select a page to enable live preview.</p> : null}
      {previewSrc ? (
        <div className={`${styles.previewViewport} ${styles[`preview-${previewViewport}`]}`}>
          <iframe key={previewSrc} title="CMS page preview" src={previewSrc} className={styles.previewFrame} />
        </div>
      ) : null}
    </section>
  );
}
