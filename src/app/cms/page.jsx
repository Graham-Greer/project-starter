"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import NavigationPanel from "@/components/cms/NavigationPanel";
import ActivityPanel from "@/components/cms/ActivityPanel/ActivityPanel";
import AlertsPanel from "@/components/cms/AlertsPanel/AlertsPanel";
import MediaPanel from "@/components/cms/MediaPanel";
import MediaPicker from "@/components/cms/MediaPicker";
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
    isUpdatingSiteRuntime,
    setIsUpdatingSiteRuntime,
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
    pageSettingsOgImageAssetIdInput,
    setPageSettingsOgImageAssetIdInput,
    moveParentPageIdInput,
    setMoveParentPageIdInput,
    pageTreeStatusMessage,
    setPageTreeStatusMessage,
    isUpdatingPage,
    setIsUpdatingPage,
    isUpdatingPageHeader,
    setIsUpdatingPageHeader,
    pageHeaderStatusMessage,
    setPageHeaderStatusMessage,
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
    isUnpublishingPage,
    setIsUnpublishingPage,
    publishStatusMessage,
    setPublishStatusMessage,
    didPublishPage,
    setDidPublishPage,
    publishHistoryEntries,
    setPublishHistoryEntries,
    isLoadingPublishHistory,
    setIsLoadingPublishHistory,
    isRollingBackPublish,
    setIsRollingBackPublish,
    publishHistoryStatusMessage,
    setPublishHistoryStatusMessage,
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
    blockValidationErrorsById,
    setBlockValidationErrorsById,
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
  const autosaveTimerRef = useRef(null);
  const lastAutosaveAttemptJsonRef = useRef("");
  const sectionTypes = listSectionTypes();
  const [mainView, setMainView] = useState("pages");
  const [activityRows, setActivityRows] = useState([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [activityStatusMessage, setActivityStatusMessage] = useState("");
  const [activityPreset, setActivityPreset] = useState("all");
  const [activityActionFilter, setActivityActionFilter] = useState("");
  const [activityPageFilter, setActivityPageFilter] = useState("");
  const [alertRows, setAlertRows] = useState([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [alertsStatusMessage, setAlertsStatusMessage] = useState("");
  const [alertsStatusFilter, setAlertsStatusFilter] = useState("open");
  const [mediaRows, setMediaRows] = useState([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaStatusMessage, setMediaStatusMessage] = useState("");
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [isOgMediaPickerOpen, setIsOgMediaPickerOpen] = useState(false);
  const [newBlockSectionType, setNewBlockSectionType] = useState(sectionTypes[0] || "");
  const [newBlockVariant, setNewBlockVariant] = useState(getFirstVariantForSection(sectionTypes[0] || ""));
  const [pendingDeletePage, setPendingDeletePage] = useState(null);
  const [pendingDeleteSection, setPendingDeleteSection] = useState(null);
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
  const effectiveActivityPageFilter = (Array.isArray(selectedSitePages) ? selectedSitePages : []).some((page) => page.id === activityPageFilter)
    ? activityPageFilter
    : "";
  const visibleActivityRows = useMemo(() => {
    if (!Array.isArray(activityRows)) return [];
    if (activityPreset === "publishing") {
      return activityRows.filter((row) =>
        ["page.published", "page.unpublished", "page.publish_rollback"].includes(row?.action)
      );
    }
    if (activityPreset === "content") {
      return activityRows.filter((row) =>
        ["page.created", "page.updated", "page.deleted", "page.cloned", "page.blocks.saved"].includes(row?.action)
      );
    }
    if (activityPreset === "site") {
      return activityRows.filter((row) =>
        ["site.created", "site.updated"].includes(row?.action)
      );
    }
    return activityRows;
  }, [activityPreset, activityRows]);

  const confirmDiscardUnsavedChanges = useCallback(() => {
    if (!hasUnsavedBlockChanges) return true;

    const confirmed = window.confirm("You have unsaved block changes. Continue and discard them?");
    if (!confirmed) {
      setBlockStatusMessage("Unsaved changes are still in the composer. Save blocks before switching.");
    }
    return confirmed;
  }, [hasUnsavedBlockChanges, setBlockStatusMessage]);

  const {
    persistBlocks,
    loadBlocks,
    handleAddBlock,
    handleRemoveBlock,
    handleBlockDragStart,
    handleBlockDragOver,
    handleBlockDrop,
    handleBlockDragEnd,
    handleTogglePreviewTheme,
    handleSaveBlocks,
    handleCancelSelectedBlockEdits,
    handleSelectBlock,
    handleUpdateSelectedBlockProps,
    handleApplyAdvancedProps,
    handleFormatAdvancedPropsInput,
    handleResetAdvancedPropsToSchema,
  } = useCmsBlockActions({
    selectedSiteId,
    selectedPageId,
    pageBlocks,
    lastSavedBlocksJson,
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
    setBlockValidationErrorsById,
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
    handleUpdateSiteHeader,
    handleUpdateSiteNavigation,
    handleUpdateSiteRuntimeMode,
    handleSelectSite,
    handleCreatePage,
    handleMovePageParent,
    handleUpdatePageHeaderOverride,
    handleEditPage,
    handleToggleDashboardAction,
    handleDeletePage,
    handleClonePage,
    handleRunPrePublishValidation,
    handleLoadPublishHistory,
    handlePublishPage,
    handleUnpublishPage,
    handleRollbackPageVersion,
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
    pageSettingsOgImageAssetIdInput,
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
    setIsUpdatingSiteRuntime,
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
    setIsUpdatingPageHeader,
    setPageHeaderStatusMessage,
    setIsRunningPrePublishValidation,
    setPrePublishStatusMessage,
    setPrePublishChecks,
    setIsPublishingPage,
    setIsUnpublishingPage,
    setPublishStatusMessage,
    setDidPublishPage,
    setPublishHistoryEntries,
    setIsLoadingPublishHistory,
    setIsRollingBackPublish,
    setPublishHistoryStatusMessage,
    setIsLoadingPageList,
    setPageListPage,
    setActiveDashboardAction,
    setPreviewRefreshNonce,
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
    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    if (!isEditingPage || !selectedSiteId || !selectedPageId) return undefined;
    if (isLoadingBlocks || isSavingBlocks) return undefined;

    const currentBlocksJson = JSON.stringify(pageBlocks);
    if (currentBlocksJson === lastSavedBlocksJson) {
      lastAutosaveAttemptJsonRef.current = "";
      return undefined;
    }

    if (currentBlocksJson === lastAutosaveAttemptJsonRef.current) {
      return undefined;
    }

    autosaveTimerRef.current = window.setTimeout(() => {
      lastAutosaveAttemptJsonRef.current = currentBlocksJson;
      persistBlocks(pageBlocks, "Draft autosaved");
    }, 1400);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [
    isEditingPage,
    isLoadingBlocks,
    isSavingBlocks,
    lastSavedBlocksJson,
    pageBlocks,
    persistBlocks,
    selectedPageId,
    selectedSiteId,
  ]);

  useEffect(() => {
    const selectedSitePages = sitePagesMap[selectedSiteId] || [];
    const selectedPage = selectedSitePages.find((page) => page.id === selectedPageId) || null;
    setPageSettingsTitleInput(selectedPage?.title || "");
    setPageSettingsSlugInput(selectedPage?.slug || "");
    setPageSettingsMetaTitleInput(selectedPage?.seo?.metaTitle || selectedPage?.title || "");
    setPageSettingsMetaDescriptionInput(selectedPage?.seo?.metaDescription || "");
    setPageSettingsOgImageUrlInput(selectedPage?.seo?.ogImageUrl || "");
    setPageSettingsOgImageAssetIdInput(selectedPage?.seo?.ogImageAssetId || "");
    setMoveParentPageIdInput(selectedPage?.parentPageId || "");
  }, [
    selectedPageId,
    selectedSiteId,
    setMoveParentPageIdInput,
    setPageSettingsMetaDescriptionInput,
    setPageSettingsMetaTitleInput,
    setPageSettingsOgImageUrlInput,
    setPageSettingsOgImageAssetIdInput,
    setPageSettingsSlugInput,
    setPageSettingsTitleInput,
    sitePagesMap,
  ]);

  useEffect(() => {
    setPrePublishStatusMessage("");
    setPrePublishChecks([]);
    setPublishStatusMessage("");
    setPublishHistoryEntries([]);
    setPublishHistoryStatusMessage("");
    setDidPublishPage(false);
  }, [
    selectedPageId,
    selectedSiteId,
    setDidPublishPage,
    setPrePublishChecks,
    setPrePublishStatusMessage,
    setPublishHistoryEntries,
    setPublishHistoryStatusMessage,
    setPublishStatusMessage,
  ]);

  useEffect(() => {
    if (!isEditingPage || !selectedSiteId || !selectedPageId) return;
    handleLoadPublishHistory();
  }, [handleLoadPublishHistory, isEditingPage, selectedPageId, selectedSiteId]);

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
    if (!pageHeaderStatusMessage) return undefined;
    const timeoutId = window.setTimeout(() => {
      setPageHeaderStatusMessage("");
    }, 2800);
    return () => window.clearTimeout(timeoutId);
  }, [pageHeaderStatusMessage, setPageHeaderStatusMessage]);

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
    if (!mediaStatusMessage) return undefined;
    const timeoutId = window.setTimeout(() => {
      setMediaStatusMessage("");
    }, 3200);
    return () => window.clearTimeout(timeoutId);
  }, [mediaStatusMessage]);

  useEffect(() => {
    if (isEditingPage) {
      setActiveDashboardAction("");
    }
  }, [isEditingPage, setActiveDashboardAction]);

  const activeMainView = (mainView === "navigation" || mainView === "media") && !selectedSiteId ? "pages" : mainView;

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (!selectedSiteId) {
      setPagedPageRows([]);
      setPageListPagination((prev) => ({ ...prev, page: 1, totalItems: 0, totalPages: 1 }));
      return;
    }
    loadPageList(selectedSiteId, pageListPage, pageListPageSize).catch((error) => {
      setPageStatusMessage(error?.message || "Failed to load paginated pages.");
    });
  }, [
    isAuthenticated,
    isLoading,
    loadPageList,
    pageListPage,
    pageListPageSize,
    selectedSiteId,
    setPageListPagination,
    setPageStatusMessage,
    setPagedPageRows,
  ]);

  const handleSignOutClick = useCallback(async () => {
    if (!confirmDiscardUnsavedChanges()) return;
    await signOut();
  }, [confirmDiscardUnsavedChanges, signOut]);

  const handleChangeMainView = useCallback((nextView) => {
    if (!selectedSiteId && (nextView === "navigation" || nextView === "media")) return;
    if (!workspaceId && (nextView === "activity" || nextView === "alerts")) return;
    if (nextView !== "pages") {
      setActiveDashboardAction("");
    }
    setMainView(nextView);
  }, [selectedSiteId, setActiveDashboardAction, setMainView, workspaceId]);

  const loadActivity = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoadingActivity(true);
    setActivityStatusMessage("");
    try {
      const query = new URLSearchParams();
      query.set("limit", "100");
      if (selectedSiteId) query.set("siteId", selectedSiteId);
      if (effectiveActivityPageFilter) query.set("pageId", effectiveActivityPageFilter);
      if (activityActionFilter) query.set("action", activityActionFilter);
      const response = await fetch(`/api/cms/workspaces/${workspaceId}/audit-logs?${query.toString()}`);
      const payload = await response.json();
      if (!payload?.ok) {
        setActivityRows([]);
        setActivityStatusMessage(payload?.error || "Failed to load activity.");
        return;
      }
      const nextRows = Array.isArray(payload?.rows) ? payload.rows : [];
      setActivityRows(nextRows);
      if (nextRows.length === 0) {
        setActivityStatusMessage("No activity found for the current filters.");
      }
    } catch (_error) {
      setActivityRows([]);
      setActivityStatusMessage("Failed to load activity.");
    } finally {
      setIsLoadingActivity(false);
    }
  }, [activityActionFilter, effectiveActivityPageFilter, selectedSiteId, workspaceId]);

  useEffect(() => {
    if (isEditingPage || activeMainView !== "activity" || !workspaceId) return;
    loadActivity();
  }, [activeMainView, isEditingPage, loadActivity, workspaceId]);

  const loadAlerts = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoadingAlerts(true);
    setAlertsStatusMessage("");
    try {
      const query = new URLSearchParams();
      query.set("limit", "100");
      if (alertsStatusFilter) query.set("status", alertsStatusFilter);
      if (selectedSiteId) query.set("siteId", selectedSiteId);
      const response = await fetch(`/api/cms/workspaces/${workspaceId}/alerts?${query.toString()}`);
      const payload = await response.json();
      if (!payload?.ok) {
        setAlertRows([]);
        setAlertsStatusMessage(payload?.error || "Failed to load alerts.");
        return;
      }
      const nextRows = Array.isArray(payload?.rows) ? payload.rows : [];
      setAlertRows(nextRows);
      if (nextRows.length === 0) {
        setAlertsStatusMessage("No alerts found for the current filters.");
      }
    } catch (_error) {
      setAlertRows([]);
      setAlertsStatusMessage("Failed to load alerts.");
    } finally {
      setIsLoadingAlerts(false);
    }
  }, [alertsStatusFilter, selectedSiteId, workspaceId]);

  useEffect(() => {
    if (isEditingPage || activeMainView !== "alerts" || !workspaceId) return;
    loadAlerts();
  }, [activeMainView, isEditingPage, loadAlerts, workspaceId]);

  const loadMedia = useCallback(async () => {
    if (!workspaceId || !selectedSiteId) return;
    setIsLoadingMedia(true);
    setMediaStatusMessage("");
    try {
      const query = new URLSearchParams();
      query.set("siteId", selectedSiteId);
      query.set("pageSize", "100");
      if (mediaSearchQuery.trim()) query.set("search", mediaSearchQuery.trim());
      const response = await fetch(`/api/cms/workspaces/${workspaceId}/assets?${query.toString()}`);
      const payload = await response.json();
      if (!payload?.ok) {
        setMediaRows([]);
        setMediaStatusMessage(payload?.error || "Failed to load media library.");
        return;
      }
      const rows = Array.isArray(payload.rows) ? payload.rows : [];
      setMediaRows(rows);
      if (!rows.length) {
        setMediaStatusMessage("No media found for this site yet.");
      }
    } catch (_error) {
      setMediaRows([]);
      setMediaStatusMessage("Failed to load media library.");
    } finally {
      setIsLoadingMedia(false);
    }
  }, [mediaSearchQuery, selectedSiteId, workspaceId]);

  useEffect(() => {
    if (isEditingPage || activeMainView !== "media" || !workspaceId || !selectedSiteId) return;
    loadMedia();
  }, [activeMainView, isEditingPage, loadMedia, selectedSiteId, workspaceId]);

  const handleUploadMedia = useCallback(async ({ file, alt }) => {
    if (!workspaceId || !selectedSiteId || !file) return false;
    setIsUploadingMedia(true);
    setMediaStatusMessage("");
    try {
      const formData = new FormData();
      formData.set("siteId", selectedSiteId);
      formData.set("file", file);
      formData.set("alt", alt || "");
      const response = await fetch(`/api/cms/workspaces/${workspaceId}/assets`, {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!payload?.ok) {
        setMediaStatusMessage(payload?.error || "Failed to upload media.");
        return false;
      }
      setMediaStatusMessage("Media uploaded.");
      await loadMedia();
      return true;
    } catch (_error) {
      setMediaStatusMessage("Failed to upload media.");
      return false;
    } finally {
      setIsUploadingMedia(false);
    }
  }, [loadMedia, selectedSiteId, workspaceId]);

  const handleUpdateMediaAlt = useCallback(async (assetId, alt) => {
    if (!workspaceId || !assetId) return;
    setMediaStatusMessage("");
    try {
      const response = await fetch(`/api/cms/workspaces/${workspaceId}/assets/${assetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt }),
      });
      const payload = await response.json();
      if (!payload?.ok) {
        setMediaStatusMessage(payload?.error || "Failed to update alt text.");
        return;
      }
      setMediaStatusMessage("Alt text updated.");
      setMediaRows((prev) => prev.map((asset) => (asset.id === assetId ? { ...asset, alt: payload?.asset?.alt || alt } : asset)));
    } catch (_error) {
      setMediaStatusMessage("Failed to update alt text.");
    }
  }, [workspaceId]);

  const handleDeleteMedia = useCallback(async (assetId) => {
    if (!workspaceId || !assetId) return;
    setMediaStatusMessage("");
    try {
      const response = await fetch(`/api/cms/workspaces/${workspaceId}/assets/${assetId}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!payload?.ok) {
        setMediaStatusMessage(payload?.error || "Failed to delete media.");
        return;
      }
      setMediaRows((prev) => prev.filter((asset) => asset.id !== assetId));
      setMediaStatusMessage("Media deleted.");
    } catch (_error) {
      setMediaStatusMessage("Failed to delete media.");
    }
  }, [workspaceId]);

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

  const handleRequestDeleteSection = useCallback((block) => {
    if (!block?.id) return;
    const sectionLabel = SECTIONS_REGISTRY[block.sectionType]?.label || getFieldLabel(block.sectionType);
    const variantLabel = formatVariantLabel(block.variant || "");
    const label = variantLabel ? `${sectionLabel} (${variantLabel})` : sectionLabel;
    setPendingDeleteSection({ id: block.id, label });
  }, []);

  const handleCancelDeleteSection = useCallback(() => {
    setPendingDeleteSection(null);
  }, []);

  const handleConfirmDeleteSection = useCallback(async () => {
    if (!pendingDeleteSection?.id) return;
    await handleRemoveBlock(pendingDeleteSection.id);
    setPendingDeleteSection(null);
  }, [handleRemoveBlock, pendingDeleteSection]);

  const handleOpenActivityRow = useCallback(async (row) => {
    if (!row || typeof row !== "object") return;
    const targetSiteId = typeof row.siteId === "string" ? row.siteId : "";
    const targetPageId = typeof row.pageId === "string" ? row.pageId : "";

    if (targetSiteId && targetSiteId !== selectedSiteId) {
      await handleSelectSite(targetSiteId);
      if (targetPageId) {
        setMainView("pages");
        setActivityStatusMessage("Site switched. Select the page from the Pages list to continue.");
        return;
      }
    }

    if (targetPageId) {
      await handleEditPage(targetPageId);
      return;
    }

    if (row.action === "site.created" || row.action === "site.updated") {
      setMainView("navigation");
      setActiveDashboardAction("");
      setIsEditingPage(false);
    }
  }, [
    handleEditPage,
    handleSelectSite,
    selectedSiteId,
    setActivityStatusMessage,
    setActiveDashboardAction,
    setIsEditingPage,
  ]);

  const handleOpenAlertRow = useCallback(async (row) => {
    if (!row || typeof row !== "object") return;
    const targetSiteId = typeof row.siteId === "string" ? row.siteId : "";
    const targetPageId = typeof row.pageId === "string" ? row.pageId : "";

    if (targetSiteId && targetSiteId !== selectedSiteId) {
      await handleSelectSite(targetSiteId);
      if (targetPageId) {
        setMainView("pages");
        setAlertsStatusMessage("Site switched. Select the page from the Pages list to continue.");
        return;
      }
    }

    if (targetPageId) {
      await handleEditPage(targetPageId);
      return;
    }

    setMainView("navigation");
    setActiveDashboardAction("");
    setIsEditingPage(false);
  }, [
    handleEditPage,
    handleSelectSite,
    selectedSiteId,
    setActiveDashboardAction,
    setIsEditingPage,
  ]);

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
            mainView={activeMainView}
            onChangeMainView={handleChangeMainView}
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
            onViewActivity={() => handleChangeMainView("activity")}
            onViewAlerts={() => handleChangeMainView("alerts")}
            onUpdateSiteRuntimeMode={handleUpdateSiteRuntimeMode}
            isUpdatingSiteRuntime={isUpdatingSiteRuntime}
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
            onPageSettingsOgImageUrlChange={(value) => {
              setPageSettingsOgImageUrlInput(value);
              if (pageSettingsOgImageAssetIdInput) setPageSettingsOgImageAssetIdInput("");
            }}
            onOpenOgImageMediaPicker={() => setIsOgMediaPickerOpen(true)}
            onRunPrePublishValidation={handleRunPrePublishValidation}
            isRunningPrePublishValidation={isRunningPrePublishValidation}
            prePublishStatusMessage={prePublishStatusMessage}
            prePublishChecks={prePublishChecks}
            onPublishPage={handlePublishPage}
            isPublishingPage={isPublishingPage}
            onUnpublishPage={handleUnpublishPage}
            isUnpublishingPage={isUnpublishingPage}
            publishStatusMessage={publishStatusMessage}
            didPublishPage={didPublishPage}
            publishHistoryEntries={publishHistoryEntries}
            isLoadingPublishHistory={isLoadingPublishHistory}
            isRollingBackPublish={isRollingBackPublish}
            publishHistoryStatusMessage={publishHistoryStatusMessage}
            onLoadPublishHistory={handleLoadPublishHistory}
            onRollbackPageVersion={handleRollbackPageVersion}
            moveParentPageIdInput={moveParentPageIdInput}
            onMoveParentPageIdChange={setMoveParentPageIdInput}
            availableParentPages={availableParentPages}
            isUpdatingPage={isUpdatingPage}
            didUpdatePage={didUpdatePage}
            onOpenNavigationSettings={() => {
              setIsEditingPage(false);
              setActiveDashboardAction("");
              setMainView("navigation");
            }}
            onOpenMediaLibrary={() => {
              setIsEditingPage(false);
              setActiveDashboardAction("");
              setMainView("media");
            }}
          />

          <div className={styles.mainColumn}>
            {!isEditingPage && activeMainView === "pages" ? (
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

            {!isEditingPage && activeMainView === "navigation" ? (
              <NavigationPanel
                styles={styles}
                selectedSite={selectedSite}
                selectedSitePages={selectedSitePages}
                onSaveHeader={handleUpdateSiteHeader}
                onSaveNavigation={handleUpdateSiteNavigation}
              />
            ) : null}

            {!isEditingPage && activeMainView === "media" ? (
              <MediaPanel
                styles={styles}
                workspaceId={workspaceId}
                selectedSite={selectedSite}
                rows={mediaRows}
                isLoading={isLoadingMedia}
                isUploading={isUploadingMedia}
                statusMessage={mediaStatusMessage}
                searchQuery={mediaSearchQuery}
                onSearchQueryChange={setMediaSearchQuery}
                onRefresh={loadMedia}
                onUpload={handleUploadMedia}
                onDeleteAsset={handleDeleteMedia}
                onUpdateAssetAlt={handleUpdateMediaAlt}
              />
            ) : null}

            {!isEditingPage && activeMainView === "activity" ? (
              <ActivityPanel
                styles={styles}
                workspaceId={workspaceId}
                selectedSiteId={selectedSiteId}
                selectedSitePages={selectedSitePages}
                rows={visibleActivityRows}
                isLoading={isLoadingActivity}
                statusMessage={activityStatusMessage}
                preset={activityPreset}
                onPresetChange={setActivityPreset}
                actionFilter={activityActionFilter}
                onActionFilterChange={setActivityActionFilter}
                pageFilter={effectiveActivityPageFilter}
                onPageFilterChange={setActivityPageFilter}
                onRefresh={loadActivity}
                onOpenRow={handleOpenActivityRow}
              />
            ) : null}

            {!isEditingPage && activeMainView === "alerts" ? (
              <AlertsPanel
                styles={styles}
                workspaceId={workspaceId}
                rows={alertRows}
                isLoading={isLoadingAlerts}
                statusFilter={alertsStatusFilter}
                onStatusFilterChange={setAlertsStatusFilter}
                statusMessage={alertsStatusMessage}
                onRefresh={loadAlerts}
                onOpenAlert={handleOpenAlertRow}
              />
            ) : null}

            {selectedPage && isEditingPage ? (
              <EditorWorkspace
                styles={styles}
                selectedPage={selectedPage}
                selectedSite={selectedSite}
                onExitEditMode={() => setIsEditingPage(false)}
                onUpdatePageHeaderOverride={handleUpdatePageHeaderOverride}
                isUpdatingPageHeader={isUpdatingPageHeader}
                pageHeaderStatusMessage={pageHeaderStatusMessage}
                selectedSectionLabel={selectedSectionLabel}
                selectedSectionVariants={selectedSectionVariants}
                sectionTypes={sectionTypes}
                newBlockSectionType={newBlockSectionType}
                onSelectSectionType={(sectionType) => {
                  setNewBlockSectionType(sectionType);
                  setNewBlockVariant(getFirstVariantForSection(sectionType));
                }}
                getSectionLabel={(sectionType) => SECTIONS_REGISTRY[sectionType]?.label || getFieldLabel(sectionType)}
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
                onRequestRemoveBlock={handleRequestDeleteSection}
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
                selectedBlockApiValidationErrors={blockValidationErrorsById[selectedBlockId] || {}}
                handleSaveBlocks={handleSaveBlocks}
                handleCancelSelectedBlockEdits={handleCancelSelectedBlockEdits}
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
      <ConfirmationModal
        isOpen={Boolean(pendingDeleteSection)}
        title="Delete section?"
        description={
          pendingDeleteSection
            ? `Delete "${pendingDeleteSection.label}" from this page? This saves immediately.`
            : ""
        }
        confirmLabel="Delete section"
        cancelLabel="Cancel"
        confirmTone="danger"
        confirmLoading={isSavingBlocks}
        onConfirm={handleConfirmDeleteSection}
        onCancel={handleCancelDeleteSection}
      />
      <MediaPicker
        styles={styles}
        isOpen={isOgMediaPickerOpen}
        title="Choose OG image"
        workspaceId={workspaceId}
        siteId={selectedSiteId}
        onClose={() => setIsOgMediaPickerOpen(false)}
        onSelect={(asset) => {
          setPageSettingsOgImageUrlInput(asset?.url || "");
          setPageSettingsOgImageAssetIdInput(asset?.id || "");
          setPageTreeStatusMessage("OG image selected from media library.");
          setIsOgMediaPickerOpen(false);
        }}
      />
    </main>
  );
}
