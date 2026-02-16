import { Button } from "@/components/ui";

function formatDate(value) {
  if (!value) return "Unknown time";
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Unknown time";
  return new Date(timestamp).toLocaleString();
}

export default function AlertsPanel({
  styles,
  workspaceId,
  rows,
  isLoading,
  statusFilter,
  onStatusFilterChange,
  statusMessage,
  onRefresh,
  onOpenAlert,
}) {
  return (
    <section id="alerts-list" className={styles.panel}>
      <div className={styles.pageListHeader}>
        <div className={styles.pageListTitleGroup}>
          <h2 className={styles.panelTitle}>Alerts</h2>
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

      {!workspaceId ? <p className={styles.status}>Load a workspace to view alerts.</p> : null}

      {workspaceId ? (
        <div className={styles.activityControls}>
          <label className={styles.pageListSizeControl}>
            Status
            <select
              className={`${styles.input} ${styles.activityFilterSelect}`}
              value={statusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value)}
            >
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="">All</option>
            </select>
          </label>
        </div>
      ) : null}

      {statusMessage ? <p className={styles.status}>{statusMessage}</p> : null}
      {workspaceId && !isLoading && rows.length === 0 ? <p className={styles.status}>No alerts found.</p> : null}

      {workspaceId && rows.length > 0 ? (
        <ul className={styles.list}>
          {rows.map((row) => (
            <li key={`alert-row-${row.id}`} className={styles.listItem}>
              <p className={styles.listTitle}>{row.message || "Alert"}</p>
              <p className={styles.helpText}>
                {formatDate(row.createdAt)}
                {" | "}
                {row.operation || row.category || "publish"}
                {" | "}
                {row.reasonCode || "unknown"}
                {" | "}
                Status: {row.status || "open"}
              </p>
              <p className={styles.helpText}>
                Site: {row.siteId || "n/a"}
                {" | "}
                Page: {row.pageId || "n/a"}
              </p>
              <div className={styles.row}>
                <Button type="button" size="sm" variant="secondary" onClick={() => onOpenAlert(row)}>
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
