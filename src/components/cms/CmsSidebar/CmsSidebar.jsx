import DashboardActionPanel from "@/components/cms/DashboardActionPanel/DashboardActionPanel";
import DashboardPanel from "@/components/cms/DashboardPanel/DashboardPanel";
import PageSettingsPanel from "@/components/cms/PageSettingsPanel/PageSettingsPanel";

export default function CmsSidebar({
  styles,
  isEditingPage,
  mainView,
  onChangeMainView,
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
  activeDashboardAction,
  onToggleDashboardAction,
  onViewActivity,
  onViewAlerts,
  onUpdateSiteRuntimeMode,
  isUpdatingSiteRuntime,
  onWorkspaceSubmit,
  workspaceIdInput,
  onWorkspaceIdChange,
  onCreateSite,
  siteNameInput,
  onSiteNameChange,
  siteSlugInput,
  onSiteSlugChange,
  onCreatePage,
  pageTitleInput,
  onPageTitleChange,
  pageSlugInput,
  onPageSlugChange,
  parentPageIdInput,
  onParentPageIdChange,
  selectedSitePages,
  onCloseAction,
  selectedPage,
  pageTreeStatusMessage,
  onUpdatePage,
  pageSettingsTitleInput,
  onPageSettingsTitleChange,
  pageSettingsSlugInput,
  onPageSettingsSlugChange,
  pageSettingsMetaTitleInput,
  onPageSettingsMetaTitleChange,
  pageSettingsMetaDescriptionInput,
  onPageSettingsMetaDescriptionChange,
  pageSettingsOgImageUrlInput,
  onPageSettingsOgImageUrlChange,
  onOpenOgImageMediaPicker,
  onRunPrePublishValidation,
  isRunningPrePublishValidation,
  prePublishStatusMessage,
  prePublishChecks,
  onPublishPage,
  isPublishingPage,
  onUnpublishPage,
  isUnpublishingPage,
  publishStatusMessage,
  didPublishPage,
  publishHistoryEntries,
  isLoadingPublishHistory,
  isRollingBackPublish,
  publishHistoryStatusMessage,
  onLoadPublishHistory,
  onRollbackPageVersion,
  moveParentPageIdInput,
  onMoveParentPageIdChange,
  availableParentPages,
  isUpdatingPage,
  didUpdatePage,
  onOpenNavigationSettings,
  onOpenMediaLibrary,
}) {
  return (
    <aside className={styles.sidebar}>
      {!isEditingPage ? (
        <>
          <DashboardPanel
            styles={styles}
            workspaceId={workspaceId}
            workspaceAccess={workspaceAccess}
            selectedSite={selectedSite}
            workspaceStatusMessage={workspaceStatusMessage}
            siteStatusMessage={siteStatusMessage}
            pageStatusMessage={pageStatusMessage}
            isLoadingSites={isLoadingSites}
            sites={sites}
            selectedSiteId={selectedSiteId}
            onSelectSite={onSelectSite}
            onToggleDashboardAction={onToggleDashboardAction}
            onViewActivity={onViewActivity}
            onViewAlerts={onViewAlerts}
            onUpdateSiteRuntimeMode={onUpdateSiteRuntimeMode}
            isUpdatingSiteRuntime={isUpdatingSiteRuntime}
          />
          <DashboardActionPanel
            styles={styles}
            activeDashboardAction={activeDashboardAction}
            onWorkspaceSubmit={onWorkspaceSubmit}
            workspaceIdInput={workspaceIdInput}
            onWorkspaceIdChange={onWorkspaceIdChange}
            onCreateSite={onCreateSite}
            siteNameInput={siteNameInput}
            onSiteNameChange={onSiteNameChange}
            siteSlugInput={siteSlugInput}
            onSiteSlugChange={onSiteSlugChange}
            workspaceId={workspaceId}
            onCreatePage={onCreatePage}
            pageTitleInput={pageTitleInput}
            onPageTitleChange={onPageTitleChange}
            pageSlugInput={pageSlugInput}
            onPageSlugChange={onPageSlugChange}
            selectedSiteId={selectedSiteId}
            parentPageIdInput={parentPageIdInput}
            onParentPageIdChange={onParentPageIdChange}
            selectedSitePages={selectedSitePages}
            onCloseAction={onCloseAction}
          />

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Content</h2>
            <div className={styles.sidebarViewNav}>
              <button
                type="button"
                className={`${styles.sidebarViewNavButton} ${mainView === "pages" ? styles.sidebarViewNavButtonActive : ""}`.trim()}
                onClick={() => onChangeMainView("pages")}
              >
                Pages
              </button>
              <button
                type="button"
                className={`${styles.sidebarViewNavButton} ${mainView === "navigation" ? styles.sidebarViewNavButtonActive : ""}`.trim()}
                onClick={() => onChangeMainView("navigation")}
                disabled={!selectedSiteId}
              >
                Navigation
              </button>
              <button
                type="button"
                className={`${styles.sidebarViewNavButton} ${mainView === "media" ? styles.sidebarViewNavButtonActive : ""}`.trim()}
                onClick={() => onChangeMainView("media")}
                disabled={!selectedSiteId}
              >
                Media
              </button>
            </div>
          </section>
        </>
      ) : null}

      {isEditingPage ? (
        <>
          <PageSettingsPanel
            styles={styles}
            selectedPage={selectedPage}
            pageTreeStatusMessage={pageTreeStatusMessage}
            onUpdatePage={onUpdatePage}
            pageSettingsTitleInput={pageSettingsTitleInput}
            onPageSettingsTitleChange={onPageSettingsTitleChange}
            pageSettingsSlugInput={pageSettingsSlugInput}
            onPageSettingsSlugChange={onPageSettingsSlugChange}
            pageSettingsMetaTitleInput={pageSettingsMetaTitleInput}
            onPageSettingsMetaTitleChange={onPageSettingsMetaTitleChange}
            pageSettingsMetaDescriptionInput={pageSettingsMetaDescriptionInput}
            onPageSettingsMetaDescriptionChange={onPageSettingsMetaDescriptionChange}
            pageSettingsOgImageUrlInput={pageSettingsOgImageUrlInput}
            onPageSettingsOgImageUrlChange={onPageSettingsOgImageUrlChange}
            onOpenOgImageMediaPicker={onOpenOgImageMediaPicker}
            onRunPrePublishValidation={onRunPrePublishValidation}
            isRunningPrePublishValidation={isRunningPrePublishValidation}
            prePublishStatusMessage={prePublishStatusMessage}
            prePublishChecks={prePublishChecks}
            onPublishPage={onPublishPage}
            isPublishingPage={isPublishingPage}
            onUnpublishPage={onUnpublishPage}
            isUnpublishingPage={isUnpublishingPage}
            publishStatusMessage={publishStatusMessage}
            didPublishPage={didPublishPage}
            publishHistoryEntries={publishHistoryEntries}
            isLoadingPublishHistory={isLoadingPublishHistory}
            isRollingBackPublish={isRollingBackPublish}
            publishHistoryStatusMessage={publishHistoryStatusMessage}
            onLoadPublishHistory={onLoadPublishHistory}
            onRollbackPageVersion={onRollbackPageVersion}
            moveParentPageIdInput={moveParentPageIdInput}
            onMoveParentPageIdChange={onMoveParentPageIdChange}
            availableParentPages={availableParentPages}
            isUpdatingPage={isUpdatingPage}
            didUpdatePage={didUpdatePage}
            onOpenNavigationSettings={onOpenNavigationSettings}
            onOpenMediaLibrary={onOpenMediaLibrary}
          />
        </>
      ) : null}
    </aside>
  );
}
