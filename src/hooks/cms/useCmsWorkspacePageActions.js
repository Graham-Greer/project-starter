import { useCallback } from "react";
import { CMS_STORAGE_KEYS } from "@/hooks/cms/useCmsWorkspaceState";
import { getFirebaseClientAuth } from "@/lib/firebase/client";

async function fetchCms(path, init = {}) {
  const headers = new Headers(init?.headers || {});
  try {
    const token = await getFirebaseClientAuth()?.currentUser?.getIdToken();
    if (token) {
      headers.set("x-firebase-id-token", token);
    }
  } catch (_error) {
    // Keep request moving; server cookie auth may still succeed.
  }
  return fetch(path, {
    ...init,
    headers,
    credentials: "include",
  });
}

export function useCmsWorkspacePageActions({
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
}) {
  const loadPages = useCallback(async (siteId) => {
    if (!siteId) return;
    setPageStatusMessage("");
    setPageTreeStatusMessage("");

    try {
      const payload = await fetchCms(`/api/cms/sites/${siteId}/pages`).then((response) => response.json());
      if (!payload?.ok) {
        throw new Error(payload?.error || "Failed to load pages for this site.");
      }
      const nextPages = Array.isArray(payload.pages) ? payload.pages : [];
      setSitePagesMap((prev) => ({ ...prev, [siteId]: nextPages }));

      if (nextPages.length === 0) {
        setSelectedPageId("");
        localStorage.removeItem(CMS_STORAGE_KEYS.page);
        setSelectedBlockId("");
        setPageBlocks([]);
        setLastSavedBlocksJson("[]");
        return;
      }

      const hasStoredPageSelection = nextPages.some((page) => page.id === selectedPageId);
      const nextSelectedPageId = hasStoredPageSelection ? selectedPageId : nextPages[0].id;
      setSelectedPageId(nextSelectedPageId);
      localStorage.setItem(CMS_STORAGE_KEYS.page, nextSelectedPageId);
    } catch (error) {
      setSitePagesMap((prev) => ({ ...prev, [siteId]: [] }));
      setSelectedPageId("");
      localStorage.removeItem(CMS_STORAGE_KEYS.page);
      setSelectedBlockId("");
      setPageBlocks([]);
      setLastSavedBlocksJson("[]");
      setPageStatusMessage(error.message || "Failed to load pages.");
    }
  }, [
    selectedPageId,
    setLastSavedBlocksJson,
    setPageBlocks,
    setPageStatusMessage,
    setPageTreeStatusMessage,
    setSelectedBlockId,
    setSelectedPageId,
    setSitePagesMap,
  ]);

  const loadPageList = useCallback(async (siteId, page, pageSize) => {
    if (!siteId) return;
    setIsLoadingPageList(true);
    try {
      const payload = await fetchCms(`/api/cms/sites/${siteId}/pages?page=${page}&pageSize=${pageSize}`).then((response) => response.json());
      if (!payload?.ok) {
        throw new Error(payload?.error || "Failed to load paginated pages.");
      }
      const rows = Array.isArray(payload.rows) ? payload.rows : [];
      const pagination = payload.pagination || {};
      setPagedPageRows(rows);
      setPageListPagination({
        page: Number(pagination.page) || 1,
        pageSize: Number(pagination.pageSize) || pageSize,
        totalItems: Number(pagination.totalItems) || 0,
        totalPages: Number(pagination.totalPages) || 1,
      });
      if (Number(pagination.page) && Number(pagination.page) !== page) {
        setPageListPage(Number(pagination.page));
      }
    } finally {
      setIsLoadingPageList(false);
    }
  }, [setIsLoadingPageList, setPageListPage, setPageListPagination, setPagedPageRows]);

  const loadWorkspace = useCallback(async (nextWorkspaceId) => {
    if (!nextWorkspaceId || !isAuthenticated) return;
    setIsLoadingSites(true);
    setWorkspaceStatusMessage("");
    setIsEditingPage(false);

    try {
      const [accessPayload, sitesPayload] = await Promise.all([
        fetchCms(`/api/cms/workspaces/${nextWorkspaceId}/access`).then((response) => response.json()),
        fetchCms(`/api/cms/workspaces/${nextWorkspaceId}/sites`).then((response) => response.json()),
      ]);

      if (!accessPayload?.ok) {
        throw new Error(accessPayload?.error || "Failed to load workspace access.");
      }
      if (!sitesPayload?.ok) {
        throw new Error(sitesPayload?.error || "Failed to load workspace sites.");
      }

      setWorkspaceAccess(accessPayload.membership || null);
      const nextSites = Array.isArray(sitesPayload.sites) ? sitesPayload.sites : [];
      setSites(nextSites);

      if (nextSites.length === 0) {
        setSelectedSiteId("");
        localStorage.removeItem(CMS_STORAGE_KEYS.site);
        setSelectedPageId("");
        localStorage.removeItem(CMS_STORAGE_KEYS.page);
        setSitePagesMap({});
        setPagedPageRows([]);
        setPageListPagination((prev) => ({ ...prev, page: 1, totalItems: 0, totalPages: 1 }));
        setPageBlocks([]);
        setLastSavedBlocksJson("[]");
        return;
      }

      const hasStoredSelection = nextSites.some((site) => site.id === selectedSiteId);
      const nextSelectedSiteId = hasStoredSelection ? selectedSiteId : nextSites[0].id;
      setSelectedSiteId(nextSelectedSiteId);
      localStorage.setItem(CMS_STORAGE_KEYS.site, nextSelectedSiteId);
      setSelectedBlockId("");
      setPageBlocks([]);
      setLastSavedBlocksJson("[]");
      await loadPages(nextSelectedSiteId);
    } catch (error) {
      setWorkspaceAccess(null);
      setSites([]);
      setSelectedSiteId("");
      localStorage.removeItem(CMS_STORAGE_KEYS.site);
      setSelectedPageId("");
      localStorage.removeItem(CMS_STORAGE_KEYS.page);
      setSitePagesMap({});
      setPagedPageRows([]);
      setPageListPagination((prev) => ({ ...prev, page: 1, totalItems: 0, totalPages: 1 }));
      setPageBlocks([]);
      setLastSavedBlocksJson("[]");
      setWorkspaceStatusMessage(error.message || "Failed to load workspace.");
    } finally {
      setIsLoadingSites(false);
    }
  }, [
    isAuthenticated,
    loadPages,
    selectedSiteId,
    setIsEditingPage,
    setIsLoadingSites,
    setLastSavedBlocksJson,
    setPageBlocks,
    setPageListPagination,
    setPagedPageRows,
    setSelectedBlockId,
    setSelectedPageId,
    setSelectedSiteId,
    setSitePagesMap,
    setSites,
    setWorkspaceAccess,
    setWorkspaceStatusMessage,
  ]);

  const handleWorkspaceSubmit = useCallback(async (event) => {
    event.preventDefault();
    const nextWorkspaceId = workspaceIdInput.trim();
    if (!nextWorkspaceId) return;
    if (nextWorkspaceId !== workspaceId && !confirmDiscardUnsavedChanges()) return;
    localStorage.setItem(CMS_STORAGE_KEYS.workspace, nextWorkspaceId);
    setWorkspaceId(nextWorkspaceId);
    await loadWorkspace(nextWorkspaceId);
  }, [confirmDiscardUnsavedChanges, loadWorkspace, setWorkspaceId, workspaceId, workspaceIdInput]);

  const handleCreateSite = useCallback(async (event) => {
    event.preventDefault();
    if (!workspaceId) return;
    setSiteStatusMessage("");

    const response = await fetchCms(`/api/cms/workspaces/${workspaceId}/sites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: siteNameInput,
        slug: siteSlugInput || undefined,
      }),
    });

    const payload = await response.json();
    if (!payload?.ok) {
      setSiteStatusMessage(payload?.error || "Failed to create site.");
      return;
    }

    setSiteStatusMessage("Site created.");
    setSiteNameInput("");
    setSiteSlugInput("");
    setSites((prev) => [payload.site, ...prev]);

    if (!selectedSiteId) {
      setSelectedSiteId(payload.site.id);
      localStorage.setItem(CMS_STORAGE_KEYS.site, payload.site.id);
      await loadPages(payload.site.id);
    }
  }, [
    loadPages,
    selectedSiteId,
    setSelectedSiteId,
    setSiteNameInput,
    setSiteSlugInput,
    setSiteStatusMessage,
    setSites,
    siteNameInput,
    siteSlugInput,
    workspaceId,
  ]);

  const handleSelectSite = useCallback(async (siteId) => {
    if (siteId !== selectedSiteId && !confirmDiscardUnsavedChanges()) return;
    setSelectedSiteId(siteId);
    localStorage.setItem(CMS_STORAGE_KEYS.site, siteId);
    setSelectedPageId("");
    setIsEditingPage(false);
    setActiveDashboardAction("");
    localStorage.removeItem(CMS_STORAGE_KEYS.page);
    setSelectedBlockId("");
    setPageBlocks([]);
    setLastSavedBlocksJson("[]");
    await loadPages(siteId);
  }, [
    confirmDiscardUnsavedChanges,
    loadPages,
    selectedSiteId,
    setActiveDashboardAction,
    setIsEditingPage,
    setLastSavedBlocksJson,
    setPageBlocks,
    setSelectedBlockId,
    setSelectedPageId,
    setSelectedSiteId,
  ]);

  const handleUpdateSiteRuntimeMode = useCallback(async (runtimeMode) => {
    if (!selectedSiteId) return;
    setIsUpdatingSiteRuntime(true);
    setSiteStatusMessage("");
    try {
      const response = await fetch(`/api/cms/sites/${selectedSiteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runtimeMode }),
      });
      const payload = await response.json();
      if (!payload?.ok) {
        setSiteStatusMessage(payload?.error || "Failed to update runtime mode.");
        return;
      }

      if (payload?.site?.id) {
        setSites((prev) => prev.map((site) => (site.id === payload.site.id ? { ...site, ...payload.site } : site)));
      }
      setSiteStatusMessage(`Runtime mode updated: ${payload?.site?.runtimeMode || runtimeMode}.`);
    } catch (_error) {
      setSiteStatusMessage("Failed to update runtime mode.");
    } finally {
      setIsUpdatingSiteRuntime(false);
    }
  }, [selectedSiteId, setIsUpdatingSiteRuntime, setSiteStatusMessage, setSites]);

  const handleUpdateSiteNavigation = useCallback(async (navigation) => {
    if (!selectedSiteId) {
      return { ok: false, error: "Select a site before saving navigation." };
    }

    try {
      const response = await fetch(`/api/cms/sites/${selectedSiteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ navigation }),
      });
      const payload = await response.json();
      if (!payload?.ok) {
        return { ok: false, error: payload?.error || "Failed to save navigation." };
      }

      if (payload?.site?.id) {
        setSites((prev) => prev.map((site) => (site.id === payload.site.id ? { ...site, ...payload.site } : site)));
      }
      return { ok: true, site: payload.site };
    } catch (_error) {
      return { ok: false, error: "Failed to save navigation." };
    }
  }, [selectedSiteId, setSites]);

  const handleUpdateSiteHeader = useCallback(async (headerPayload) => {
    if (!selectedSiteId) {
      return { ok: false, error: "Select a site before saving header settings." };
    }

    try {
      const payloadToSend = headerPayload && typeof headerPayload === "object" && !Array.isArray(headerPayload)
        ? headerPayload
        : { header: headerPayload };
      const response = await fetch(`/api/cms/sites/${selectedSiteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSend),
      });
      const payload = await response.json();
      if (!payload?.ok) {
        return { ok: false, error: payload?.error || "Failed to save header settings." };
      }

      if (payload?.site?.id) {
        setSites((prev) => prev.map((site) => (site.id === payload.site.id ? { ...site, ...payload.site } : site)));
      }
      return { ok: true, site: payload.site };
    } catch (_error) {
      return { ok: false, error: "Failed to save header settings." };
    }
  }, [selectedSiteId, setSites]);

  const handleCreatePage = useCallback(async (event) => {
    event.preventDefault();
    if (!selectedSiteId) return;
    setPageStatusMessage("");

    const response = await fetchCms(`/api/cms/sites/${selectedSiteId}/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: pageTitleInput,
        slug: pageSlugInput || undefined,
        parentPageId: parentPageIdInput || undefined,
      }),
    });

    const payload = await response.json();
    if (!payload?.ok) {
      setPageStatusMessage(payload?.error || "Failed to create page.");
      return;
    }

    setPageStatusMessage("Page created.");
    setPageTitleInput("");
    setPageSlugInput("");
    setParentPageIdInput("");
    const nextPage = payload.page;
    setSitePagesMap((prev) => ({
      ...prev,
      [selectedSiteId]: [nextPage, ...(prev[selectedSiteId] || [])],
    }));
    await loadPageList(selectedSiteId, pageListPage, pageListPageSize);

    if (!selectedPageId) {
      setSelectedPageId(nextPage.id);
      localStorage.setItem(CMS_STORAGE_KEYS.page, nextPage.id);
    }
  }, [
    loadPageList,
    pageListPage,
    pageListPageSize,
    pageSlugInput,
    pageTitleInput,
    parentPageIdInput,
    selectedPageId,
    selectedSiteId,
    setPageSlugInput,
    setPageStatusMessage,
    setPageTitleInput,
    setParentPageIdInput,
    setSelectedPageId,
    setSitePagesMap,
  ]);

  const handleMovePageParent = useCallback(async (event) => {
    event.preventDefault();
    if (!selectedSiteId || !selectedPageId) return;
    setPageTreeStatusMessage("");
    setDidUpdatePage(false);
    setIsUpdatingPage(true);
    try {
      const response = await fetchCms(`/api/cms/sites/${selectedSiteId}/pages/${selectedPageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pageSettingsTitleInput,
          slug: pageSettingsSlugInput,
          seo: {
            metaTitle: pageSettingsMetaTitleInput,
            metaDescription: pageSettingsMetaDescriptionInput,
            ogImageUrl: pageSettingsOgImageUrlInput,
            ogImageAssetId: pageSettingsOgImageAssetIdInput,
          },
          parentPageId: moveParentPageIdInput || null,
        }),
      });
      const payload = await response.json();
      if (!payload?.ok) {
        setPageTreeStatusMessage(payload?.error || "Failed to update page.");
        return;
      }

      setPageTreeStatusMessage("Page updated.");
      setDidUpdatePage(true);
      if (payload?.page?.id) {
        setSitePagesMap((prev) => ({
          ...prev,
          [selectedSiteId]: (prev[selectedSiteId] || []).map((page) =>
            page.id === payload.page.id ? { ...page, ...payload.page } : page
          ),
        }));
      }
      if (payload?.page?.status === "published") {
        setPrePublishChecks([]);
        setPrePublishStatusMessage("");
        setPublishStatusMessage("");
        setDidPublishPage(false);
      }
      await loadPages(selectedSiteId);
      await loadPageList(selectedSiteId, pageListPage, pageListPageSize);
    } catch (_error) {
      setPageTreeStatusMessage("Failed to update page.");
    } finally {
      setIsUpdatingPage(false);
    }
  }, [
    loadPageList,
    loadPages,
    moveParentPageIdInput,
    pageListPage,
    pageListPageSize,
    pageSettingsSlugInput,
    pageSettingsMetaDescriptionInput,
    pageSettingsOgImageAssetIdInput,
    pageSettingsMetaTitleInput,
    pageSettingsOgImageUrlInput,
    pageSettingsTitleInput,
    selectedPageId,
    selectedSiteId,
    setDidUpdatePage,
    setIsUpdatingPage,
    setDidPublishPage,
    setPageTreeStatusMessage,
    setPrePublishChecks,
    setPrePublishStatusMessage,
    setPublishStatusMessage,
    setSitePagesMap,
  ]);

  const handleUpdatePageHeaderOverride = useCallback(async ({ headerMode, headerPresetId }) => {
    if (!selectedSiteId || !selectedPageId) {
      return { ok: false, error: "Select a page before updating header override." };
    }
    setPageHeaderStatusMessage("");
    setIsUpdatingPageHeader(true);
    try {
      const response = await fetch(`/api/cms/sites/${selectedSiteId}/pages/${selectedPageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headerMode,
          headerPresetId: headerMode === "override" ? headerPresetId : "",
        }),
      });
      const payload = await response.json();
      if (!payload?.ok) {
        setPageHeaderStatusMessage(payload?.error || "Failed to update page header.");
        return { ok: false, error: payload?.error || "Failed to update page header." };
      }
      if (payload?.page?.id) {
        setSitePagesMap((prev) => ({
          ...prev,
          [selectedSiteId]: (prev[selectedSiteId] || []).map((page) =>
            page.id === payload.page.id ? { ...page, ...payload.page } : page
          ),
        }));
      }
      setPreviewRefreshNonce((prev) => prev + 1);
      setPageHeaderStatusMessage("Page header updated.");
      return { ok: true, page: payload?.page };
    } catch (_error) {
      setPageHeaderStatusMessage("Failed to update page header.");
      return { ok: false, error: "Failed to update page header." };
    } finally {
      setIsUpdatingPageHeader(false);
    }
  }, [
    selectedSiteId,
    selectedPageId,
    setIsUpdatingPageHeader,
    setPageHeaderStatusMessage,
    setPreviewRefreshNonce,
    setSitePagesMap,
  ]);

  const handleSelectPage = useCallback(async (pageId) => {
    if (!selectedSiteId) return;
    if (pageId !== selectedPageId && !confirmDiscardUnsavedChanges()) return;
    setSelectedPageId(pageId);
    setIsEditingPage(false);
    localStorage.setItem(CMS_STORAGE_KEYS.page, pageId);
    await loadBlocks(selectedSiteId, pageId);
  }, [confirmDiscardUnsavedChanges, loadBlocks, selectedPageId, selectedSiteId, setIsEditingPage, setSelectedPageId]);

  const handleEditPage = useCallback(async (pageId) => {
    if (!selectedSiteId || !pageId) return;
    setActiveDashboardAction("");
    if (pageId !== selectedPageId) {
      await handleSelectPage(pageId);
    } else {
      await loadBlocks(selectedSiteId, pageId);
    }
    setIsEditingPage(true);
  }, [handleSelectPage, loadBlocks, selectedPageId, selectedSiteId, setActiveDashboardAction, setIsEditingPage]);

  const handleToggleDashboardAction = useCallback((action) => {
    setActiveDashboardAction((prev) => (prev === action ? "" : action));
  }, [setActiveDashboardAction]);

  const handleDeletePage = useCallback(async (pageId) => {
    if (!selectedSiteId || !pageId) return;

    const response = await fetchCms(`/api/cms/sites/${selectedSiteId}/pages/${pageId}`, {
      method: "DELETE",
    });
    const payload = await response.json();
    if (!payload?.ok) {
      setPageStatusMessage(payload?.error || "Failed to delete page.");
      return;
    }

    setPageStatusMessage("Page deleted.");
    setIsEditingPage(false);
    setSelectedBlockId("");
    setPageBlocks([]);
    setLastSavedBlocksJson("[]");
    await loadPages(selectedSiteId);
    await loadPageList(selectedSiteId, pageListPage, pageListPageSize);
  }, [
    loadPageList,
    loadPages,
    pageListPage,
    pageListPageSize,
    selectedSiteId,
    setIsEditingPage,
    setLastSavedBlocksJson,
    setPageBlocks,
    setPageStatusMessage,
    setSelectedBlockId,
  ]);

  const handleClonePage = useCallback(async (pageId) => {
    if (!selectedSiteId || !pageId) return;
    setPageStatusMessage("");

    const response = await fetchCms(`/api/cms/sites/${selectedSiteId}/pages/${pageId}/clone`, {
      method: "POST",
    });
    const payload = await response.json();
    if (!payload?.ok) {
      setPageStatusMessage(payload?.error || "Failed to clone page.");
      return;
    }

    setPageStatusMessage("Page cloned.");
    if (payload?.page?.id) {
      setSelectedPageId(payload.page.id);
      localStorage.setItem(CMS_STORAGE_KEYS.page, payload.page.id);
    }
    await loadPages(selectedSiteId);
    await loadPageList(selectedSiteId, pageListPage, pageListPageSize);
  }, [
    loadPageList,
    loadPages,
    pageListPage,
    pageListPageSize,
    selectedSiteId,
    setPageStatusMessage,
    setSelectedPageId,
  ]);

  const handleRunPrePublishValidation = useCallback(async () => {
    if (!selectedSiteId || !selectedPageId) return;
    setIsRunningPrePublishValidation(true);
    setPrePublishStatusMessage("");
    setPrePublishChecks([]);

    try {
      const response = await fetchCms(`/api/cms/sites/${selectedSiteId}/pages/${selectedPageId}/prepublish`);
      const payload = await response.json();
      if (!payload?.ok) {
        setPrePublishStatusMessage(payload?.error || "Failed to run pre-publish checks.");
        return;
      }
      setPrePublishChecks(Array.isArray(payload.checks) ? payload.checks : []);
      setPrePublishStatusMessage(payload.valid ? "Pre-publish checks passed." : "Pre-publish checks found issues.");
    } catch (_error) {
      setPrePublishStatusMessage("Failed to run pre-publish checks.");
    } finally {
      setIsRunningPrePublishValidation(false);
    }
  }, [
    selectedPageId,
    selectedSiteId,
    setIsRunningPrePublishValidation,
    setPrePublishChecks,
    setPrePublishStatusMessage,
  ]);

  const handleLoadPublishHistory = useCallback(async () => {
    if (!selectedSiteId || !selectedPageId) return;
    setIsLoadingPublishHistory(true);
    setPublishHistoryStatusMessage("");
    try {
      const response = await fetch(`/api/cms/sites/${selectedSiteId}/pages/${selectedPageId}/publish/history`);
      const payload = await response.json();
      if (!payload?.ok) {
        setPublishHistoryEntries([]);
        setPublishHistoryStatusMessage(payload?.error || "Failed to load publish history.");
        return;
      }
      setPublishHistoryEntries(Array.isArray(payload?.versions) ? payload.versions : []);
    } catch (_error) {
      setPublishHistoryEntries([]);
      setPublishHistoryStatusMessage("Failed to load publish history.");
    } finally {
      setIsLoadingPublishHistory(false);
    }
  }, [
    selectedSiteId,
    selectedPageId,
    setIsLoadingPublishHistory,
    setPublishHistoryEntries,
    setPublishHistoryStatusMessage,
  ]);

  const handlePublishPage = useCallback(async () => {
    if (!selectedSiteId || !selectedPageId) return;
    setIsPublishingPage(true);
    setPublishStatusMessage("");
    setDidPublishPage(false);

    try {
      const response = await fetchCms(`/api/cms/sites/${selectedSiteId}/pages/${selectedPageId}/publish`, {
        method: "POST",
      });
      const payload = await response.json();
      if (!payload?.ok) {
        if (Array.isArray(payload?.checks)) {
          setPrePublishChecks(payload.checks);
          setPrePublishStatusMessage("Pre-publish checks found issues.");
        }
        setPublishStatusMessage(payload?.error || "Failed to publish page.");
        return;
      }

      if (Array.isArray(payload?.checks)) {
        setPrePublishChecks(payload.checks);
        setPrePublishStatusMessage("Pre-publish checks passed.");
      }
      setPublishStatusMessage("Page published.");
      setDidPublishPage(true);
      if (payload?.page?.id) {
        setSitePagesMap((prev) => ({
          ...prev,
          [selectedSiteId]: (prev[selectedSiteId] || []).map((page) =>
            page.id === payload.page.id ? { ...page, ...payload.page } : page
          ),
        }));
      }
      await handleLoadPublishHistory();
      await loadPages(selectedSiteId);
      await loadPageList(selectedSiteId, pageListPage, pageListPageSize);
    } catch (_error) {
      setPublishStatusMessage("Failed to publish page.");
    } finally {
      setIsPublishingPage(false);
    }
  }, [
    loadPageList,
    loadPages,
    handleLoadPublishHistory,
    pageListPage,
    pageListPageSize,
    selectedPageId,
    selectedSiteId,
    setDidPublishPage,
    setIsPublishingPage,
    setSitePagesMap,
    setPrePublishChecks,
    setPrePublishStatusMessage,
    setPublishStatusMessage,
  ]);

  const handleUnpublishPage = useCallback(async () => {
    if (!selectedSiteId || !selectedPageId) return;
    setIsUnpublishingPage(true);
    setPublishStatusMessage("");
    setDidPublishPage(false);

    try {
      const response = await fetch(`/api/cms/sites/${selectedSiteId}/pages/${selectedPageId}/publish`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!payload?.ok) {
        setPublishStatusMessage(payload?.error || "Failed to unpublish page.");
        return;
      }

      setPrePublishChecks([]);
      setPrePublishStatusMessage("");
      setPublishStatusMessage("Page unpublished.");
      if (payload?.page?.id) {
        setSitePagesMap((prev) => ({
          ...prev,
          [selectedSiteId]: (prev[selectedSiteId] || []).map((page) =>
            page.id === payload.page.id ? { ...page, ...payload.page } : page
          ),
        }));
      }
      await handleLoadPublishHistory();
      await loadPages(selectedSiteId);
      await loadPageList(selectedSiteId, pageListPage, pageListPageSize);
    } catch (_error) {
      setPublishStatusMessage("Failed to unpublish page.");
    } finally {
      setIsUnpublishingPage(false);
    }
  }, [
    loadPageList,
    loadPages,
    handleLoadPublishHistory,
    pageListPage,
    pageListPageSize,
    selectedPageId,
    selectedSiteId,
    setDidPublishPage,
    setIsUnpublishingPage,
    setSitePagesMap,
    setPrePublishChecks,
    setPrePublishStatusMessage,
    setPublishStatusMessage,
  ]);

  const handleRollbackPageVersion = useCallback(async (versionId) => {
    if (!selectedSiteId || !selectedPageId || !versionId) return;
    setIsRollingBackPublish(true);
    setPublishStatusMessage("");
    setPublishHistoryStatusMessage("");
    setDidPublishPage(false);

    try {
      const response = await fetch(`/api/cms/sites/${selectedSiteId}/pages/${selectedPageId}/publish/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });
      const payload = await response.json();
      if (!payload?.ok) {
        setPublishStatusMessage(payload?.error || "Failed to rollback publish version.");
        return;
      }

      if (payload?.page?.id) {
        setSitePagesMap((prev) => ({
          ...prev,
          [selectedSiteId]: (prev[selectedSiteId] || []).map((page) =>
            page.id === payload.page.id ? { ...page, ...payload.page } : page
          ),
        }));
      }
      setDidPublishPage(true);
      setPublishStatusMessage("Page rollback published.");
      setPreviewRefreshNonce((prev) => prev + 1);
      await handleLoadPublishHistory();
    } catch (_error) {
      setPublishStatusMessage("Failed to rollback publish version.");
    } finally {
      setIsRollingBackPublish(false);
    }
  }, [
    selectedSiteId,
    selectedPageId,
    setIsRollingBackPublish,
    setPublishStatusMessage,
    setPublishHistoryStatusMessage,
    setDidPublishPage,
    setSitePagesMap,
    setPreviewRefreshNonce,
    handleLoadPublishHistory,
  ]);

  return {
    loadPages,
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
    handleSelectPage,
    handleEditPage,
    handleToggleDashboardAction,
    handleDeletePage,
    handleClonePage,
    handleRunPrePublishValidation,
    handleLoadPublishHistory,
    handlePublishPage,
    handleUnpublishPage,
    handleRollbackPageVersion,
  };
}
