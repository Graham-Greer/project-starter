import { useState } from "react";

export const CMS_STORAGE_KEYS = {
  workspace: "cms-active-workspace-id",
  site: "cms-active-site-id",
  page: "cms-active-page-id",
};

function getStoredValue(key) {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(key) || "";
}

export function useCmsWorkspaceState() {
  const [workspaceIdInput, setWorkspaceIdInput] = useState(() => getStoredValue(CMS_STORAGE_KEYS.workspace));
  const [workspaceId, setWorkspaceId] = useState(() => getStoredValue(CMS_STORAGE_KEYS.workspace));
  const [workspaceAccess, setWorkspaceAccess] = useState(null);
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState(() => getStoredValue(CMS_STORAGE_KEYS.site));
  const [selectedPageId, setSelectedPageId] = useState(() => getStoredValue(CMS_STORAGE_KEYS.page));
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [pageTitleInput, setPageTitleInput] = useState("");
  const [pageSlugInput, setPageSlugInput] = useState("");
  const [pageStatusMessage, setPageStatusMessage] = useState("");
  const [siteNameInput, setSiteNameInput] = useState("");
  const [siteSlugInput, setSiteSlugInput] = useState("");
  const [siteStatusMessage, setSiteStatusMessage] = useState("");
  const [isUpdatingSiteRuntime, setIsUpdatingSiteRuntime] = useState(false);
  const [workspaceStatusMessage, setWorkspaceStatusMessage] = useState("");
  const [activeDashboardAction, setActiveDashboardAction] = useState("");
  const [parentPageIdInput, setParentPageIdInput] = useState("");
  const [pageSettingsTitleInput, setPageSettingsTitleInput] = useState("");
  const [pageSettingsSlugInput, setPageSettingsSlugInput] = useState("");
  const [pageSettingsMetaTitleInput, setPageSettingsMetaTitleInput] = useState("");
  const [pageSettingsMetaDescriptionInput, setPageSettingsMetaDescriptionInput] = useState("");
  const [pageSettingsOgImageUrlInput, setPageSettingsOgImageUrlInput] = useState("");
  const [pageSettingsOgImageAssetIdInput, setPageSettingsOgImageAssetIdInput] = useState("");
  const [moveParentPageIdInput, setMoveParentPageIdInput] = useState("");
  const [pageTreeStatusMessage, setPageTreeStatusMessage] = useState("");
  const [isUpdatingPage, setIsUpdatingPage] = useState(false);
  const [isUpdatingPageHeader, setIsUpdatingPageHeader] = useState(false);
  const [pageHeaderStatusMessage, setPageHeaderStatusMessage] = useState("");
  const [didUpdatePage, setDidUpdatePage] = useState(false);
  const [isRunningPrePublishValidation, setIsRunningPrePublishValidation] = useState(false);
  const [prePublishStatusMessage, setPrePublishStatusMessage] = useState("");
  const [prePublishChecks, setPrePublishChecks] = useState([]);
  const [isPublishingPage, setIsPublishingPage] = useState(false);
  const [isUnpublishingPage, setIsUnpublishingPage] = useState(false);
  const [publishStatusMessage, setPublishStatusMessage] = useState("");
  const [didPublishPage, setDidPublishPage] = useState(false);
  const [publishHistoryEntries, setPublishHistoryEntries] = useState([]);
  const [isLoadingPublishHistory, setIsLoadingPublishHistory] = useState(false);
  const [isRollingBackPublish, setIsRollingBackPublish] = useState(false);
  const [publishHistoryStatusMessage, setPublishHistoryStatusMessage] = useState("");

  return {
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
  };
}
