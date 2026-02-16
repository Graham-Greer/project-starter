import { useMemo, useState } from "react";
import NextImage from "next/image";
import { Button } from "@/components/ui";

function formatAssetTypeLabel(contentType = "") {
  if (contentType.startsWith("image/")) return "Image";
  if (contentType.startsWith("video/")) return "Video";
  if (contentType === "application/pdf") return "PDF";
  return "File";
}

function formatAssetSize(sizeBytes = 0) {
  const size = Number(sizeBytes) || 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPanel({
  styles,
  workspaceId,
  selectedSite,
  rows,
  isLoading,
  isUploading,
  statusMessage,
  searchQuery,
  onSearchQueryChange,
  onRefresh,
  onUpload,
  onDeleteAsset,
  onUpdateAssetAlt,
}) {
  const [assetAltDraftById, setAssetAltDraftById] = useState({});
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadFile, setUploadFile] = useState(null);

  const visibleRows = useMemo(() => {
    const search = String(searchQuery || "").trim().toLowerCase();
    if (!search) return rows;
    return rows.filter((asset) => `${asset.filename || ""} ${asset.alt || ""}`.toLowerCase().includes(search));
  }, [rows, searchQuery]);

  const selectedAsset = useMemo(() => {
    if (!visibleRows.length) return null;
    const matched = visibleRows.find((asset) => asset.id === selectedAssetId);
    return matched || visibleRows[0];
  }, [selectedAssetId, visibleRows]);

  const selectedAltDraft = selectedAsset
    ? (Object.hasOwn(assetAltDraftById, selectedAsset.id) ? assetAltDraftById[selectedAsset.id] : (selectedAsset.alt || ""))
    : "";
  const selectedAltChanged = Boolean(selectedAsset) && selectedAltDraft !== (selectedAsset?.alt || "");
  const selectedIsImage = String(selectedAsset?.contentType || "").startsWith("image/");

  return (
    <section id="media-library" className={styles.panel}>
      <div className={styles.pageListHeader}>
        <h2 className={styles.panelTitle}>Media library</h2>
        <div className={styles.row}>
          <Button type="button" size="sm" variant="secondary" onClick={onRefresh} disabled={!workspaceId || !selectedSite?.id}>
            Refresh
          </Button>
        </div>
      </div>

      {!workspaceId ? <p className={styles.status}>Load a workspace to manage media.</p> : null}
      {workspaceId && !selectedSite?.id ? <p className={styles.status}>Select a site to upload and browse media.</p> : null}

      {workspaceId && selectedSite?.id ? (
        <>
          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();
              const formElement = event.currentTarget;
              if (!uploadFile) return;
              onUpload({ file: uploadFile, alt: uploadAlt }).then((ok) => {
                if (ok) {
                  setUploadFile(null);
                  setUploadAlt("");
                  formElement.reset();
                }
              });
            }}
          >
            <h3 className={styles.listTitle}>Upload media</h3>
            <label className={styles.label}>
              File
              <input
                className={styles.input}
                type="file"
                accept="image/*,video/*,application/pdf"
                onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
              />
            </label>
            <label className={styles.label}>
              Alt text (for images)
              <input
                className={styles.input}
                type="text"
                value={uploadAlt}
                onChange={(event) => setUploadAlt(event.target.value)}
                placeholder="Describe what this image shows"
              />
              <span className={styles.helpText}>
                Required for image uploads to support accessibility and SEO.
              </span>
            </label>
            <div className={styles.row}>
              <Button type="submit" size="sm" disabled={isUploading || !uploadFile}>
                {isUploading ? "Uploading..." : "Upload media"}
              </Button>
            </div>
          </form>

          <label className={styles.label}>
            Search media
            <input
              type="search"
              className={styles.input}
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search by filename or alt text"
            />
          </label>

          {isLoading ? <p className={styles.status}>Loading media...</p> : null}
          {!isLoading && statusMessage ? (
            <p className={/error|failed|unable/i.test(statusMessage) ? styles.error : styles.status}>{statusMessage}</p>
          ) : null}

          {!isLoading && visibleRows.length > 0 ? (
            <div className={styles.mediaWorkspace}>
              <ul className={styles.mediaGalleryGrid}>
                {visibleRows.map((asset) => (
                  <li key={`media-row-${asset.id}`} className={styles.mediaGalleryCell}>
                    <button
                      type="button"
                      className={`${styles.mediaGalleryCard} ${selectedAsset?.id === asset.id ? styles.mediaGalleryCardActive : ""}`.trim()}
                      onClick={() => setSelectedAssetId(asset.id)}
                    >
                      {String(asset.contentType || "").startsWith("image/") && asset.publicUrl ? (
                        <NextImage
                          src={asset.publicUrl}
                          alt={asset.alt || asset.filename || "Image preview"}
                          width={320}
                          height={180}
                          unoptimized
                          className={styles.mediaGalleryThumb}
                        />
                      ) : (
                        <div className={styles.mediaGalleryType}>{formatAssetTypeLabel(asset.contentType)}</div>
                      )}
                      <div className={styles.mediaGalleryMeta}>
                        <p className={styles.mediaGalleryName}>{asset.filename}</p>
                        <p className={styles.helpText}>{formatAssetSize(asset.sizeBytes)}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              {selectedAsset ? (
                <aside className={styles.mediaDetailsPanel}>
                  <h3 className={styles.listTitle}>Media details</h3>
                  <p className={styles.helpText}>{formatAssetTypeLabel(selectedAsset.contentType)}</p>
                  <label className={styles.label}>
                    File name
                    <input type="text" className={styles.input} value={selectedAsset.filename || ""} readOnly />
                  </label>
                  <label className={styles.label}>
                    Date added
                    <input
                      type="text"
                      className={styles.input}
                      value={selectedAsset.createdAt ? new Date(selectedAsset.createdAt).toLocaleString() : "Unknown"}
                      readOnly
                    />
                  </label>
                  <label className={styles.label}>
                    Alt text
                    <input
                      type="text"
                      className={styles.input}
                      value={selectedAltDraft}
                      onChange={(event) =>
                        setAssetAltDraftById((prev) => ({
                          ...prev,
                          [selectedAsset.id]: event.target.value,
                        }))
                      }
                      placeholder={selectedIsImage ? "Describe what this image shows" : "Optional for non-image files"}
                    />
                    <span className={styles.helpText}>
                      {selectedIsImage ? "Used by screen readers and SEO previews." : "Optional for non-image files."}
                    </span>
                  </label>
                  <div className={styles.row}>
                    {selectedAsset.publicUrl ? (
                      <a className={styles.dashboardInlineLink} href={selectedAsset.publicUrl} target="_blank" rel="noopener noreferrer">
                        Open file
                      </a>
                    ) : null}
                  </div>
                  <div className={styles.row}>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => onUpdateAssetAlt(selectedAsset.id, selectedAltDraft)}
                      disabled={!selectedAltChanged}
                    >
                      Save alt text
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      tone="danger"
                      onClick={() => onDeleteAsset(selectedAsset.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </aside>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
