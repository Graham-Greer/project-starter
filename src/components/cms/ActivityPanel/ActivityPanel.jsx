import { Button } from "@/components/ui";

const ACTION_OPTIONS = [
  { value: "", label: "All actions" },
  { value: "site.created", label: "Site created" },
  { value: "site.updated", label: "Site updated" },
  { value: "page.created", label: "Page created" },
  { value: "page.updated", label: "Page updated" },
  { value: "page.deleted", label: "Page deleted" },
  { value: "page.cloned", label: "Page cloned" },
  { value: "page.blocks.saved", label: "Blocks saved" },
  { value: "page.published", label: "Page published" },
  { value: "page.unpublished", label: "Page unpublished" },
  { value: "page.publish_rollback", label: "Publish rollback" },
];

function formatDate(value) {
  if (!value) return "Unknown time";
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Unknown time";
  return new Date(timestamp).toLocaleString();
}

export default function ActivityPanel({
  styles,
  workspaceId,
  selectedSiteId,
  selectedSitePages,
  rows,
  isLoading,
  statusMessage,
  preset,
  onPresetChange,
  actionFilter,
  onActionFilterChange,
  pageFilter,
  onPageFilterChange,
  onRefresh,
  onOpenRow,
}) {
  return (
    <section id="activity-list" className={styles.panel}>
      <div className={styles.pageListHeader}>
        <div className={styles.pageListTitleGroup}>
          <h2 className={styles.panelTitle}>Activity</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={onRefresh}
            loading={isLoading}
            disabled={!workspaceId}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {!workspaceId ? <p className={styles.status}>Load a workspace to view activity.</p> : null}

      {workspaceId ? (
        <div className={styles.activityControls}>
          <div className={styles.row}>
            <Button size="sm" variant={preset === "all" ? "primary" : "secondary"} onClick={() => onPresetChange("all")}>
              All
            </Button>
            <Button size="sm" variant={preset === "publishing" ? "primary" : "secondary"} onClick={() => onPresetChange("publishing")}>
              Publishing
            </Button>
            <Button size="sm" variant={preset === "content" ? "primary" : "secondary"} onClick={() => onPresetChange("content")}>
              Content edits
            </Button>
            <Button size="sm" variant={preset === "site" ? "primary" : "secondary"} onClick={() => onPresetChange("site")}>
              Site config
            </Button>
          </div>
          <label className={styles.pageListSizeControl}>
            Action
            <select
              className={`${styles.input} ${styles.activityFilterSelect}`}
              value={actionFilter}
              onChange={(event) => onActionFilterChange(event.target.value)}
            >
              {ACTION_OPTIONS.map((option) => (
                <option key={`activity-action-${option.value || "all"}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.pageListSizeControl}>
            Page
            <select
              className={`${styles.input} ${styles.activityFilterSelect}`}
              value={pageFilter}
              onChange={(event) => onPageFilterChange(event.target.value)}
              disabled={!selectedSiteId}
            >
              <option value="">{selectedSiteId ? "All pages" : "Select a site first"}</option>
              {(selectedSitePages || []).map((page) => (
                <option key={`activity-page-${page.id}`} value={page.id}>
                  {page.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {statusMessage ? <p className={styles.status}>{statusMessage}</p> : null}
      {workspaceId && !isLoading && rows.length === 0 ? <p className={styles.status}>No activity found.</p> : null}

      {workspaceId && rows.length > 0 ? (
        <ul className={styles.list}>
          {rows.map((row) => (
            <li key={`activity-row-${row.id}`} className={styles.listItem}>
              <p className={styles.listTitle}>{row.summary || row.action}</p>
              <p className={styles.helpText}>
                {formatDate(row.createdAt)}
                {" | "}
                {row.action}
                {" | "}
                Actor: {row.actor?.label || row.actorUserId || "unknown"}
                {row.actor?.email ? ` (${row.actor.email})` : ""}
              </p>
              <p className={styles.helpText}>
                Site: {row.siteId || "n/a"}
                {" | "}
                Page: {row.pageId || "n/a"}
              </p>
              <div className={styles.row}>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => onOpenRow(row)}
                >
                  Open
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
