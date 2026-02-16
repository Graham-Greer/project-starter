import { Button } from "@/components/ui";
import { useState } from "react";

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
  onViewActivity,
  onViewAlerts,
  onUpdateSiteRuntimeMode,
  isUpdatingSiteRuntime,
}) {
  const [runtimeModeDraftBySiteId, setRuntimeModeDraftBySiteId] = useState({});
  const selectedSiteRuntimeMode = selectedSite?.runtimeMode || "static";
  const runtimeModeInput = selectedSite?.id
    ? runtimeModeDraftBySiteId[selectedSite.id] || selectedSiteRuntimeMode
    : selectedSiteRuntimeMode;

  const runtimeModeChanged = runtimeModeInput !== selectedSiteRuntimeMode;

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
        <div className={styles.dashboardItem}>
          <span className={styles.dashboardLabel}>Site activity</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={onViewActivity}
            disabled={!workspaceId}
          >
            View audits
          </Button>
        </div>
        <div className={styles.dashboardItem}>
          <span className={styles.dashboardLabel}>System alerts</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={onViewAlerts}
            disabled={!workspaceId}
          >
            View alerts
          </Button>
        </div>
        {selectedSite ? (
          <div className={styles.dashboardRuntimeRow}>
            <label className={styles.label}>
              Runtime mode
              <select
                className={styles.input}
                value={runtimeModeInput}
                onChange={(event) => {
                  const nextMode = event.target.value;
                  if (!selectedSite?.id) return;
                  setRuntimeModeDraftBySiteId((prev) => ({ ...prev, [selectedSite.id]: nextMode }));
                }}
                disabled={isUpdatingSiteRuntime}
              >
                <option value="static">Static</option>
                <option value="cms-live">CMS live</option>
              </select>
            </label>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onUpdateSiteRuntimeMode(runtimeModeInput)}
              disabled={!runtimeModeChanged || isUpdatingSiteRuntime}
            >
              {isUpdatingSiteRuntime ? "Updating..." : "Update mode"}
            </Button>
          </div>
        ) : null}
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
