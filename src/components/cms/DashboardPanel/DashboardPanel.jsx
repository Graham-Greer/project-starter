import { Button } from "@/components/ui";

export default function DashboardPanel({
  styles,
  workspaceId,
  workspaceAccess,
  selectedSite,
  workspaceStatusMessage,
  siteStatusMessage,
  pageStatusMessage,
  isLoadingSites,
  sites,
  selectedSiteId,
  onSelectSite,
  onToggleDashboardAction,
}) {
  return (
    <section id="dashboard-context" className={styles.panel}>
      <div className={styles.dashboardHeader}>
        <h2 className={styles.panelTitle}>Dashboard</h2>
        <Button size="sm" variant="secondary" onClick={() => onToggleDashboardAction("workspace")}>
          Switch workspace
        </Button>
      </div>
      <div className={styles.dashboardList}>
        <div className={styles.dashboardItem}>
          <span className={styles.dashboardLabel}>{workspaceId || "No workspace loaded"}</span>
          <span className={styles.status}>{workspaceAccess?.role || "No role"}</span>
        </div>
        <div className={styles.dashboardItem}>
          <span className={styles.dashboardLabel}>Site: {selectedSite?.name || "None selected"}</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onToggleDashboardAction("site")}
            disabled={!workspaceId}
          >
            Add site
          </Button>
        </div>
        {sites.length > 1 ? (
          <label className={styles.label}>
            Active site
            <select className={styles.input} value={selectedSiteId} onChange={(event) => onSelectSite(event.target.value)}>
              {sites.map((site) => (
                <option key={`site-switch-${site.id}`} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      {workspaceStatusMessage ? <p className={styles.error}>{workspaceStatusMessage}</p> : null}
      {siteStatusMessage ? <p className={styles.status}>{siteStatusMessage}</p> : null}
      {pageStatusMessage ? <p className={styles.status}>{pageStatusMessage}</p> : null}
      {isLoadingSites ? <p className={styles.status}>Loading sites...</p> : null}
      {!isLoadingSites && sites.length === 0 ? <p className={styles.status}>No sites yet for this workspace.</p> : null}
    </section>
  );
}
