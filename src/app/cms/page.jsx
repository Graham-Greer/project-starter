"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCmsAuth } from "@/hooks";
import { useCmsWorkspaceState } from "@/hooks/cms/useCmsWorkspaceState";
import { useCmsPagesData } from "@/hooks/cms/useCmsPagesData";
import { useCmsBlocksEditor } from "@/hooks/cms/useCmsBlocksEditor";
import { useCmsBlockActions } from "@/hooks/cms/useCmsBlockActions";
import { useCmsWorkspacePageActions } from "@/hooks/cms/useCmsWorkspacePageActions";
import { useCmsPageViewModel } from "@/hooks/cms/useCmsPageViewModel";
import { ConfirmationModal } from "@/components/ui";
import { getPropsSchema } from "@/lib/registry/props.schemas";
import { getSectionDefinition, listSectionTypes, SECTIONS_REGISTRY } from "@/lib/registry/sections.registry";
import CmsTopbar from "@/components/cms/CmsTopbar/CmsTopbar";
import CmsSidebar from "@/components/cms/CmsSidebar/CmsSidebar";
import PagesListPanel from "@/components/cms/PagesListPanel/PagesListPanel";
import EditorWorkspace from "@/components/cms/EditorWorkspace/EditorWorkspace";
import {
  formatVariantLabel,
  getDefaultValueForRule,
  getFieldLabel,
} from "@/lib/cms/cms-utils";
import styles from "./cms.module.css";

const PAGE_LIST_SIZE_OPTIONS = [10, 20, 50];

function buildDefaultPropsForSection(sectionType, variant) {
  const definition = getSectionDefinition(sectionType, variant);
  if (!definition) return {};

  const schema = getPropsSchema(definition.propsSchema);
  if (!schema) return {};

  const fields = schema.fields || {};
  const required = new Set(schema.required || []);
  const props = {};

  Object.entries(fields).forEach(([fieldName, rule]) => {
    if (required.has(fieldName)) {
      props[fieldName] = getDefaultValueForRule(rule, true);
      return;
    }
    props[fieldName] = getDefaultValueForRule(rule, false);
  });

  return props;
}

function getFirstVariantForSection(sectionType) {
  const variants = Object.keys(SECTIONS_REGISTRY[sectionType]?.variants || {});
  return variants[0] || "";
}

