import { Button } from "@/components/ui";

export default function DashboardActionPanel({
  styles,
  activeDashboardAction,
  onWorkspaceSubmit,
  workspaceIdInput,
  onWorkspaceIdChange,
  onCreateSite,
  siteNameInput,
  onSiteNameChange,
  siteSlugInput,
  onSiteSlugChange,
  workspaceId,
  onCreatePage,
  pageTitleInput,
  onPageTitleChange,
  pageSlugInput,
  onPageSlugChange,
  selectedSiteId,
  parentPageIdInput,
  onParentPageIdChange,
  selectedSitePages,
  onCloseAction,
}) {
  if (!activeDashboardAction) return null;

  return (
    <section id="dashboard-action-panel" className={styles.panel}>
      <h2 className={styles.panelTitle}>
        {activeDashboardAction === "workspace"
          ? "Switch workspace"
          : activeDashboardAction === "site"
            ? "Add site"
            : "Add page"}
      </h2>

      {activeDashboardAction === "workspace" ? (
        <form className={styles.form} onSubmit={onWorkspaceSubmit}>
          <label className={styles.label}>
            Workspace ID
            <input
              className={styles.input}
              type="text"
              value={workspaceIdInput}
              onChange={(event) => onWorkspaceIdChange(event.target.value)}
              placeholder="ws_main"
              required
            />
          </label>
          <Button type="submit">Load workspace</Button>
        </form>
      ) : null}

      {activeDashboardAction === "site" ? (
        <form className={styles.form} onSubmit={onCreateSite}>
          <label className={styles.label}>
            Site name
            <input
              className={styles.input}
              type="text"
              value={siteNameInput}
              onChange={(event) => onSiteNameChange(event.target.value)}
              placeholder="Acme Marketing"
              required
              disabled={!workspaceId}
            />
          </label>
          <label className={styles.label}>
            Slug (optional)
            <input
              className={styles.input}
              type="text"
              value={siteSlugInput}
              onChange={(event) => onSiteSlugChange(event.target.value)}
              placeholder="acme-marketing"
              disabled={!workspaceId}
            />
          </label>
          <div className={styles.row}>
            <Button type="submit" disabled={!workspaceId}>
              Create site
            </Button>
            <Button type="button" variant="secondary" onClick={onCloseAction}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {activeDashboardAction === "page" ? (
        <form className={styles.form} onSubmit={onCreatePage}>
          <label className={styles.label}>
            Page title
            <input
              className={styles.input}
              type="text"
              value={pageTitleInput}
              onChange={(event) => onPageTitleChange(event.target.value)}
              placeholder="Pricing"
              required
              disabled={!selectedSiteId}
            />
          </label>
          <label className={styles.label}>
            Slug (optional)
            <input
              className={styles.input}
              type="text"
              value={pageSlugInput}
              onChange={(event) => onPageSlugChange(event.target.value)}
              placeholder="pricing"
              disabled={!selectedSiteId}
            />
          </label>
          <label className={styles.label}>
            Parent page (optional)
            <select
              className={styles.input}
              value={parentPageIdInput}
              onChange={(event) => onParentPageIdChange(event.target.value)}
              disabled={!selectedSiteId}
            >
              <option value="">Root level</option>
              {selectedSitePages.map((page) => (
                <option key={`parent-option-${page.id}`} value={page.id}>
                  {page.title}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.row}>
            <Button type="submit" disabled={!selectedSiteId}>
              Create page
            </Button>
            <Button type="button" variant="secondary" onClick={onCloseAction}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
