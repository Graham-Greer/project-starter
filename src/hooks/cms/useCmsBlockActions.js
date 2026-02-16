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

function sanitizeLegacyPlaceholders(value) {
  if (typeof value === "string") {
    return value.trim().toLowerCase() === "placeholder" ? "" : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLegacyPlaceholders(item));
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, itemValue]) => [key, sanitizeLegacyPlaceholders(itemValue)])
    );
  }

  return value;
}

function sanitizeBlocks(blocks = []) {
  return blocks.map((block) => ({
    ...block,
    props: sanitizeLegacyPlaceholders(block?.props || {}),
  }));
}

function normalizeValidationMessage(rawMessage = "") {
  if (typeof rawMessage !== "string") return "Invalid value.";
  const text = rawMessage.trim().toLowerCase();
  if (text === "is required" || text.endsWith(" is required")) return "This field is required.";
  if (text.startsWith("must be <= ")) {
    const limit = text.match(/must be <=\s*(\d+)/)?.[1];
    return limit ? `Use ${limit} characters or fewer.` : "Value is too long.";
  }
  if (text === "must be a string") return "This field must be text.";
  if (text === "must be a boolean") return "This field must be true or false.";
  if (text === "must be an array") return "This field must be a list.";
  if (text === "must be an object") return "This field must be a grouped value.";
  if (text.startsWith("must have at least")) {
    const minItems = text.match(/must have at least\s*(\d+)/)?.[1];
    return minItems ? `Add at least ${minItems} item(s).` : "Add more items.";
  }
  if (text.startsWith("must be one of:")) return "Select one of the available options.";
  if (text.startsWith("must be")) return `Value ${rawMessage.trim()}.`;
  return "Invalid value.";
}

function toFriendlyFieldPath(fieldPath = "") {
  if (typeof fieldPath !== "string") return "Field";
  const trimmed = fieldPath.trim();
  if (!trimmed) return "Field";
  return trimmed
    .replace(/\[(\d+)\]/g, (_match, index) => ` item ${Number(index) + 1}`)
    .split(".")
    .map((part) => part.replace(/([a-z])([A-Z])/g, "$1 $2"))
    .join(" > ");
}

function toFriendlyBlockSaveError(rawError = "") {
  if (typeof rawError !== "string") return "Invalid value.";
  const text = rawError.trim();
  const match = text.match(/^props\.(.+?)(?:\s(is required|must be .+))?$/i);
  if (!match) return text;
  const pathLabel = toFriendlyFieldPath(match[1]);
  const message = match[2] ? normalizeValidationMessage(match[2]) : "Invalid value.";
  return `${pathLabel}: ${message}`;
}

function parseApiValidationErrors(validationErrors = [], blocks = []) {
  const nextMap = {};

  validationErrors.forEach((item) => {
    const blockId = blocks[item?.index]?.id;
    if (!blockId) return;
    if (!nextMap[blockId]) nextMap[blockId] = {};

    (item?.errors || []).forEach((errorText) => {
      if (typeof errorText !== "string") return;
      const propsMatch = errorText.match(/^props\.(.+?)(?:\s(is required|must be .+))?$/i);
      if (propsMatch) {
        const fieldPath = propsMatch[1];
        const message = propsMatch[2] ? normalizeValidationMessage(propsMatch[2]) : "Invalid value.";
        if (!nextMap[blockId][fieldPath]) nextMap[blockId][fieldPath] = [];
        nextMap[blockId][fieldPath].push(message);
        return;
      }

      if (!nextMap[blockId].__global) nextMap[blockId].__global = [];
      nextMap[blockId].__global.push(errorText);
    });
  });

  return nextMap;
}

