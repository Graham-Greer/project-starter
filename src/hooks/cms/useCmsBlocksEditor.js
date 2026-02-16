import { useRef, useState } from "react";

export function useCmsBlocksEditor() {
  const [pageBlocks, setPageBlocks] = useState([]);
  const [lastSavedBlocksJson, setLastSavedBlocksJson] = useState("[]");
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [isSavingBlocks, setIsSavingBlocks] = useState(false);
  const [blockStatusMessage, setBlockStatusMessage] = useState("");
  const [saveNotice, setSaveNotice] = useState({ type: "", message: "" });
  const [blockValidationErrorsById, setBlockValidationErrorsById] = useState({});
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [draggedBlockId, setDraggedBlockId] = useState("");
  const [dragOverBlockId, setDragOverBlockId] = useState("");
  const [propsEditorMessage, setPropsEditorMessage] = useState("");
  const [editorMode, setEditorMode] = useState("standard");
  const [previewViewport, setPreviewViewport] = useState("desktop");
  const [previewTheme, setPreviewTheme] = useState("light");
  const [previewRefreshNonce, setPreviewRefreshNonce] = useState(0);
  const advancedPropsInputRef = useRef(null);

  return {
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
  };
}
