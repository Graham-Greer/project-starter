import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";

function formatAssetTypeLabel(contentType = "") {
  if (contentType.startsWith("image/")) return "Image";
  if (contentType.startsWith("video/")) return "Video";
  if (contentType === "application/pdf") return "PDF";
  return "File";
}

export default function MediaPicker({
  styles,
  isOpen,
  title = "Choose media",
  workspaceId,
  siteId,
  onClose,
  onSelect,
}) {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [search, setSearch] = useState("");

  const hasContext = Boolean(workspaceId && siteId);

  useEffect(() => {
    if (!isOpen || !hasContext) return;
    const controller = new AbortController();
    const loadAssets = async () => {
      setIsLoading(true);
      setStatusMessage("");
      try {
        const query = new URLSearchParams();
        query.set("siteId", siteId);
        query.set("pageSize", "100");
        const response = await fetch(`/api/cms/workspaces/${workspaceId}/assets?${query.toString()}`, {
          signal: controller.signal,
        });
        const payload = await response.json();
        if (!payload?.ok) {
          setRows([]);
          setStatusMessage(payload?.error || "Unable to load media.");
          return;
        }
        const nextRows = Array.isArray(payload.rows) ? payload.rows : [];
        setRows(nextRows);
        if (!nextRows.length) {
          setStatusMessage("No media found for this site yet.");
        }
      } catch (_error) {
        setRows([]);
        setStatusMessage("Unable to load media.");
      } finally {
        setIsLoading(false);
      }
    };
    loadAssets();
    return () => controller.abort();
  }, [hasContext, isOpen, siteId, workspaceId]);

  const visibleRows = useMemo(() => {
    const searchValue = String(search || "").trim().toLowerCase();
    if (!searchValue) return rows;
    return rows.filter((asset) => `${asset.filename || ""} ${asset.alt || ""}`.toLowerCase().includes(searchValue));
  }, [rows, search]);

  if (!isOpen) return null;

  return (
    <div className={styles.mediaPickerOverlay} role="dialog" aria-modal="true" aria-label={title}>
      <section className={styles.mediaPickerPanel}>
        <div className={styles.pageListHeader}>
          <h3 className={styles.panelTitle}>{title}</h3>
          <Button type="button" size="sm" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        {!hasContext ? <p className={styles.error}>Select a workspace site before opening media.</p> : null}

        <label className={styles.label}>
          Search media
          <input
            type="search"
            className={styles.input}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by filename or alt text"
          />
        </label>

        {isLoading ? <p className={styles.status}>Loading media...</p> : null}
        {!isLoading && statusMessage ? (
          <p className={/unable|failed|error/i.test(statusMessage) ? styles.error : styles.status}>{statusMessage}</p>
        ) : null}

        {!isLoading && visibleRows.length > 0 ? (
          <ul className={styles.list}>
            {visibleRows.map((asset) => (
              <li key={`media-picker-${asset.id}`} className={styles.mediaListItem}>
                <div className={styles.mediaItemInfo}>
                  <p className={styles.listTitle}>{asset.filename}</p>
                  <p className={styles.helpText}>
                    {formatAssetTypeLabel(asset.contentType)} · {asset.alt || "No alt text"}
                  </p>
                </div>
                <div className={styles.row}>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      onSelect({
                        id: asset.id,
                        url: asset.publicUrl,
                        alt: asset.alt || "",
                        filename: asset.filename || "",
                        contentType: asset.contentType || "",
                      })
                    }
                  >
                    Use media
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
