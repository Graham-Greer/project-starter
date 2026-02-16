import { useMemo, useState } from "react";
import { Icon } from "@/components/primitives";
import { Button } from "@/components/ui";

function getFixTargetForCheck(checkId = "") {
  if (!checkId) return null;
  const mapping = {
    title: { elementId: "page-settings-title", focus: true },
    slug: { elementId: "page-settings-slug", focus: true },
    seo: { elementId: "page-settings-seo-title", focus: true },
    "seo-meta-title": { elementId: "page-settings-seo-title", focus: true },
    "seo-meta-description": { elementId: "page-settings-seo-description", focus: true },
    "seo-og-image": { elementId: "page-settings-og-image", focus: true },
    blocks: { elementId: "page-sections-list", focus: false },
    "blocks-schema": { elementId: "page-sections-list", focus: false },
    "header-config": { elementId: "navigation-panel", focus: false, view: "navigation" },
    "navigation-config": { elementId: "navigation-panel", focus: false, view: "navigation" },
    "navigation-links": { elementId: "navigation-panel", focus: false, view: "navigation" },
    "media-assets": { elementId: "media-library", focus: false, view: "media" },
  };
  return mapping[checkId] || null;
}

export default function PageSettingsPanel({
  styles,
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
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showPrePublishDetails, setShowPrePublishDetails] = useState(false);
  const [isPublishHistoryCollapsed, setIsPublishHistoryCollapsed] = useState(true);
  const isErrorMessage = Boolean(pageTreeStatusMessage) && /(error|failed|invalid|not found|must|cannot|unable|could not)/i.test(pageTreeStatusMessage);
  const hasPrePublishChecks = Array.isArray(prePublishChecks) && prePublishChecks.length > 0;
  const hasPrePublishFailures = useMemo(
    () => (hasPrePublishChecks ? prePublishChecks.some((check) => check.status !== "pass") : false),
    [hasPrePublishChecks, prePublishChecks]
  );
  const prePublishPassed = hasPrePublishChecks && !hasPrePublishFailures;
  const isPublished = selectedPage?.status === "published";
  const hasUnpublishedChanges = Boolean(selectedPage?.hasUnpublishedChanges);
  const canPublishNow = prePublishPassed && (!isPublished || hasUnpublishedChanges);
  const publishButtonLabel = !isPublished ? "Publish" : "Republish";
  const publishStateLabel = isPublished
    ? hasUnpublishedChanges
      ? "Published (changes pending)"
      : "Published"
    : "Draft";
  const failedPrePublishChecks = hasPrePublishChecks
    ? prePublishChecks.filter((check) => check.status !== "pass")
    : [];
  const canShowFailureSummary = failedPrePublishChecks.length > 0;

  if (!selectedPage) return null;
  const shouldShowPrePublishDetails = hasPrePublishFailures || showPrePublishDetails;
  const contentId = "page-settings-content";
  const handleJumpToFix = (checkId) => {
    const target = getFixTargetForCheck(checkId);
    if (!target?.elementId) return;
    if (target.view === "navigation" && typeof onOpenNavigationSettings === "function") {
      onOpenNavigationSettings();
    }
    if (target.view === "media" && typeof onOpenMediaLibrary === "function") {
      onOpenMediaLibrary();
    }
    window.setTimeout(() => {
      const node = document.getElementById(target.elementId);
      if (!node) return;
      node.scrollIntoView({ behavior: "smooth", block: "start" });
      if (target.focus && typeof node.focus === "function") {
        window.setTimeout(() => node.focus(), 220);
      }
    }, target.view === "navigation" || target.view === "media" ? 60 : 0);
  };

  return (
    <section id="page-settings" className={styles.panel}>
      <h2 className={styles.panelTitle}>
        <button
          type="button"
          className={styles.panelCollapseTrigger}
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-expanded={!isCollapsed}
          aria-controls={contentId}
        >
          <span>Page settings</span>
          <Icon
            name={isCollapsed ? "chevronDown" : "chevronUp"}
            size="1rem"
            className={styles.panelCollapseIcon}
            decorative={true}
          />
        </button>
      </h2>
      {!isCollapsed ? (
        <div id={contentId} className={styles.pageSettingsContent}>
          <p className={styles.status}>Status: {publishStateLabel}</p>
          {pageTreeStatusMessage ? <p className={isErrorMessage ? styles.error : styles.status}>{pageTreeStatusMessage}</p> : null}
          <form className={styles.form} onSubmit={onUpdatePage}>
            <label className={styles.label}>
              Page title
              <input
                id="page-settings-title"
                className={styles.input}
                type="text"
                value={pageSettingsTitleInput}
                onChange={(event) => onPageSettingsTitleChange(event.target.value)}
                required
              />
            </label>
            <label className={styles.label}>
              Page slug
              <input
                id="page-settings-slug"
                className={styles.input}
                type="text"
                value={pageSettingsSlugInput}
                onChange={(event) => onPageSettingsSlugChange(event.target.value)}
                placeholder="page-slug"
              />
            </label>
            <label className={styles.label}>
              SEO title
              <input
                id="page-settings-seo-title"
                className={styles.input}
                type="text"
                value={pageSettingsMetaTitleInput}
                onChange={(event) => onPageSettingsMetaTitleChange(event.target.value)}
                placeholder="Search result title"
                maxLength={70}
              />
              <span className={styles.helpText}>
                Recommended up to 60 characters. {pageSettingsMetaTitleInput.length}/70
              </span>
            </label>
            <label className={styles.label}>
              SEO description
              <textarea
                id="page-settings-seo-description"
                className={styles.textarea}
                value={pageSettingsMetaDescriptionInput}
                onChange={(event) => onPageSettingsMetaDescriptionChange(event.target.value)}
                placeholder="Search result description"
                maxLength={170}
              />
              <span className={styles.helpText}>
                Recommended up to 160 characters. {pageSettingsMetaDescriptionInput.length}/170
              </span>
            </label>
            <label className={styles.label}>
              OG image URL
              <input
                id="page-settings-og-image"
                className={styles.input}
                type="url"
                value={pageSettingsOgImageUrlInput}
                onChange={(event) => onPageSettingsOgImageUrlChange(event.target.value)}
                placeholder="https://cdn.example.com/og/page-image.jpg"
                maxLength={2048}
              />
              <span className={styles.helpText}>
                Public `https://` image URL used for social sharing cards (recommended 1200x630).
              </span>
              <div className={styles.row}>
                <Button type="button" size="sm" variant="secondary" onClick={onOpenOgImageMediaPicker}>
                  Choose from media library
                </Button>
              </div>
            </label>
            <label className={styles.label}>
              Parent page
              <select
                className={styles.input}
                value={moveParentPageIdInput}
                onChange={(event) => onMoveParentPageIdChange(event.target.value)}
              >
                <option value="">No parent page</option>
                {availableParentPages.map((page) => (
                  <option key={`move-parent-${page.id}`} value={page.id}>
                    {page.title}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" variant="secondary" size="sm" disabled={isUpdatingPage}>
              {isUpdatingPage ? "Updating page..." : didUpdatePage ? "Page updated" : "Update page"}
            </Button>
          </form>
          <div className={styles.form}>
            {!prePublishPassed ? (
              <Button type="button" size="sm" variant="secondary" onClick={onRunPrePublishValidation} loading={isRunningPrePublishValidation}>
                {isRunningPrePublishValidation ? "Running checks..." : "Run pre-publish check"}
              </Button>
            ) : null}
            {prePublishStatusMessage ? (
              <p className={/passed/i.test(prePublishStatusMessage) ? styles.status : styles.error}>{prePublishStatusMessage}</p>
            ) : null}
            {canShowFailureSummary ? (
              <div className={styles.errorNotice}>
                <p className={styles.listTitle}>Issues to resolve before publish</p>
                <ul className={styles.list}>
                  {failedPrePublishChecks.map((check) => (
                    <li key={`prepublish-failure-${check.id}`} className={styles.listItem}>
                      <p className={styles.listTitle}>{check.label}</p>
                      <p className={styles.helpText}>{check.message}</p>
                      {getFixTargetForCheck(check.id) ? (
                        <div className={styles.row}>
                          <Button type="button" size="sm" variant="secondary" onClick={() => handleJumpToFix(check.id)}>
                            Fix this
                          </Button>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {canPublishNow ? (
              <Button type="button" size="sm" onClick={onPublishPage} loading={isPublishingPage}>
                {isPublishingPage ? "Publishing..." : didPublishPage ? "Published" : publishButtonLabel}
              </Button>
            ) : null}
            {isPublished ? (
              <Button type="button" size="sm" variant="secondary" tone="danger" onClick={onUnpublishPage} loading={isUnpublishingPage}>
                {isUnpublishingPage ? "Unpublishing..." : "Unpublish"}
              </Button>
            ) : null}
            {publishStatusMessage ? (
              <p className={/published/i.test(publishStatusMessage) ? styles.status : styles.error}>{publishStatusMessage}</p>
            ) : null}
            <div className={styles.row}>
              <Button
                type="button"
                size="sm"
                variant="tertiary"
                onClick={() => setIsPublishHistoryCollapsed((prev) => !prev)}
              >
                {isPublishHistoryCollapsed ? "Show publish history" : "Hide publish history"}
                <Icon
                  name={isPublishHistoryCollapsed ? "chevronDown" : "chevronUp"}
                  size="1rem"
                  className={styles.panelCollapseIcon}
                  decorative={true}
                />
              </Button>
            </div>
            {!isPublishHistoryCollapsed ? (
              <>
                <div className={styles.row}>
                  <Button type="button" size="sm" variant="secondary" onClick={onLoadPublishHistory} loading={isLoadingPublishHistory}>
                    {isLoadingPublishHistory ? "Loading history..." : "Refresh publish history"}
                  </Button>
                </div>
                {publishHistoryStatusMessage ? (
                  <p className={/failed|error|invalid|not found/i.test(publishHistoryStatusMessage) ? styles.error : styles.status}>
                    {publishHistoryStatusMessage}
                  </p>
                ) : null}
                {Array.isArray(publishHistoryEntries) && publishHistoryEntries.length > 0 ? (
                  <ul className={styles.list}>
                    {publishHistoryEntries.map((entry) => (
                      <li key={`publish-history-${entry.id}`} className={styles.listItem}>
                        <p className={styles.listTitle}>
                          {entry.title || "Untitled version"}
                          {" - "}
                          <span className={styles.helpText}>
                            {entry.publishedAt ? new Date(entry.publishedAt).toLocaleString() : "Unknown date"}
                          </span>
                        </p>
                        <p className={styles.helpText}>Version ID: {entry.id}</p>
                        <p className={styles.helpText}>Path: {entry.path || "/"}</p>
                        <div className={styles.row}>
                          {entry.isCurrentPublishedVersion ? (
                            <span className={styles.status}>Current published version</span>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => onRollbackPageVersion(entry.id)}
                              loading={isRollingBackPublish}
                              disabled={isRollingBackPublish}
                            >
                              {isRollingBackPublish ? "Rolling back..." : "Rollback to this version"}
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </>
            ) : null}
            {hasPrePublishChecks && !hasPrePublishFailures ? (
              <div className={styles.row}>
                <Button
                  type="button"
                  size="sm"
                  variant="tertiary"
                  onClick={() => setShowPrePublishDetails((prev) => !prev)}
                >
                  {shouldShowPrePublishDetails ? "Hide details" : "Show details"}
                </Button>
              </div>
            ) : null}
            {hasPrePublishChecks && shouldShowPrePublishDetails ? (
              <ul className={styles.list}>
                {prePublishChecks.map((check) => (
                  <li key={`prepublish-check-${check.id}`} className={styles.listItem}>
                    <p className={styles.listTitle}>
                      {check.label}
                      {" - "}
                      <span className={check.status === "pass" ? styles.status : styles.error}>
                        {check.status === "pass" ? "Pass" : "Fail"}
                      </span>
                    </p>
                    <p className={styles.helpText}>{check.message}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
