import { useMemo, useState } from "react";
import { Button } from "@/components/ui";

export default function PageHeaderPanel({
  styles,
  selectedPage,
  selectedSite,
  onUpdatePageHeaderOverride,
  isUpdatingPageHeader,
  pageHeaderStatusMessage,
}) {
  const hasContext = Boolean(selectedPage && selectedSite);
  const headers = Array.isArray(selectedSite?.headers) ? selectedSite.headers : [];
  const activeHeaderId = selectedSite?.activeHeaderId || headers[0]?.id || "";
  const pageHeaderMode = selectedPage?.headerMode === "override" ? "override" : "inherit";
  const pageHeaderPresetId = pageHeaderMode === "override" && selectedPage?.headerPresetId
    ? selectedPage.headerPresetId
    : activeHeaderId;
  const [headerModeInput, setHeaderModeInput] = useState(pageHeaderMode);
  const [headerPresetIdInput, setHeaderPresetIdInput] = useState(pageHeaderPresetId);
  const isError = /(failed|error|invalid|not found|must)/i.test(pageHeaderStatusMessage || "");
  const hasUnsavedChanges = headerModeInput !== pageHeaderMode || (headerModeInput === "override" && headerPresetIdInput !== pageHeaderPresetId);

  const resolvedPresetId = useMemo(
    () => (headerModeInput === "override" ? (headerPresetIdInput || activeHeaderId) : ""),
    [activeHeaderId, headerModeInput, headerPresetIdInput]
  );

  if (!hasContext) return null;

  return (
    <section className={styles.panel}>
      <div className={styles.navigationHeader}>
        <h2 className={styles.panelTitle}>Page header</h2>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onUpdatePageHeaderOverride({ headerMode: headerModeInput, headerPresetId: resolvedPresetId })}
          disabled={isUpdatingPageHeader || !hasUnsavedChanges}
        >
          {isUpdatingPageHeader ? "Saving..." : "Save page header"}
        </Button>
      </div>

      {pageHeaderStatusMessage ? (
        <p className={isError ? styles.error : styles.status}>{pageHeaderStatusMessage}</p>
      ) : null}

      <div className={styles.navigationFieldsGrid}>
        <select
          className={styles.input}
          value={headerModeInput}
          onChange={(event) => setHeaderModeInput(event.target.value === "override" ? "override" : "inherit")}
          disabled={isUpdatingPageHeader}
        >
          <option value="inherit">Use global site header</option>
          <option value="override">Use page-specific header</option>
        </select>

        {headerModeInput === "override" ? (
          <label className={styles.label}>
            Header preset
            <select
              className={styles.input}
              value={headerPresetIdInput}
              onChange={(event) => setHeaderPresetIdInput(event.target.value)}
              disabled={isUpdatingPageHeader}
            >
              {headers.map((preset) => (
                <option key={`page-header-preset-${preset.id}`} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

    </section>
  );
}