export function useCmsBlockActions({
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
}) {
  const persistBlocks = useCallback(async (blocksToSave, successMessage = "Blocks saved") => {
    if (!selectedSiteId || !selectedPageId) return false;
    const normalizedBlocks = sanitizeBlocks(Array.isArray(blocksToSave) ? blocksToSave : []);
    setBlockStatusMessage("");
    setBlockValidationErrorsById({});
    setIsSavingBlocks(true);
    try {
      const response = await fetchCms(`/api/cms/sites/${selectedSiteId}/pages/${selectedPageId}/blocks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: normalizedBlocks }),
      });

      const payload = await response.json();
      if (!payload?.ok) {
        const validationMap = parseApiValidationErrors(payload?.validationErrors || [], normalizedBlocks);
        setBlockValidationErrorsById(validationMap);
        const validationErrorText = payload?.validationErrors
          ? payload.validationErrors
            .map((item) => {
              const rawErrors = Array.isArray(item?.errors) ? item.errors : [];
              const formattedErrors = rawErrors.map((errorText) => toFriendlyBlockSaveError(errorText));
              return `Section ${item.index + 1}: ${formattedErrors.join(" ")}`;
            })
            .join(" | ")
          : "";
        const message = payload?.error ? `${payload.error}${validationErrorText ? ` ${validationErrorText}` : ""}` : "Failed to save blocks.";
        setBlockStatusMessage(message);
        setSaveNotice({ type: "error", message });
        return false;
      }

      const persistedBlocks = sanitizeBlocks(Array.isArray(payload.blocks) ? payload.blocks : normalizedBlocks);
      setBlockStatusMessage("");
      setBlockValidationErrorsById({});
      setPageBlocks(persistedBlocks);
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
      setBlockValidationErrorsById({});
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
    setBlockValidationErrorsById,
    setDidPublishPage,
    setIsSavingBlocks,
    setLastSavedBlocksJson,
    setPageBlocks,
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
    setBlockValidationErrorsById({});
    setSelectedBlockId("");

    try {
      const payload = await fetchCms(`/api/cms/sites/${siteId}/pages/${pageId}/blocks`).then((response) => response.json());
      if (!payload?.ok) {
        throw new Error(payload?.error || "Failed to load page blocks.");
      }
      const nextBlocks = sanitizeBlocks(Array.isArray(payload.blocks) ? payload.blocks : []);
      setPageBlocks(nextBlocks);
      setLastSavedBlocksJson(JSON.stringify(nextBlocks));
    } catch (error) {
      setPageBlocks([]);
      setLastSavedBlocksJson("[]");
      setBlockStatusMessage(error.message || "Failed to load blocks.");
      setBlockValidationErrorsById({});
    } finally {
      setIsLoadingBlocks(false);
    }
  }, [setBlockStatusMessage, setBlockValidationErrorsById, setIsLoadingBlocks, setLastSavedBlocksJson, setPageBlocks, setSelectedBlockId]);

  const handleAddBlock = useCallback((event) => {
    event.preventDefault();
    if (!selectedPageId || !selectedSiteId || !newBlockSectionType || !newBlockVariant) return false;

    let savedBlocks = [];
    try {
      const parsed = JSON.parse(lastSavedBlocksJson || "[]");
      savedBlocks = Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      savedBlocks = [];
    }

    const savedBlockIds = new Set(savedBlocks.map((block) => block.id));
    const unsavedDraftBlock = pageBlocks.find((block) => !savedBlockIds.has(block.id));
    if (unsavedDraftBlock) {
      setSelectedBlockId(unsavedDraftBlock.id);
      setBlockStatusMessage("Finish or cancel the current new section before adding another.");
      return false;
    }

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
    return true;
  }, [
    buildDefaultPropsForSection,
    lastSavedBlocksJson,
    newBlockSectionType,
    newBlockVariant,
    pageBlocks,
    selectedPageId,
    selectedSiteId,
    setBlockStatusMessage,
    setPageBlocks,
    setSelectedBlockId,
  ]);

  const handleRemoveBlock = useCallback(async (blockId) => {
    if (!blockId) return false;

    const previousBlocks = pageBlocks;
    const nextBlocks = previousBlocks.filter((block) => block.id !== blockId);
    if (nextBlocks.length === previousBlocks.length) return false;

    const wasSelected = selectedBlockId === blockId;
    setPageBlocks(nextBlocks);
    if (wasSelected) {
      setSelectedBlockId("");
    }

    const saved = await persistBlocks(nextBlocks, "Section removed");
    if (!saved) {
      setPageBlocks(previousBlocks);
      if (wasSelected) {
        setSelectedBlockId(blockId);
      }
      return false;
    }

    return true;
  }, [pageBlocks, persistBlocks, selectedBlockId, setPageBlocks, setSelectedBlockId]);

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

  const handleCancelSelectedBlockEdits = useCallback(() => {
    if (!selectedBlockId) return;

    let savedBlocks = [];
    try {
      const parsed = JSON.parse(lastSavedBlocksJson || "[]");
      savedBlocks = Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      savedBlocks = [];
    }

    const savedBlock = savedBlocks.find((block) => block.id === selectedBlockId);
    if (savedBlock) {
      setPageBlocks((prev) =>
        prev.map((block) =>
          block.id === selectedBlockId
            ? {
                ...block,
                props: { ...(savedBlock.props || {}) },
              }
            : block
        )
      );
    } else {
      setPageBlocks((prev) => prev.filter((block) => block.id !== selectedBlockId));
      setBlockStatusMessage("Section draft discarded.");
    }
    setSelectedBlockId("");
    setPropsEditorMessage("");
  }, [lastSavedBlocksJson, selectedBlockId, setBlockStatusMessage, setPageBlocks, setPropsEditorMessage, setSelectedBlockId]);

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
    setBlockValidationErrorsById((prev) => {
      if (!prev[selectedBlockId]) return prev;
      const nextForBlock = { ...prev[selectedBlockId] };
      Object.keys(nextForBlock).forEach((pathKey) => {
        if (pathKey === "__global" || pathKey === fieldName || pathKey.startsWith(`${fieldName}.`) || pathKey.startsWith(`${fieldName}[`)) {
          delete nextForBlock[pathKey];
        }
      });
      const next = { ...prev };
      if (Object.keys(nextForBlock).length === 0) {
        delete next[selectedBlockId];
      } else {
        next[selectedBlockId] = nextForBlock;
      }
      return next;
    });
    setPropsEditorMessage("Prop updated locally. Save blocks to persist.");
  }, [selectedBlockId, setBlockValidationErrorsById, setPageBlocks, setPropsEditorMessage]);

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
    handleCancelSelectedBlockEdits,
    handleSelectBlock,
    handleUpdateSelectedBlockProps,
    handleApplyAdvancedProps,
    handleFormatAdvancedPropsInput,
    handleResetAdvancedPropsToSchema,
  };
}
