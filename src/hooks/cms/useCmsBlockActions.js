import { useCallback } from "react";
import { buildSchemaTemplate } from "@/lib/cms/cms-utils";
import { getFirebaseClientAuth } from "@/lib/firebase/client";

async function fetchCms(path, init = {}) {
  const headers = new Headers(init?.headers || {});
  try {
    const token = await getFirebaseClientAuth()?.currentUser?.getIdToken();
    if (token) headers.set("x-firebase-id-token", token);
  } catch (_error) {
    // Fall back to cookie-based auth when token header is unavailable.
  }
  return fetch(path, {
    ...init,
    headers,
    credentials: "include",
  });
}

export function useCmsBlockActions({
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
}) {
  const persistBlocks = useCallback(async (blocksToSave, successMessage = "Blocks saved") => {
    if (!selectedSiteId || !selectedPageId) return false;
    setBlockStatusMessage("");
    setIsSavingBlocks(true);
    try {
      const response = await fetchCms(`/api/cms/sites/${selectedSiteId}/pages/${selectedPageId}/blocks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: blocksToSave }),
      });

      const payload = await response.json();
      if (!payload?.ok) {
        const validationErrorText = payload?.validationErrors
          ? payload.validationErrors.map((item) => `Block ${item.index + 1}: ${item.errors.join(", ")}`).join(" | ")
          : "";
        const message = payload?.error ? `${payload.error}${validationErrorText ? ` ${validationErrorText}` : ""}` : "Failed to save blocks.";
        setBlockStatusMessage(message);
        setSaveNotice({ type: "error", message });
        return false;
      }

      const persistedBlocks = Array.isArray(payload.blocks) ? payload.blocks : blocksToSave;
      setBlockStatusMessage("");
      setLastSavedBlocksJson(JSON.stringify(persistedBlocks));
      setSitePagesMap((prev) => ({
        ...prev,
        [selectedSiteId]: (prev[selectedSiteId] || []).map((page) =>
          page.id === selectedPageId
            ? {
                ...page,
                hasUnpublishedChanges: true,
                draftVersion: payload?.draftVersion || ((page?.draftVersion || 1) + 1),
                updatedAt: new Date().toISOString(),
              }
            : page
        ),
      }));
      if (selectedPage?.status === "published") {
        setPrePublishChecks([]);
        setPrePublishStatusMessage("");
        setPublishStatusMessage("");
        setDidPublishPage(false);
      }
      setSaveNotice({
        type: "success",
        message: `${successMessage} at ${new Date().toLocaleTimeString()}.`,
      });
      setPreviewRefreshNonce((prev) => prev + 1);
      return true;
    } catch (_error) {
      const message = "Failed to save blocks.";
      setBlockStatusMessage(message);
      setSaveNotice({ type: "error", message });
      return false;
    } finally {
      setIsSavingBlocks(false);
    }
  }, [
    selectedPageId,
    selectedPage?.status,
    selectedSiteId,
    setBlockStatusMessage,
    setDidPublishPage,
    setIsSavingBlocks,
    setLastSavedBlocksJson,
    setPrePublishChecks,
    setPrePublishStatusMessage,
    setPreviewRefreshNonce,
    setPublishStatusMessage,
    setSaveNotice,
    setSitePagesMap,
  ]);

  const loadBlocks = useCallback(async (siteId, pageId) => {
    if (!siteId || !pageId) return;
    setIsLoadingBlocks(true);
    setBlockStatusMessage("");
    setSelectedBlockId("");

    try {
      const payload = await fetchCms(`/api/cms/sites/${siteId}/pages/${pageId}/blocks`).then((response) => response.json());
      if (!payload?.ok) {
        throw new Error(payload?.error || "Failed to load page blocks.");
      }
      const nextBlocks = Array.isArray(payload.blocks) ? payload.blocks : [];
      setPageBlocks(nextBlocks);
      setLastSavedBlocksJson(JSON.stringify(nextBlocks));
    } catch (error) {
      setPageBlocks([]);
      setLastSavedBlocksJson("[]");
      setBlockStatusMessage(error.message || "Failed to load blocks.");
    } finally {
      setIsLoadingBlocks(false);
    }
  }, [setBlockStatusMessage, setIsLoadingBlocks, setLastSavedBlocksJson, setPageBlocks, setSelectedBlockId]);

  const handleAddBlock = useCallback((event) => {
    event.preventDefault();
    if (!selectedPageId || !selectedSiteId || !newBlockSectionType || !newBlockVariant) return;

    const blockId = `${newBlockSectionType}-${newBlockVariant}-${Date.now()}`;
    const nextBlock = {
      id: blockId,
      sectionType: newBlockSectionType,
      variant: newBlockVariant,
      props: buildDefaultPropsForSection(newBlockSectionType, newBlockVariant),
    };

    setPageBlocks((prev) => [...prev, nextBlock]);
    setSelectedBlockId(blockId);
    setBlockStatusMessage("Block added locally. Save blocks to persist.");
  }, [
    buildDefaultPropsForSection,
    newBlockSectionType,
    newBlockVariant,
    selectedPageId,
    selectedSiteId,
    setBlockStatusMessage,
    setPageBlocks,
    setSelectedBlockId,
  ]);

  const handleRemoveBlock = useCallback((blockId) => {
    setPageBlocks((prev) => prev.filter((block) => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId("");
    }
    setBlockStatusMessage("Block removed locally. Save blocks to persist.");
  }, [selectedBlockId, setBlockStatusMessage, setPageBlocks, setSelectedBlockId]);

  const handleBlockDragStart = useCallback((blockId) => {
    setDraggedBlockId(blockId);
  }, [setDraggedBlockId]);

  const handleBlockDragOver = useCallback((event, blockId) => {
    event.preventDefault();
    if (!draggedBlockId || draggedBlockId === blockId) return;
    setDragOverBlockId(blockId);
  }, [draggedBlockId, setDragOverBlockId]);

  const handleBlockDrop = useCallback(async (event, targetBlockId) => {
    event.preventDefault();
    if (!draggedBlockId || !targetBlockId || draggedBlockId === targetBlockId) {
      setDragOverBlockId("");
      return;
    }

    const fromIndex = pageBlocks.findIndex((block) => block.id === draggedBlockId);
    const toIndex = pageBlocks.findIndex((block) => block.id === targetBlockId);
    if (fromIndex < 0 || toIndex < 0) {
      setDragOverBlockId("");
      return;
    }

    const nextBlocks = [...pageBlocks];
    const [moved] = nextBlocks.splice(fromIndex, 1);
    nextBlocks.splice(toIndex, 0, moved);
    setPageBlocks(nextBlocks);
    await persistBlocks(nextBlocks, "Section order saved");
    setDragOverBlockId("");
  }, [draggedBlockId, pageBlocks, persistBlocks, setDragOverBlockId, setPageBlocks]);

  const handleBlockDragEnd = useCallback(() => {
    setDraggedBlockId("");
    setDragOverBlockId("");
  }, [setDragOverBlockId, setDraggedBlockId]);

  const handleTogglePreviewTheme = useCallback(() => {
    setPreviewTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setPreviewTheme]);

  const handleSaveBlocks = useCallback(async () => {
    const saved = await persistBlocks(pageBlocks, "Blocks saved");
    if (saved) {
      setSelectedBlockId("");
    }
  }, [pageBlocks, persistBlocks, setSelectedBlockId]);

  const handleSelectBlock = useCallback((blockId) => {
    setSelectedBlockId(blockId);
    setPropsEditorMessage("");
  }, [setPropsEditorMessage, setSelectedBlockId]);

  const handleUpdateSelectedBlockProps = useCallback((fieldName, value) => {
    if (!selectedBlockId) return;
    setPageBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== selectedBlockId) return block;
        return {
          ...block,
          props: {
            ...(block.props || {}),
            [fieldName]: value,
          },
        };
      })
    );
    setPropsEditorMessage("Prop updated locally. Save blocks to persist.");
  }, [selectedBlockId, setPageBlocks, setPropsEditorMessage]);

  const handleApplyAdvancedProps = useCallback(() => {
    if (!selectedBlockId) return;
    const raw = advancedPropsInputRef.current?.value || "";

    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        setPropsEditorMessage("Advanced props must be a JSON object.");
        return;
      }
      setPageBlocks((prev) =>
        prev.map((block) =>
          block.id === selectedBlockId
            ? {
                ...block,
                props: parsed,
              }
            : block
        )
      );
      setPropsEditorMessage("Advanced props applied locally. Save blocks to persist.");
    } catch (_error) {
      setPropsEditorMessage("Invalid JSON in advanced editor.");
    }
  }, [advancedPropsInputRef, selectedBlockId, setPageBlocks, setPropsEditorMessage]);

  const handleFormatAdvancedPropsInput = useCallback(() => {
    if (!selectedBlockId) return;
    const raw = advancedPropsInputRef.current?.value || "";

    try {
      const parsed = JSON.parse(raw);
      advancedPropsInputRef.current.value = JSON.stringify(parsed, null, 2);
      setPropsEditorMessage("Advanced JSON formatted.");
    } catch (_error) {
      setPropsEditorMessage("Invalid JSON in advanced editor.");
    }
  }, [advancedPropsInputRef, selectedBlockId, setPropsEditorMessage]);

  const handleResetAdvancedPropsToSchema = useCallback(() => {
    if (!selectedBlock || !selectedBlockSchema) return;
    const template = buildSchemaTemplate(selectedBlockSchema);
    setPageBlocks((prev) =>
      prev.map((block) =>
        block.id === selectedBlock.id
          ? {
              ...block,
              props: template,
            }
          : block
      )
    );

    if (advancedPropsInputRef.current) {
      advancedPropsInputRef.current.value = JSON.stringify(template, null, 2);
    }
    setPropsEditorMessage("Advanced props reset to schema template. Save blocks to persist.");
  }, [advancedPropsInputRef, selectedBlock, selectedBlockSchema, setPageBlocks, setPropsEditorMessage]);

  return {
    loadBlocks,
    persistBlocks,
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
  };
}