export default function CmsHomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut } = useCmsAuth();
  const {
    workspaceIdInput,
    setWorkspaceIdInput,
    workspaceId,
    setWorkspaceId,
    workspaceAccess,
    setWorkspaceAccess,
    sites,
    setSites,
    selectedSiteId,
    setSelectedSiteId,
    selectedPageId,
    setSelectedPageId,
    isEditingPage,
    setIsEditingPage,
    pageTitleInput,
    setPageTitleInput,
    pageSlugInput,
    setPageSlugInput,
    pageStatusMessage,
    setPageStatusMessage,
    siteNameInput,
    setSiteNameInput,
    siteSlugInput,
    setSiteSlugInput,
    siteStatusMessage,
    setSiteStatusMessage,
    workspaceStatusMessage,
    setWorkspaceStatusMessage,
    activeDashboardAction,
    setActiveDashboardAction,
    parentPageIdInput,
    setParentPageIdInput,
    pageSettingsTitleInput,
    setPageSettingsTitleInput,
    pageSettingsSlugInput,
    setPageSettingsSlugInput,
    pageSettingsMetaTitleInput,
    setPageSettingsMetaTitleInput,
    pageSettingsMetaDescriptionInput,
    setPageSettingsMetaDescriptionInput,
    pageSettingsOgImageUrlInput,
    setPageSettingsOgImageUrlInput,
    moveParentPageIdInput,
    setMoveParentPageIdInput,
    pageTreeStatusMessage,
    setPageTreeStatusMessage,
    isUpdatingPage,
    setIsUpdatingPage,
    didUpdatePage,
    setDidUpdatePage,
    isRunningPrePublishValidation,
    setIsRunningPrePublishValidation,
    prePublishStatusMessage,
    setPrePublishStatusMessage,
    prePublishChecks,
    setPrePublishChecks,
    isPublishingPage,
    setIsPublishingPage,
    publishStatusMessage,
    setPublishStatusMessage,
    didPublishPage,
    setDidPublishPage,
  } = useCmsWorkspaceState();
  const {
    isLoadingSites,
    setIsLoadingSites,
    sitePagesMap,
    setSitePagesMap,
    pageListPage,
    setPageListPage,
    pageListPageSize,
    setPageListPageSize,
    isLoadingPageList,
    setIsLoadingPageList,
    pagedPageRows,
    setPagedPageRows,
    pageListPagination,
    setPageListPagination,
  } = useCmsPagesData();
  const {
    pageBlocks,
    setPageBlocks,
    lastSavedBlocksJson,
    setLastSavedBlocksJson,
    isLoadingBlocks,
    setIsLoadingBlocks,
    isSavingBlocks,
    setIsSavingBlocks,
    blockStatusMessage,
    setBlockStatusMessage,
    saveNotice,
    setSaveNotice,
    selectedBlockId,
    setSelectedBlockId,
    draggedBlockId,
    setDraggedBlockId,
    dragOverBlockId,
    setDragOverBlockId,
    propsEditorMessage,
    setPropsEditorMessage,
    editorMode,
    setEditorMode,
    previewViewport,
    setPreviewViewport,
    previewTheme,
    setPreviewTheme,
    previewRefreshNonce,
    setPreviewRefreshNonce,
    advancedPropsInputRef,
  } = useCmsBlocksEditor();
  const hasHydratedWorkspaceRef = useRef(false);
  const sectionTypes = listSectionTypes();
  const [newBlockSectionType, setNewBlockSectionType] = useState(sectionTypes[0] || "");
  const [newBlockVariant, setNewBlockVariant] = useState(getFirstVariantForSection(sectionTypes[0] || ""));
  const [pendingDeletePage, setPendingDeletePage] = useState(null);
  const hasUnsavedBlockChanges = JSON.stringify(pageBlocks) !== lastSavedBlocksJson;
  const {
    selectedSectionVariants,
    selectedSectionLabel,
    selectedSite,
    libraryPreviewBlock,
    selectedSitePages,
    totalPageRows,
    maxPageListPage,
    safePageListPage,
    selectedPage,
    availableParentPages,
    selectedBlock,
    selectedBlockSchema,
    selectedBlockFields,
    selectedBlockRequiredFields,
    selectedBlockJson,
    selectedBlockTemplateJson,
    compactSaveMessage,
    previewSrc,
  } = useCmsPageViewModel({
    newBlockSectionType,
    newBlockVariant,
    sites,
    selectedSiteId,
    sitePagesMap,
    pageListPagination,
    selectedPageId,
    pageBlocks,
    selectedBlockId,
    saveNotice,
    previewTheme,
    previewRefreshNonce,
    buildDefaultPropsForSection,
  });

  const confirmDiscardUnsavedChanges = useCallback(() => {
    if (!hasUnsavedBlockChanges) return true;

    const confirmed = window.confirm("You have unsaved block changes. Continue and discard them?");
    if (!confirmed) {
      setBlockStatusMessage("Unsaved changes are still in the composer. Save blocks before switching.");
    }
    return confirmed;
  }, [hasUnsavedBlockChanges, setBlockStatusMessage]);

  const {
    loadBlocks,
    handleAddBlock,
    handleRemoveBlock,
    handleBlockDragStart,
    handleBlockDragOver,
    handleBlockDrop,
    handleBlockDragEnd,
    handleTogglePreviewTheme,
    handleSaveBlocks,
    handleSelectBlock,
    handleUpdateSelectedBlockProps,
    handleApplyAdvancedProps,
    handleFormatAdvancedPropsInput,
    handleResetAdvancedPropsToSchema,
  } = useCmsBlockActions({
    selectedSiteId,
    selectedPageId,
    pageBlocks,
    selectedPage,
    selectedBlockId,
    draggedBlockId,
    newBlockSectionType,
    newBlockVariant,
    buildDefaultPropsForSection,
    setPageBlocks,
    setSitePagesMap,
    setLastSavedBlocksJson,
    setIsLoadingBlocks,
    setIsSavingBlocks,
    setBlockStatusMessage,
    setSaveNotice,
    setSelectedBlockId,
    setDraggedBlockId,
    setDragOverBlockId,
    setPreviewRefreshNonce,
    setPropsEditorMessage,
    setPreviewTheme,
    setPrePublishChecks,
    setPrePublishStatusMessage,
    setPublishStatusMessage,
    setDidPublishPage,
    advancedPropsInputRef,
    selectedBlock,
    selectedBlockSchema,
  });

  const {
    loadPageList,
    loadWorkspace,
    handleWorkspaceSubmit,
    handleCreateSite,
    handleSelectSite,
    handleCreatePage,
    handleMovePageParent,
    handleEditPage,
    handleToggleDashboardAction,
    handleDeletePage,
    handleClonePage,
    handleRunPrePublishValidation,
    handlePublishPage,
  } = useCmsWorkspacePageActions({
    isAuthenticated,
    workspaceIdInput,
    workspaceId,
    selectedSiteId,
    selectedPageId,
    pageTitleInput,
    pageSlugInput,
    parentPageIdInput,
    pageSettingsTitleInput,
    pageSettingsSlugInput,
    pageSettingsMetaTitleInput,
    pageSettingsMetaDescriptionInput,
    pageSettingsOgImageUrlInput,
    moveParentPageIdInput,
    pageListPage,
    pageListPageSize,
    siteNameInput,
    siteSlugInput,
    sitePagesMap,
    confirmDiscardUnsavedChanges,
    loadBlocks,
    setWorkspaceAccess,
    setSites,
    setSelectedSiteId,
    setSelectedPageId,
    setIsLoadingSites,
    setIsEditingPage,
    setWorkspaceStatusMessage,
    setSiteStatusMessage,
    setPageStatusMessage,
    setSitePagesMap,
    setPagedPageRows,
    setPageListPagination,
    setPageBlocks,
    setLastSavedBlocksJson,
    setSelectedBlockId,
    setWorkspaceId,
    setSiteNameInput,
    setSiteSlugInput,
    setPageTitleInput,
    setPageSlugInput,
    setParentPageIdInput,
    setPageTreeStatusMessage,
    setDidUpdatePage,
    setIsUpdatingPage,
    setIsRunningPrePublishValidation,
    setPrePublishStatusMessage,
    setPrePublishChecks,
    setIsPublishingPage,
    setPublishStatusMessage,
    setDidPublishPage,
    setIsLoadingPageList,
    setPageListPage,
    setActiveDashboardAction,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/cms/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (hasHydratedWorkspaceRef.current) return;
    hasHydratedWorkspaceRef.current = true;

    if (!workspaceId) return;
    loadWorkspace(workspaceId).catch((error) => {
      setWorkspaceStatusMessage(error?.message || "Failed to load workspace.");
    });
  }, [isAuthenticated, isLoading, loadWorkspace, setWorkspaceStatusMessage, workspaceId]);

  useEffect(() => {
    if (!saveNotice.message) return undefined;
    const timeoutId = window.setTimeout(() => {
      setSaveNotice({ type: "", message: "" });
    }, 3500);
    return () => window.clearTimeout(timeoutId);
  }, [saveNotice, setSaveNotice]);

  useEffect(() => {
    if (!hasUnsavedBlockChanges) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedBlockChanges]);

  useEffect(() => {
    const selectedSitePages = sitePagesMap[selectedSiteId] || [];
    const selectedPage = selectedSitePages.find((page) => page.id === selectedPageId) || null;
    setPageSettingsTitleInput(selectedPage?.title || "");
    setPageSettingsSlugInput(selectedPage?.slug || "");
    setPageSettingsMetaTitleInput(selectedPage?.seo?.metaTitle || selectedPage?.title || "");
    setPageSettingsMetaDescriptionInput(selectedPage?.seo?.metaDescription || "");
    setPageSettingsOgImageUrlInput(selectedPage?.seo?.ogImageUrl || "");
    setMoveParentPageIdInput(selectedPage?.parentPageId || "");
  }, [
    selectedPageId,
    selectedSiteId,
    setMoveParentPageIdInput,
    setPageSettingsMetaDescriptionInput,
    setPageSettingsMetaTitleInput,
    setPageSettingsOgImageUrlInput,
    setPageSettingsSlugInput,
    setPageSettingsTitleInput,
    sitePagesMap,
  ]);

  useEffect(() => {
    setPrePublishStatusMessage("");
    setPrePublishChecks([]);
    setPublishStatusMessage("");
    setDidPublishPage(false);
  }, [selectedPageId, selectedSiteId, setDidPublishPage, setPrePublishChecks, setPrePublishStatusMessage, setPublishStatusMessage]);

  useEffect(() => {
    setPageListPage(1);
  }, [selectedSiteId, pageListPageSize, setPageListPage]);

  useEffect(() => {
    if (!didUpdatePage) return undefined;
    const timeoutId = window.setTimeout(() => {
      setDidUpdatePage(false);
    }, 2200);
    return () => window.clearTimeout(timeoutId);
  }, [didUpdatePage, setDidUpdatePage]);

  useEffect(() => {
    if (!/passed/i.test(prePublishStatusMessage || "")) return undefined;
    const timeoutId = window.setTimeout(() => {
      setPrePublishStatusMessage("");
    }, 3200);
    return () => window.clearTimeout(timeoutId);
  }, [prePublishStatusMessage, setPrePublishStatusMessage]);

  useEffect(() => {
    if (!/published/i.test(publishStatusMessage || "")) return undefined;
    const timeoutId = window.setTimeout(() => {
      setPublishStatusMessage("");
    }, 3200);
    return () => window.clearTimeout(timeoutId);
  }, [publishStatusMessage, setPublishStatusMessage]);

  useEffect(() => {
    if (isEditingPage) {
      setActiveDashboardAction("");
    }
  }, [isEditingPage, setActiveDashboardAction]);

  useEffect(() => {
    if (!selectedSiteId) {
      setPagedPageRows([]);
      setPageListPagination((prev) => ({ ...prev, page: 1, totalItems: 0, totalPages: 1 }));
      return;
    }
    loadPageList(selectedSiteId, pageListPage, pageListPageSize).catch((error) => {
      setPageStatusMessage(error?.message || "Failed to load paginated pages.");
    });
  }, [loadPageList, pageListPage, pageListPageSize, selectedSiteId, setPageListPagination, setPageStatusMessage, setPagedPageRows]);

  const handleSignOutClick = useCallback(async () => {
    if (!confirmDiscardUnsavedChanges()) return;
    await signOut();
  }, [confirmDiscardUnsavedChanges, signOut]);

  const handleRequestDeletePage = useCallback((page) => {
    if (!page?.id) return;
    if (!confirmDiscardUnsavedChanges()) return;
    setPendingDeletePage({ id: page.id, title: page.title || page.id });
  }, [confirmDiscardUnsavedChanges]);

  const handleCancelDeletePage = useCallback(() => {
    setPendingDeletePage(null);
  }, []);

  const handleConfirmDeletePage = useCallback(async () => {
    if (!pendingDeletePage?.id) return;
    await handleDeletePage(pendingDeletePage.id);
    setPendingDeletePage(null);
  }, [handleDeletePage, pendingDeletePage]);

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <p className={styles.status}>Loading CMS session...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <CmsTopbar user={user} onSignOut={handleSignOutClick} styles={styles} />
        <div className={styles.workspaceLayout}>
          <CmsSidebar
            styles={styles}
            isEditingPage={isEditingPage}
            workspaceId={workspaceId}
            workspaceAccess={workspaceAccess}
            selectedSite={selectedSite}
            workspaceStatusMessage={workspaceStatusMessage}
            siteStatusMessage={siteStatusMessage}
            pageStatusMessage={pageStatusMessage}
            isLoadingSites={isLoadingSites}
            sites={sites}
            selectedSiteId={selectedSiteId}
            onSelectSite={handleSelectSite}
            activeDashboardAction={activeDashboardAction}
            onToggleDashboardAction={handleToggleDashboardAction}
            onWorkspaceSubmit={handleWorkspaceSubmit}
            workspaceIdInput={workspaceIdInput}
            onWorkspaceIdChange={setWorkspaceIdInput}
            onCreateSite={handleCreateSite}
            siteNameInput={siteNameInput}
            onSiteNameChange={setSiteNameInput}
            siteSlugInput={siteSlugInput}
            onSiteSlugChange={setSiteSlugInput}
            onCreatePage={handleCreatePage}
            pageTitleInput={pageTitleInput}
            onPageTitleChange={setPageTitleInput}
            pageSlugInput={pageSlugInput}
            onPageSlugChange={setPageSlugInput}
            parentPageIdInput={parentPageIdInput}
            onParentPageIdChange={setParentPageIdInput}
            selectedSitePages={selectedSitePages}
            onCloseAction={() => setActiveDashboardAction("")}
            selectedPage={selectedPage}
            pageTreeStatusMessage={pageTreeStatusMessage}
            onUpdatePage={handleMovePageParent}
            pageSettingsTitleInput={pageSettingsTitleInput}
            onPageSettingsTitleChange={setPageSettingsTitleInput}
            pageSettingsSlugInput={pageSettingsSlugInput}
            onPageSettingsSlugChange={setPageSettingsSlugInput}
            pageSettingsMetaTitleInput={pageSettingsMetaTitleInput}
            onPageSettingsMetaTitleChange={setPageSettingsMetaTitleInput}
            pageSettingsMetaDescriptionInput={pageSettingsMetaDescriptionInput}
            onPageSettingsMetaDescriptionChange={setPageSettingsMetaDescriptionInput}
            pageSettingsOgImageUrlInput={pageSettingsOgImageUrlInput}
            onPageSettingsOgImageUrlChange={setPageSettingsOgImageUrlInput}
            onRunPrePublishValidation={handleRunPrePublishValidation}
            isRunningPrePublishValidation={isRunningPrePublishValidation}
            prePublishStatusMessage={prePublishStatusMessage}
            prePublishChecks={prePublishChecks}
            onPublishPage={handlePublishPage}
            isPublishingPage={isPublishingPage}
            publishStatusMessage={publishStatusMessage}
            didPublishPage={didPublishPage}
            moveParentPageIdInput={moveParentPageIdInput}
            onMoveParentPageIdChange={setMoveParentPageIdInput}
            availableParentPages={availableParentPages}
            isUpdatingPage={isUpdatingPage}
            didUpdatePage={didUpdatePage}
            sectionTypes={sectionTypes}
            newBlockSectionType={newBlockSectionType}
            onSelectSectionType={(sectionType) => {
              setNewBlockSectionType(sectionType);
              setNewBlockVariant(getFirstVariantForSection(sectionType));
            }}
            getSectionLabel={(sectionType) => SECTIONS_REGISTRY[sectionType]?.label || getFieldLabel(sectionType)}
          />

          <div className={styles.mainColumn}>
            {!isEditingPage ? (
              <PagesListPanel
                styles={styles}
                selectedSiteId={selectedSiteId}
                onAddPage={() => handleToggleDashboardAction("page")}
                pageListPageSize={pageListPageSize}
                onPageListPageSizeChange={setPageListPageSize}
                pageSizeOptions={PAGE_LIST_SIZE_OPTIONS}
                isLoadingPageList={isLoadingPageList}
                safePageListPage={safePageListPage}
                maxPageListPage={maxPageListPage}
                onPrevPage={() => setPageListPage((prev) => Math.max(1, prev - 1))}
                onNextPage={() => setPageListPage((prev) => Math.min(maxPageListPage, prev + 1))}
                totalPageRows={totalPageRows}
                pagedPageRows={pagedPageRows}
                selectedPageId={selectedPageId}
                onEditPage={handleEditPage}
                onClonePage={handleClonePage}
                onDeletePage={handleRequestDeletePage}
              />
            ) : null}

            {selectedPage && isEditingPage ? (
              <EditorWorkspace
                styles={styles}
                selectedPage={selectedPage}
                onExitEditMode={() => setIsEditingPage(false)}
                selectedSectionLabel={selectedSectionLabel}
                selectedSectionVariants={selectedSectionVariants}
                newBlockSectionType={newBlockSectionType}
                newBlockVariant={newBlockVariant}
                setNewBlockVariant={setNewBlockVariant}
                formatVariantLabel={formatVariantLabel}
                libraryPreviewBlock={libraryPreviewBlock}
                selectedPageId={selectedPageId}
                onAddBlock={handleAddBlock}
                isSavingBlocks={isSavingBlocks}
                saveNotice={saveNotice}
                compactSaveMessage={compactSaveMessage}
                blockStatusMessage={blockStatusMessage}
                isLoadingBlocks={isLoadingBlocks}
                pageBlocks={pageBlocks}
                draggedBlockId={draggedBlockId}
                dragOverBlockId={dragOverBlockId}
                onBlockDragStart={handleBlockDragStart}
                onBlockDragOver={handleBlockDragOver}
                onBlockDrop={handleBlockDrop}
                onBlockDragEnd={handleBlockDragEnd}
                selectedBlockId={selectedBlockId}
                onSelectBlock={handleSelectBlock}
                onRemoveBlock={handleRemoveBlock}
                sectionLabelForType={(sectionType) => SECTIONS_REGISTRY[sectionType]?.label || getFieldLabel(sectionType)}
                selectedBlock={selectedBlock}
                hasUnsavedBlockChanges={hasUnsavedBlockChanges}
                editorMode={editorMode}
                setEditorMode={setEditorMode}
                selectedBlockFields={selectedBlockFields}
                selectedBlockRequiredFields={selectedBlockRequiredFields}
                handleUpdateSelectedBlockProps={handleUpdateSelectedBlockProps}
                advancedPropsInputRef={advancedPropsInputRef}
                selectedBlockJson={selectedBlockJson}
                handleApplyAdvancedProps={handleApplyAdvancedProps}
                handleFormatAdvancedPropsInput={handleFormatAdvancedPropsInput}
                handleResetAdvancedPropsToSchema={handleResetAdvancedPropsToSchema}
                selectedBlockTemplateJson={selectedBlockTemplateJson}
                propsEditorMessage={propsEditorMessage}
                handleSaveBlocks={handleSaveBlocks}
                previewViewport={previewViewport}
                setPreviewViewport={setPreviewViewport}
                previewTheme={previewTheme}
                handleTogglePreviewTheme={handleTogglePreviewTheme}
                previewSrc={previewSrc}
              />
            ) : null}
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={Boolean(pendingDeletePage)}
        title="Delete page?"
        description={
          pendingDeletePage
            ? `Delete "${pendingDeletePage.title}" and any child pages? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete page"
        cancelLabel="Cancel"
        confirmTone="danger"
        onConfirm={handleConfirmDeletePage}
        onCancel={handleCancelDeletePage}
      />
    </main>
  );
}
