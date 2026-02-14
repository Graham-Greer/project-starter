import { useMemo, useState } from "react";
import { Icon } from "@/components/primitives";
import { Button } from "@/components/ui";

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
  onRunPrePublishValidation,
  isRunningPrePublishValidation,
  prePublishStatusMessage,
  prePublishChecks,
  onPublishPage,
  isPublishingPage,
  publishStatusMessage,
  didPublishPage,
  moveParentPageIdInput,
  onMoveParentPageIdChange,
  availableParentPages,
  isUpdatingPage,
  didUpdatePage,
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showPrePublishDetails, setShowPrePublishDetails] = useState(false);
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

  if (!selectedPage) return null;
  const shouldShowPrePublishDetails = hasPrePublishFailures || showPrePublishDetails;
  const contentId = "page-settings-content";

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
            {canPublishNow ? (
              <Button type="button" size="sm" onClick={onPublishPage} loading={isPublishingPage}>
                {isPublishingPage ? "Publishing..." : didPublishPage ? "Published" : publishButtonLabel}
              </Button>
            ) : null}
            {publishStatusMessage ? (
              <p className={/published/i.test(publishStatusMessage) ? styles.status : styles.error}>{publishStatusMessage}</p>
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
