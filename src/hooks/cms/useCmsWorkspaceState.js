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
  const [workspaceStatusMessage, setWorkspaceStatusMessage] = useState("");
  const [activeDashboardAction, setActiveDashboardAction] = useState("");
  const [parentPageIdInput, setParentPageIdInput] = useState("");
  const [pageSettingsTitleInput, setPageSettingsTitleInput] = useState("");
  const [pageSettingsSlugInput, setPageSettingsSlugInput] = useState("");
  const [pageSettingsMetaTitleInput, setPageSettingsMetaTitleInput] = useState("");
  const [pageSettingsMetaDescriptionInput, setPageSettingsMetaDescriptionInput] = useState("");
  const [pageSettingsOgImageUrlInput, setPageSettingsOgImageUrlInput] = useState("");
  const [moveParentPageIdInput, setMoveParentPageIdInput] = useState("");
  const [pageTreeStatusMessage, setPageTreeStatusMessage] = useState("");
  const [isUpdatingPage, setIsUpdatingPage] = useState(false);
  const [didUpdatePage, setDidUpdatePage] = useState(false);
  const [isRunningPrePublishValidation, setIsRunningPrePublishValidation] = useState(false);
  const [prePublishStatusMessage, setPrePublishStatusMessage] = useState("");
  const [prePublishChecks, setPrePublishChecks] = useState([]);
  const [isPublishingPage, setIsPublishingPage] = useState(false);
  const [publishStatusMessage, setPublishStatusMessage] = useState("");
  const [didPublishPage, setDidPublishPage] = useState(false);

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
  };
}
