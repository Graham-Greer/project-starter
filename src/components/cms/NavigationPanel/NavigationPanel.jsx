import { Fragment, useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { Icon } from "@/components/primitives";
import LiveRuntimeHeader from "@/components/cms/LiveRuntimeHeader/LiveRuntimeHeader";
import MediaPicker from "@/components/cms/MediaPicker";

const MAX_NAV_DEPTH = 2;

function buildEmptyNavItem(index = 0) {
  return {
    id: `nav-${Date.now()}-${index}`,
    label: "",
    type: "page",
    pageId: "",
    href: "",
    visible: true,
    openInNewTab: false,
    order: index,
    children: [],
  };
}

function buildNavFromPages(pages = []) {
  const allPages = Array.isArray(pages) ? pages : [];
  const byParent = new Map();
  allPages.forEach((page) => {
    const parentId = page.parentPageId || null;
    if (!byParent.has(parentId)) byParent.set(parentId, []);
    byParent.get(parentId).push(page);
  });

  const sortPages = (list) =>
    [...list].sort((a, b) => {
      const orderA = typeof a.order === "number" ? a.order : 0;
      const orderB = typeof b.order === "number" ? b.order : 0;
      if (orderA !== orderB) return orderA - orderB;
      return String(a.title || "").localeCompare(String(b.title || ""));
    });

  const toItem = (page, index) => {
    const children = sortPages(byParent.get(page.id) || []).map((child, childIndex) => ({
      id: `nav-${page.id}-${child.id}`,
      label: child.title || child.slug || `Page ${childIndex + 1}`,
      type: "page",
      pageId: child.id,
      href: "",
      visible: true,
      openInNewTab: false,
      order: childIndex,
      children: [],
    }));

    return {
      id: `nav-${page.id}`,
      label: page.title || page.slug || `Page ${index + 1}`,
      type: "page",
      pageId: page.id,
      href: "",
      visible: true,
      openInNewTab: false,
      order: index,
      children,
    };
  };

  return sortPages(byParent.get(null) || []).map(toItem);
}

function normalizeItems(items = []) {
  return items.map((item, index) => ({
    ...item,
    order: index,
  }));
}

function normalizeMenuTree(items = []) {
  return normalizeItems(items).map((item) => ({
    ...item,
    children: normalizeItems(item.children || []).map((child) => ({
      ...child,
      children: normalizeItems(child.children || []),
    })),
  }));
}

function removeItemFromTree(items = [], itemId = "") {
  let removedItem = null;
  const nextItems = [];

  for (const item of items) {
    if (item.id === itemId) {
      removedItem = { ...item };
      continue;
    }

    const childRemoval = removeItemFromTree(item.children || [], itemId);
    if (childRemoval.removedItem) {
      removedItem = childRemoval.removedItem;
      nextItems.push({
        ...item,
        children: childRemoval.items,
      });
      continue;
    }

    nextItems.push(item);
  }

  return {
    items: nextItems,
    removedItem,
  };
}

function insertItemUnderParent(items = [], parentId = "", itemToInsert) {
  let inserted = false;
  const nextItems = items.map((item) => {
    if (item.id === parentId) {
      inserted = true;
      return {
        ...item,
        children: [...(item.children || []), itemToInsert],
      };
    }

    const childInsert = insertItemUnderParent(item.children || [], parentId, itemToInsert);
    if (childInsert.inserted) {
      inserted = true;
      return {
        ...item,
        children: childInsert.items,
      };
    }

    return item;
  });

  return {
    items: nextItems,
    inserted,
  };
}

function findItemById(items = [], targetId = "") {
  for (const item of items) {
    if (item.id === targetId) return item;
    const childMatch = findItemById(item.children || [], targetId);
    if (childMatch) return childMatch;
  }
  return null;
}

function findDepthById(items = [], targetId = "", depth = 0) {
  for (const item of items) {
    if (item.id === targetId) return depth;
    const childDepth = findDepthById(item.children || [], targetId, depth + 1);
    if (childDepth >= 0) return childDepth;
  }
  return -1;
}

function collectDescendantIds(item, acc = new Set()) {
  (item?.children || []).forEach((child) => {
    if (child?.id) acc.add(child.id);
    collectDescendantIds(child, acc);
  });
  return acc;
}

function getRelativeSubtreeDepth(item) {
  if (!item?.children || item.children.length === 0) return 0;
  const childDepths = item.children.map((child) => 1 + getRelativeSubtreeDepth(child));
  return Math.max(...childDepths);
}

function normalizeHeaderDraft(header) {
  const sourceVariant = header?.variant || "simple";
  const variant = sourceVariant === "split-cta" ? "simple" : sourceVariant;
  return {
    variant,
    overlayMode: header?.overlayMode || "off",
    sticky: typeof header?.sticky === "boolean" ? header.sticky : true,
    mobilePattern: header?.mobilePattern || "drawer",
    primaryActionLabel: header?.primaryAction?.label || "",
    primaryActionHref: header?.primaryAction?.href || "",
    secondaryActionLabel: header?.secondaryAction?.label || "",
    secondaryActionHref: header?.secondaryAction?.href || "",
    logoUrl: header?.logo?.src || "",
    logoAlt: header?.logo?.alt || "",
    logoAssetId: header?.logo?.assetId || "",
  };
}

function buildHeaderPayload(draft) {
  const primaryActionLabel = (draft?.primaryActionLabel || "").trim();
  const primaryActionHref = (draft?.primaryActionHref || "").trim();
  const secondaryActionLabel = (draft?.secondaryActionLabel || "").trim();
  const secondaryActionHref = (draft?.secondaryActionHref || "").trim();

  return {
    variant: draft?.variant || "simple",
    overlayMode: draft?.overlayMode || "off",
    sticky: Boolean(draft?.sticky),
    mobilePattern: draft?.mobilePattern || "drawer",
    logo: draft?.logoUrl
      ? {
        src: draft.logoUrl.trim(),
        alt: (draft.logoAlt || "").trim(),
        assetId: (draft.logoAssetId || "").trim(),
      }
      : null,
    primaryAction: primaryActionLabel || primaryActionHref
      ? { label: primaryActionLabel, href: primaryActionHref }
      : null,
    secondaryAction: secondaryActionLabel || secondaryActionHref
      ? { label: secondaryActionLabel, href: secondaryActionHref }
      : null,
  };
}

function normalizeHeaderPresetsForUi(site) {
  const rawHeaders = Array.isArray(site?.headers) ? site.headers : [];
  const normalizedHeaders = rawHeaders
    .map((item, index) => ({
      id: String(item?.id || "").trim() || `header-${index + 1}`,
      name: String(item?.name || "").trim() || `Header ${index + 1}`,
      config: item?.config || item?.header || {},
    }))
    .filter((item) => item.id);

  if (normalizedHeaders.length > 0) return normalizedHeaders;
  return [
    {
      id: "header-default",
      name: "Default header",
      config: site?.header || {},
    },
  ];
}

export default function NavigationPanel({
  styles,
  selectedSite,
  selectedSitePages,
  onSaveHeader,
  onSaveNavigation,
}) {
  const [headerDraftBySiteId, setHeaderDraftBySiteId] = useState({});
  const [headerNameDraftByKey, setHeaderNameDraftByKey] = useState({});
  const [selectedHeaderIdBySiteId, setSelectedHeaderIdBySiteId] = useState({});
  const [headerCtaVisibilityByDraftKey, setHeaderCtaVisibilityByDraftKey] = useState({});
  const [headerCtaExpandedByDraftKey, setHeaderCtaExpandedByDraftKey] = useState({});
  const [headerSaveStatusBySiteId, setHeaderSaveStatusBySiteId] = useState({});
  const [isSavingHeaderBySiteId, setIsSavingHeaderBySiteId] = useState({});
  const [isLogoPickerOpen, setIsLogoPickerOpen] = useState(false);
  const [navigationDraftBySiteId, setNavigationDraftBySiteId] = useState({});
  const [expandedItemIdsBySiteId, setExpandedItemIdsBySiteId] = useState({});
  const [saveStatusBySiteId, setSaveStatusBySiteId] = useState({});
  const [isSavingBySiteId, setIsSavingBySiteId] = useState({});

  const siteId = selectedSite?.id || "";
  const sourceHeaders = normalizeHeaderPresetsForUi(selectedSite || {});
  const sourceActiveHeaderId = sourceHeaders.some((item) => item.id === selectedSite?.activeHeaderId)
    ? selectedSite?.activeHeaderId
    : sourceHeaders[0]?.id || "";
  const selectedHeaderId = siteId ? (selectedHeaderIdBySiteId[siteId] || sourceActiveHeaderId) : sourceActiveHeaderId;
  const sourceHeaderPreset = sourceHeaders.find((item) => item.id === selectedHeaderId) || sourceHeaders[0];
  const sourceHeader = normalizeHeaderDraft(sourceHeaderPreset?.config || {});
  const sourceHeaderName = String(sourceHeaderPreset?.name || "").trim() || "Header";
  const headerDraftKey = siteId && selectedHeaderId ? `${siteId}::${selectedHeaderId}` : "";
  const headerDraft = headerDraftKey ? (headerDraftBySiteId[headerDraftKey] || sourceHeader) : sourceHeader;
  const headerNameDraft = headerDraftKey ? (headerNameDraftByKey[headerDraftKey] ?? sourceHeaderName) : sourceHeaderName;
  const isSavingHeader = Boolean(siteId && isSavingHeaderBySiteId[siteId]);
  const headerSaveStatus = siteId ? headerSaveStatusBySiteId[siteId] || "" : "";
  const hasUnsavedHeaderChanges =
    JSON.stringify(headerDraft) !== JSON.stringify(sourceHeader) ||
    headerNameDraft !== sourceHeaderName;
  const sourceItems = selectedSite?.navigation?.primary || [];
  const draftItems = siteId ? (navigationDraftBySiteId[siteId] || sourceItems) : sourceItems;
  const isSaving = Boolean(siteId && isSavingBySiteId[siteId]);
  const saveStatus = siteId ? saveStatusBySiteId[siteId] || "" : "";
  const hasUnsavedChanges = JSON.stringify(draftItems) !== JSON.stringify(sourceItems);
  const toPreviewNavItems = (items = []) =>
    items
      .filter((item) => item?.visible && item?.label)
      .slice(0, 4)
      .map((item, index) => ({
        id: item.id || `preview-nav-${index + 1}`,
        label: item.label,
        href: item.type === "url" ? (item.href || "#") : "#",
        visible: true,
        openInNewTab: false,
        order: index,
        children: toPreviewNavItems(item.children || []),
      }));
  const previewNavItems = toPreviewNavItems(draftItems);

  const setSiteDraftItems = (nextItems) => {
    if (!siteId) return;
    setNavigationDraftBySiteId((prev) => ({
      ...prev,
      [siteId]: normalizeItems(nextItems),
    }));
  };

  const setSiteExpandedItems = (nextExpandedItems) => {
    if (!siteId) return;
    setExpandedItemIdsBySiteId((prev) => ({
      ...prev,
      [siteId]: nextExpandedItems,
    }));
  };

  const setHeaderCtaVisibility = (patch) => {
    if (!headerDraftKey) return;
    setHeaderCtaVisibilityByDraftKey((prev) => ({
      ...prev,
      [headerDraftKey]: {
        ...(prev[headerDraftKey] || {}),
        ...patch,
      },
    }));
  };

  const setHeaderCtaExpanded = (patch) => {
    if (!headerDraftKey) return;
    setHeaderCtaExpandedByDraftKey((prev) => ({
      ...prev,
      [headerDraftKey]: {
        ...(prev[headerDraftKey] || {}),
        ...patch,
      },
    }));
  };

  const setSiteHeaderDraft = (patch) => {
    if (!siteId || !selectedHeaderId) return;
    const draftKey = `${siteId}::${selectedHeaderId}`;
    setHeaderDraftBySiteId((prev) => ({
      ...prev,
      [draftKey]: {
        ...(prev[draftKey] || sourceHeader),
        ...patch,
      },
    }));
  };

  const hasPrimaryAction =
    Boolean(headerDraft?.primaryActionLabel?.trim()) || Boolean(headerDraft?.primaryActionHref?.trim());
  const hasSecondaryAction =
    Boolean(headerDraft?.secondaryActionLabel?.trim()) || Boolean(headerDraft?.secondaryActionHref?.trim());
  const showPrimaryAction = headerDraftKey
    ? (headerCtaVisibilityByDraftKey[headerDraftKey]?.primaryAction ?? hasPrimaryAction)
    : hasPrimaryAction;
  const showSecondaryAction = headerDraftKey
    ? (headerCtaVisibilityByDraftKey[headerDraftKey]?.secondaryAction ?? hasSecondaryAction)
    : hasSecondaryAction;
  const primaryActionExpanded = headerDraftKey
    ? (headerCtaExpandedByDraftKey[headerDraftKey]?.primaryAction ?? false)
    : false;
  const secondaryActionExpanded = headerDraftKey
    ? (headerCtaExpandedByDraftKey[headerDraftKey]?.secondaryAction ?? false)
    : false;

  const handleAddItem = () => {
    const nextItem = buildEmptyNavItem(draftItems.length);
    const next = [...draftItems, nextItem];
    setSiteDraftItems(next);
    const currentExpanded = expandedItemIdsBySiteId[siteId] || {};
    setSiteExpandedItems({
      ...currentExpanded,
      [nextItem.id]: true,
    });
  };

  const handleRemoveItem = (id) => {
    const next = draftItems.filter((item) => item.id !== id);
    setSiteDraftItems(next);
    if (!siteId) return;
    const currentExpanded = expandedItemIdsBySiteId[siteId] || {};
    if (!(id in currentExpanded)) return;
    const nextExpanded = { ...currentExpanded };
    delete nextExpanded[id];
    setSiteExpandedItems(nextExpanded);
  };

  const handleMoveItem = (id, direction) => {
    const fromIndex = draftItems.findIndex((item) => item.id === id);
    if (fromIndex < 0) return;
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= draftItems.length) return;
    const next = [...draftItems];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setSiteDraftItems(next);
  };

  const handleUpdateItem = (id, patch) => {
    const next = draftItems.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, ...patch };
      if (updated.type === "page") {
        updated.href = "";
      }
      if (updated.type === "url") {
        updated.pageId = "";
      }
      return updated;
    });
    setSiteDraftItems(next);
  };

  const getParentOptions = (excludeId = "") => {
    const currentItem = findItemById(draftItems, excludeId);
    const currentSubtreeDepth = getRelativeSubtreeDepth(currentItem);
    const descendantIds = currentItem ? collectDescendantIds(currentItem) : new Set();
    const options = [];
    draftItems.forEach((candidate) => {
      const parentDepth = findDepthById(draftItems, candidate.id);
      const canAcceptAtDepth = parentDepth >= 0 && parentDepth + 1 + currentSubtreeDepth <= MAX_NAV_DEPTH;
      if (candidate.id !== excludeId && !descendantIds.has(candidate.id) && canAcceptAtDepth) {
        options.push({
          id: candidate.id,
          label: candidate.label?.trim() || "Untitled item",
        });
      }
      (candidate.children || []).forEach((childCandidate) => {
        const childDepth = findDepthById(draftItems, childCandidate.id);
        const childCanAcceptAtDepth = childDepth >= 0 && childDepth + 1 + currentSubtreeDepth <= MAX_NAV_DEPTH;
        if (childCandidate.id === excludeId || descendantIds.has(childCandidate.id) || !childCanAcceptAtDepth) return;
        options.push({
          id: childCandidate.id,
          label: `${candidate.label?.trim() || "Untitled item"} / ${childCandidate.label?.trim() || "Untitled item"}`,
        });
      });
    });
    return options;
  };

  const handleReparentItem = (itemId, nextParentId) => {
    if (!itemId) return;
    if (nextParentId === itemId) return;

    let extractedItem = null;
    const trimmedParentId = (nextParentId || "").trim();

    const removal = removeItemFromTree(draftItems, itemId);
    const withoutItem = removal.items;
    extractedItem = removal.removedItem;

    if (!extractedItem) return;
    const subtreeDepth = getRelativeSubtreeDepth(extractedItem);

    let nextTree = [...withoutItem];
    if (trimmedParentId) {
      const parentDepth = findDepthById(nextTree, trimmedParentId);
      if (parentDepth < 0) return;
      if (parentDepth + 1 + subtreeDepth > MAX_NAV_DEPTH) {
        setSaveStatusBySiteId((prev) => ({
          ...prev,
          [siteId]: "This parent selection exceeds the maximum navigation depth.",
        }));
        return;
      }
      const childSafeItem = { ...extractedItem, children: extractedItem.children || [] };
      const insertion = insertItemUnderParent(nextTree, trimmedParentId, childSafeItem);
      if (!insertion.inserted) return;
      nextTree = insertion.items;
    } else {
      if (subtreeDepth > MAX_NAV_DEPTH) {
        setSaveStatusBySiteId((prev) => ({
          ...prev,
          [siteId]: "This item tree exceeds the maximum navigation depth.",
        }));
        return;
      }
      nextTree = [...nextTree, { ...extractedItem, children: extractedItem.children || [] }];
    }

    setSaveStatusBySiteId((prev) => ({ ...prev, [siteId]: "" }));
    setSiteDraftItems(normalizeMenuTree(nextTree));
  };

  const handleReset = () => {
    if (!siteId) return;
    setNavigationDraftBySiteId((prev) => {
      const next = { ...prev };
      delete next[siteId];
      return next;
    });
    setSaveStatusBySiteId((prev) => ({ ...prev, [siteId]: "Changes discarded." }));
  };

  const handleGenerateFromPages = () => {
    if (!selectedSitePages?.length) return;
    const generated = buildNavFromPages(selectedSitePages);
    setSiteDraftItems(generated);
    setSaveStatusBySiteId((prev) => ({ ...prev, [siteId]: "Generated from pages. Review and save navigation." }));
  };

  const isItemExpanded = (item) => {
    if (!siteId) return false;
    const expandedMap = expandedItemIdsBySiteId[siteId] || {};
    if (item?.id in expandedMap) {
      return Boolean(expandedMap[item.id]);
    }
    return false;
  };

  const handleToggleItem = (id) => {
    if (!siteId) return;
    const expandedMap = expandedItemIdsBySiteId[siteId] || {};
    setSiteExpandedItems({
      ...expandedMap,
      [id]: !Boolean(expandedMap[id]),
    });
  };

  const handleResetHeader = () => {
    if (!siteId || !selectedHeaderId) return;
    const draftKey = `${siteId}::${selectedHeaderId}`;
    setHeaderDraftBySiteId((prev) => {
      const next = { ...prev };
      delete next[draftKey];
      return next;
    });
    setHeaderNameDraftByKey((prev) => {
      const next = { ...prev };
      delete next[draftKey];
      return next;
    });
    setHeaderSaveStatusBySiteId((prev) => ({ ...prev, [siteId]: "Header changes discarded." }));
    setHeaderCtaVisibilityByDraftKey((prev) => {
      const next = { ...prev };
      delete next[draftKey];
      return next;
    });
    setHeaderCtaExpandedByDraftKey((prev) => {
      const next = { ...prev };
      delete next[draftKey];
      return next;
    });
  };

  const handleSaveHeader = async () => {
    if (!siteId || !onSaveHeader || !selectedHeaderId) return;
    setIsSavingHeaderBySiteId((prev) => ({ ...prev, [siteId]: true }));
    setHeaderSaveStatusBySiteId((prev) => ({ ...prev, [siteId]: "" }));
    const nextHeaderConfig = buildHeaderPayload(headerDraft);
    const nextHeaderName = String(headerNameDraft || "").trim() || "Header";
    const nextHeaders = sourceHeaders.map((item) =>
      item.id === selectedHeaderId
        ? {
          ...item,
          name: nextHeaderName,
          config: nextHeaderConfig,
        }
        : item
    );

    const result = await onSaveHeader({
      headers: nextHeaders,
      activeHeaderId: selectedHeaderId,
      header: nextHeaderConfig,
    });

    if (!result?.ok) {
      setHeaderSaveStatusBySiteId((prev) => ({ ...prev, [siteId]: result?.error || "Failed to save header settings." }));
      setIsSavingHeaderBySiteId((prev) => ({ ...prev, [siteId]: false }));
      return;
    }

    setHeaderDraftBySiteId((prev) => {
      const next = { ...prev };
      delete next[`${siteId}::${selectedHeaderId}`];
      return next;
    });
    setHeaderNameDraftByKey((prev) => {
      const next = { ...prev };
      delete next[`${siteId}::${selectedHeaderId}`];
      return next;
    });
    setHeaderSaveStatusBySiteId((prev) => ({ ...prev, [siteId]: "Header settings saved." }));
    setHeaderCtaExpandedByDraftKey((prev) => ({
      ...prev,
      [`${siteId}::${selectedHeaderId}`]: {
        primaryAction: false,
        secondaryAction: false,
      },
    }));
    setIsSavingHeaderBySiteId((prev) => ({ ...prev, [siteId]: false }));
  };

  const handleSelectHeaderPreset = (nextHeaderId) => {
    if (!siteId || !nextHeaderId) return;
    setSelectedHeaderIdBySiteId((prev) => ({
      ...prev,
      [siteId]: nextHeaderId,
    }));
  };

  const handleCreateHeaderPreset = async () => {
    if (!siteId || !onSaveHeader) return;
    const baseIndex = sourceHeaders.length + 1;
    const nextHeaderId = `header-${Date.now()}`;
    const nextHeaderName = `Header ${baseIndex}`;
    const nextHeaders = [
      ...sourceHeaders,
      {
        id: nextHeaderId,
        name: nextHeaderName,
        config: buildHeaderPayload(normalizeHeaderDraft({})),
      },
    ];
    setIsSavingHeaderBySiteId((prev) => ({ ...prev, [siteId]: true }));
    setHeaderSaveStatusBySiteId((prev) => ({ ...prev, [siteId]: "" }));
    const result = await onSaveHeader({
      headers: nextHeaders,
      activeHeaderId: nextHeaderId,
      header: buildHeaderPayload(normalizeHeaderDraft({})),
    });
    if (!result?.ok) {
      setHeaderSaveStatusBySiteId((prev) => ({ ...prev, [siteId]: result?.error || "Failed to create header preset." }));
      setIsSavingHeaderBySiteId((prev) => ({ ...prev, [siteId]: false }));
      return;
    }
    setSelectedHeaderIdBySiteId((prev) => ({
      ...prev,
      [siteId]: nextHeaderId,
    }));
    setHeaderSaveStatusBySiteId((prev) => ({ ...prev, [siteId]: "Header preset created." }));
    setIsSavingHeaderBySiteId((prev) => ({ ...prev, [siteId]: false }));
  };

  const handleSave = async () => {
    if (!siteId || !onSaveNavigation) return;
    setIsSavingBySiteId((prev) => ({ ...prev, [siteId]: true }));
    setSaveStatusBySiteId((prev) => ({ ...prev, [siteId]: "" }));

    const payload = {
      primary: normalizeItems(draftItems || []),
    };

    const result = await onSaveNavigation(payload);

    if (!result?.ok) {
      setSaveStatusBySiteId((prev) => ({ ...prev, [siteId]: result?.error || "Failed to save navigation." }));
      setIsSavingBySiteId((prev) => ({ ...prev, [siteId]: false }));
      return;
    }

    setSiteExpandedItems({});

    setNavigationDraftBySiteId((prev) => {
      const next = { ...prev };
      delete next[siteId];
      return next;
    });
    setSaveStatusBySiteId((prev) => ({ ...prev, [siteId]: "Navigation saved." }));
    setIsSavingBySiteId((prev) => ({ ...prev, [siteId]: false }));
  };

  useEffect(() => {
    if (!siteId || !saveStatus) return undefined;
    const timeoutId = setTimeout(() => {
      setSaveStatusBySiteId((prev) => ({ ...prev, [siteId]: "" }));
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, [saveStatus, siteId]);

  useEffect(() => {
    if (!siteId || !headerSaveStatus) return undefined;
    const timeoutId = setTimeout(() => {
      setHeaderSaveStatusBySiteId((prev) => ({ ...prev, [siteId]: "" }));
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, [headerSaveStatus, siteId]);

  if (!selectedSite) {
    return (
      <section id="navigation-panel" className={styles.panel}>
        <h2 className={styles.panelTitle}>Navigation</h2>
        <p className={styles.status}>Select a site to manage navigation.</p>
      </section>
    );
  }

  return (
    <section id="navigation-panel" className={styles.navigationPanelLayout}>
      <section className={`${styles.panel} ${styles.navigationColumn}`.trim()}>
          <div className={styles.navigationHeader}>
            <h2 className={styles.panelTitle}>Header</h2>
            <div className={styles.row}>
              <Button size="sm" variant="secondary" onClick={handleCreateHeaderPreset} disabled={isSavingHeader}>
                Add header
              </Button>
              <Button size="sm" variant="secondary" onClick={handleResetHeader} disabled={!hasUnsavedHeaderChanges || isSavingHeader}>
                Discard
              </Button>
              <Button size="sm" onClick={handleSaveHeader} disabled={!hasUnsavedHeaderChanges || isSavingHeader}>
                {isSavingHeader ? "Saving..." : "Save header"}
              </Button>
            </div>
          </div>

          {headerSaveStatus ? <p className={styles.status}>{headerSaveStatus}</p> : null}

          <div className={styles.navigationFieldsGrid}>
            <label className={styles.label}>
              Selected header
              <select
                className={styles.input}
                value={selectedHeaderId}
                onChange={(event) => handleSelectHeaderPreset(event.target.value)}
                disabled={isSavingHeader}
              >
                {sourceHeaders.map((preset) => (
                  <option key={`header-preset-${preset.id}`} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.label}>
              Title
              <input
                className={styles.input}
                type="text"
                value={headerNameDraft}
                onChange={(event) => {
                  if (!headerDraftKey) return;
                  setHeaderNameDraftByKey((prev) => ({
                    ...prev,
                    [headerDraftKey]: event.target.value,
                  }));
                }}
                placeholder="Default header"
                disabled={isSavingHeader}
              />
            </label>

            <label className={styles.label}>
              Variant
              <select
                className={styles.input}
                value={headerDraft.variant}
                onChange={(event) => setSiteHeaderDraft({ variant: event.target.value })}
                disabled={isSavingHeader}
              >
                <option value="simple">Simple</option>
                <option value="minimal">Minimal</option>
              </select>
            </label>

            <label className={styles.label}>
              Logo image URL
              <input
                className={styles.input}
                type="url"
                value={headerDraft.logoUrl}
                onChange={(event) => setSiteHeaderDraft({ logoUrl: event.target.value, logoAssetId: "" })}
                placeholder="https://..."
                disabled={isSavingHeader}
              />
              <span className={styles.helpText}>Optional. If empty, your site name is shown instead.</span>
              <div className={styles.row}>
                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  onClick={() => setIsLogoPickerOpen(true)}
                  disabled={!siteId || isSavingHeader}
                >
                  Choose from media library
                </Button>
              </div>
            </label>

            <label className={styles.label}>
              Logo alt text
              <input
                className={styles.input}
                type="text"
                value={headerDraft.logoAlt}
                onChange={(event) => setSiteHeaderDraft({ logoAlt: event.target.value })}
                placeholder="Brand logo"
                disabled={isSavingHeader}
              />
            </label>

            <label className={styles.label}>
              Overlay mode
              <select
                className={styles.input}
                value={headerDraft.overlayMode}
                onChange={(event) => setSiteHeaderDraft({ overlayMode: event.target.value })}
                disabled={isSavingHeader}
              >
                <option value="off">Off</option>
                <option value="auto">Auto</option>
              </select>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={Boolean(headerDraft.sticky)}
                onChange={(event) => setSiteHeaderDraft({ sticky: event.target.checked })}
                disabled={isSavingHeader}
              />
              Sticky header
            </label>

            {showPrimaryAction ? (
              <article className={styles.navigationRow}>
                <div className={styles.navigationRowHeader}>
                  <button
                    type="button"
                    className={styles.navigationRowTitleButton}
                    onClick={() => setHeaderCtaExpanded({ primaryAction: !primaryActionExpanded })}
                    aria-expanded={primaryActionExpanded}
                    aria-label={primaryActionExpanded ? "Collapse primary CTA" : "Expand primary CTA"}
                    disabled={isSavingHeader}
                  >
                    <div className={styles.navigationItemTitleGroup}>
                      <p className={styles.navigationItemTitle}>Primary CTA</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={styles.navigationRowCollapseButton}
                    onClick={() => setHeaderCtaExpanded({ primaryAction: !primaryActionExpanded })}
                    aria-expanded={primaryActionExpanded}
                    aria-label={primaryActionExpanded ? "Collapse primary CTA" : "Expand primary CTA"}
                    disabled={isSavingHeader}
                  >
                    <Icon name={primaryActionExpanded ? "chevronUp" : "chevronDown"} size="1rem" />
                  </button>
                </div>

                {primaryActionExpanded ? (
                  <>
                    <label className={styles.label}>
                      Primary CTA label
                      <input
                        className={styles.input}
                        type="text"
                        value={headerDraft.primaryActionLabel}
                        onChange={(event) => setSiteHeaderDraft({ primaryActionLabel: event.target.value })}
                        placeholder="Start project"
                        disabled={isSavingHeader}
                      />
                    </label>

                    <label className={styles.label}>
                      Primary CTA href
                      <input
                        className={styles.input}
                        type="text"
                        value={headerDraft.primaryActionHref}
                        onChange={(event) => setSiteHeaderDraft({ primaryActionHref: event.target.value })}
                        placeholder="/contact"
                        disabled={isSavingHeader}
                      />
                    </label>

                    <div className={styles.row}>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSiteHeaderDraft({ primaryActionLabel: "", primaryActionHref: "" });
                          setHeaderCtaVisibility({ primaryAction: false });
                        }}
                        disabled={isSavingHeader}
                      >
                        Remove primary CTA
                      </Button>
                    </div>
                  </>
                ) : null}
              </article>
            ) : (
              <div className={styles.row}>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setHeaderCtaVisibility({ primaryAction: true });
                    setHeaderCtaExpanded({ primaryAction: true });
                  }}
                  disabled={isSavingHeader}
                >
                  Add primary CTA
                </Button>
              </div>
            )}

            {showSecondaryAction ? (
              <article className={styles.navigationRow}>
                <div className={styles.navigationRowHeader}>
                  <button
                    type="button"
                    className={styles.navigationRowTitleButton}
                    onClick={() => setHeaderCtaExpanded({ secondaryAction: !secondaryActionExpanded })}
                    aria-expanded={secondaryActionExpanded}
                    aria-label={secondaryActionExpanded ? "Collapse secondary CTA" : "Expand secondary CTA"}
                    disabled={isSavingHeader}
                  >
                    <div className={styles.navigationItemTitleGroup}>
                      <p className={styles.navigationItemTitle}>Secondary CTA</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={styles.navigationRowCollapseButton}
                    onClick={() => setHeaderCtaExpanded({ secondaryAction: !secondaryActionExpanded })}
                    aria-expanded={secondaryActionExpanded}
                    aria-label={secondaryActionExpanded ? "Collapse secondary CTA" : "Expand secondary CTA"}
                    disabled={isSavingHeader}
                  >
                    <Icon name={secondaryActionExpanded ? "chevronUp" : "chevronDown"} size="1rem" />
                  </button>
                </div>

                {secondaryActionExpanded ? (
                  <>
                    <label className={styles.label}>
                      Secondary CTA label
                      <input
                        className={styles.input}
                        type="text"
                        value={headerDraft.secondaryActionLabel}
                        onChange={(event) => setSiteHeaderDraft({ secondaryActionLabel: event.target.value })}
                        placeholder="Learn more"
                        disabled={isSavingHeader}
                      />
                    </label>

                    <label className={styles.label}>
                      Secondary CTA href
                      <input
                        className={styles.input}
                        type="text"
                        value={headerDraft.secondaryActionHref}
                        onChange={(event) => setSiteHeaderDraft({ secondaryActionHref: event.target.value })}
                        placeholder="/about"
                        disabled={isSavingHeader}
                      />
                    </label>

                    <div className={styles.row}>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSiteHeaderDraft({ secondaryActionLabel: "", secondaryActionHref: "" });
                          setHeaderCtaVisibility({ secondaryAction: false });
                        }}
                        disabled={isSavingHeader}
                      >
                        Remove secondary CTA
                      </Button>
                    </div>
                  </>
                ) : null}
              </article>
            ) : (
              <div className={styles.row}>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setHeaderCtaVisibility({ secondaryAction: true });
                    setHeaderCtaExpanded({ secondaryAction: true });
                  }}
                  disabled={isSavingHeader}
                >
                  Add secondary CTA
                </Button>
              </div>
            )}
          </div>
      </section>

      <section className={`${styles.panel} ${styles.navigationColumn}`.trim()}>
          <div className={styles.navigationHeader}>
            <h2 className={styles.panelTitle}>Navigation</h2>
          </div>

          {saveStatus ? <p className={styles.status}>{saveStatus}</p> : null}
          {draftItems.length === 0 ? <p className={styles.status}>No navigation items yet. Add your first menu item.</p> : null}

          {draftItems.length > 0 ? (
            <div className={styles.navigationList}>
              {draftItems.map((item, index) => (
                <Fragment key={`nav-item-group-${item.id}`}>
                  <article className={styles.navigationRow}>
                    <div className={styles.navigationRowHeader}>
                      <button
                        type="button"
                        className={styles.navigationRowTitleButton}
                        onClick={() => handleToggleItem(item.id)}
                        aria-expanded={isItemExpanded(item)}
                        aria-label={isItemExpanded(item) ? "Collapse navigation item" : "Expand navigation item"}
                        disabled={isSaving}
                      >
                        <div className={styles.navigationItemTitleGroup}>
                          <p className={styles.navigationItemTitle}>{item.label?.trim() || `Item ${index + 1}`}</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        className={styles.navigationRowCollapseButton}
                        onClick={() => handleToggleItem(item.id)}
                        aria-expanded={isItemExpanded(item)}
                        aria-label={isItemExpanded(item) ? "Collapse navigation item" : "Expand navigation item"}
                        disabled={isSaving}
                      >
                        <Icon name={isItemExpanded(item) ? "chevronUp" : "chevronDown"} size="1rem" />
                      </button>
                    </div>

                    {isItemExpanded(item) ? (
                      <>
                        <div className={styles.navigationFieldsGrid}>
                          <label className={styles.label}>
                            Parent item
                            <select
                              className={styles.input}
                              value=""
                              onChange={(event) => handleReparentItem(item.id, event.target.value)}
                              disabled={isSaving || (item.children || []).length > 0}
                            >
                              <option value="">No parent (top-level)</option>
                              {getParentOptions(item.id).map((option) => (
                                <option key={`nav-parent-option-${item.id}-${option.id}`} value={option.id}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className={styles.label}>
                            Label
                            <input
                              className={styles.input}
                              type="text"
                              value={item.label || ""}
                              onChange={(event) => handleUpdateItem(item.id, { label: event.target.value })}
                              placeholder="About"
                              disabled={isSaving}
                            />
                          </label>

                          <label className={styles.label}>
                            Link type
                            <select
                              className={styles.input}
                              value={item.type || "page"}
                              onChange={(event) => handleUpdateItem(item.id, { type: event.target.value })}
                              disabled={isSaving}
                            >
                              <option value="page">Page</option>
                              <option value="url">Custom URL</option>
                            </select>
                          </label>

                          {item.type === "page" ? (
                            <label className={styles.label}>
                              Page target
                              <select
                                className={styles.input}
                                value={item.pageId || ""}
                                onChange={(event) => handleUpdateItem(item.id, { pageId: event.target.value })}
                                disabled={isSaving}
                              >
                                <option value="">Select page</option>
                                {selectedSitePages.map((page) => (
                                  <option key={`nav-page-${page.id}`} value={page.id}>
                                    {page.title}
                                  </option>
                                ))}
                              </select>
                            </label>
                          ) : (
                            <label className={styles.label}>
                              URL
                              <input
                                className={styles.input}
                                type="text"
                                value={item.href || ""}
                                onChange={(event) => handleUpdateItem(item.id, { href: event.target.value })}
                                placeholder="https://example.com"
                                disabled={isSaving}
                              />
                            </label>
                          )}

                          <label className={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              checked={Boolean(item.visible)}
                              onChange={(event) => handleUpdateItem(item.id, { visible: event.target.checked })}
                              disabled={isSaving}
                            />
                            Visible
                          </label>

                          <label className={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              checked={Boolean(item.openInNewTab)}
                              onChange={(event) => handleUpdateItem(item.id, { openInNewTab: event.target.checked })}
                              disabled={isSaving}
                            />
                            Open in new tab
                          </label>

                        </div>

                        <div className={styles.navigationRowActionsFooter}>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleMoveItem(item.id, "up")}
                            disabled={index === 0 || isSaving}
                          >
                            Up
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleMoveItem(item.id, "down")}
                            disabled={index === draftItems.length - 1 || isSaving}
                          >
                            Down
                          </Button>
                          <Button size="sm" variant="secondary" tone="danger" onClick={() => handleRemoveItem(item.id)} disabled={isSaving}>
                            Remove
                          </Button>
                        </div>
                      </>
                    ) : null}
                  </article>

                  {(item.children || []).map((child, childIndex) => (
                    <Fragment key={`nav-child-group-${item.id}-${child.id || childIndex}`}>
                      <article
                        className={`${styles.navigationRow} ${styles.navigationChildRow}`.trim()}
                      >
                        <div className={styles.navigationRowHeader}>
                          <button
                            type="button"
                            className={styles.navigationRowTitleButton}
                            onClick={() => handleToggleItem(child.id)}
                            aria-expanded={isItemExpanded(child)}
                            aria-label={isItemExpanded(child) ? "Collapse child navigation item" : "Expand child navigation item"}
                            disabled={isSaving}
                          >
                            <div className={styles.navigationItemTitleGroup}>
                              <p className={styles.navigationItemTitle}>{child.label?.trim() || `Child ${childIndex + 1}`}</p>
                            </div>
                          </button>
                          <button
                            type="button"
                            className={styles.navigationRowCollapseButton}
                            onClick={() => handleToggleItem(child.id)}
                            aria-expanded={isItemExpanded(child)}
                            aria-label={isItemExpanded(child) ? "Collapse child navigation item" : "Expand child navigation item"}
                            disabled={isSaving}
                          >
                            <Icon name={isItemExpanded(child) ? "chevronUp" : "chevronDown"} size="1rem" />
                          </button>
                        </div>

                        {isItemExpanded(child) ? (
                          <>
                            <div className={styles.navigationFieldsGrid}>
                              <label className={styles.label}>
                                Parent item
                                <select
                                  className={styles.input}
                                  value={item.id}
                                  onChange={(event) => handleReparentItem(child.id, event.target.value)}
                                  disabled={isSaving}
                                >
                                  <option value="">No parent (top-level)</option>
                                  {getParentOptions(child.id).map((option) => (
                                    <option key={`nav-parent-option-${child.id}-${option.id}`} value={option.id}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label className={styles.label}>
                                Label
                                <input
                                  className={styles.input}
                                  type="text"
                                  value={child.label || ""}
                                  onChange={(event) => {
                                    const nextChildren = (item.children || []).map((existingChild, existingChildIndex) =>
                                      existingChildIndex === childIndex ? { ...existingChild, label: event.target.value } : existingChild
                                    );
                                    handleUpdateItem(item.id, { children: normalizeItems(nextChildren) });
                                  }}
                                  disabled={isSaving}
                                />
                              </label>

                              <label className={styles.label}>
                                Link type
                                <select
                                  className={styles.input}
                                  value={child.type || "page"}
                                  onChange={(event) => {
                                    const nextChildren = (item.children || []).map((existingChild, existingChildIndex) =>
                                      existingChildIndex === childIndex
                                        ? {
                                          ...existingChild,
                                          type: event.target.value,
                                          href: event.target.value === "page" ? "" : existingChild.href,
                                          pageId: event.target.value === "url" ? "" : existingChild.pageId,
                                        }
                                        : existingChild
                                    );
                                    handleUpdateItem(item.id, { children: normalizeItems(nextChildren) });
                                  }}
                                  disabled={isSaving}
                                >
                                  <option value="page">Page</option>
                                  <option value="url">Custom URL</option>
                                </select>
                              </label>

                              {(child.type || "page") === "page" ? (
                                <label className={styles.label}>
                                  Page target
                                  <select
                                    className={styles.input}
                                    value={child.pageId || ""}
                                    onChange={(event) => {
                                      const nextChildren = (item.children || []).map((existingChild, existingChildIndex) =>
                                        existingChildIndex === childIndex ? { ...existingChild, pageId: event.target.value, href: "" } : existingChild
                                      );
                                      handleUpdateItem(item.id, { children: normalizeItems(nextChildren) });
                                    }}
                                    disabled={isSaving}
                                  >
                                    <option value="">Select page</option>
                                    {selectedSitePages.map((page) => (
                                      <option key={`nav-child-page-${page.id}`} value={page.id}>
                                        {page.title}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              ) : (
                                <label className={styles.label}>
                                  URL
                                  <input
                                    className={styles.input}
                                    type="text"
                                    value={child.href || ""}
                                    onChange={(event) => {
                                      const nextChildren = (item.children || []).map((existingChild, existingChildIndex) =>
                                        existingChildIndex === childIndex ? { ...existingChild, href: event.target.value, pageId: "" } : existingChild
                                      );
                                      handleUpdateItem(item.id, { children: normalizeItems(nextChildren) });
                                    }}
                                    disabled={isSaving}
                                  />
                                </label>
                              )}

                              <label className={styles.checkboxLabel}>
                                <input
                                  type="checkbox"
                                  checked={Boolean(child.visible)}
                                  onChange={(event) => {
                                    const nextChildren = (item.children || []).map((existingChild, existingChildIndex) =>
                                      existingChildIndex === childIndex ? { ...existingChild, visible: event.target.checked } : existingChild
                                    );
                                    handleUpdateItem(item.id, { children: normalizeItems(nextChildren) });
                                  }}
                                  disabled={isSaving}
                                />
                                Visible
                              </label>

                              <label className={styles.checkboxLabel}>
                                <input
                                  type="checkbox"
                                  checked={Boolean(child.openInNewTab)}
                                  onChange={(event) => {
                                    const nextChildren = (item.children || []).map((existingChild, existingChildIndex) =>
                                      existingChildIndex === childIndex ? { ...existingChild, openInNewTab: event.target.checked } : existingChild
                                    );
                                    handleUpdateItem(item.id, { children: normalizeItems(nextChildren) });
                                  }}
                                  disabled={isSaving}
                                />
                                Open in new tab
                              </label>
                            </div>

                            <div className={styles.navigationRowActionsFooter}>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  const children = item.children || [];
                                  const fromIndex = childIndex;
                                  const toIndex = childIndex - 1;
                                  if (toIndex < 0) return;
                                  const nextChildren = [...children];
                                  const [moved] = nextChildren.splice(fromIndex, 1);
                                  nextChildren.splice(toIndex, 0, moved);
                                  handleUpdateItem(item.id, { children: normalizeItems(nextChildren) });
                                }}
                                disabled={isSaving || childIndex === 0}
                              >
                                Up
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  const children = item.children || [];
                                  const fromIndex = childIndex;
                                  const toIndex = childIndex + 1;
                                  if (toIndex >= children.length) return;
                                  const nextChildren = [...children];
                                  const [moved] = nextChildren.splice(fromIndex, 1);
                                  nextChildren.splice(toIndex, 0, moved);
                                  handleUpdateItem(item.id, { children: normalizeItems(nextChildren) });
                                }}
                                disabled={isSaving || childIndex === (item.children || []).length - 1}
                              >
                                Down
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                tone="danger"
                                onClick={() => {
                                  const nextChildren = (item.children || []).filter((_, existingChildIndex) => existingChildIndex !== childIndex);
                                  handleUpdateItem(item.id, { children: normalizeItems(nextChildren) });
                                }}
                                disabled={isSaving}
                              >
                                Remove
                              </Button>
                            </div>
                          </>
                        ) : null}
                      </article>

                      {(child.children || []).map((grandchild, grandchildIndex) => (
                        <article
                          key={`nav-grandchild-${item.id}-${child.id || childIndex}-${grandchild.id || grandchildIndex}`}
                          className={`${styles.navigationRow} ${styles.navigationGrandchildRow}`.trim()}
                        >
                          <div className={styles.navigationRowHeader}>
                            <button
                              type="button"
                              className={styles.navigationRowTitleButton}
                              onClick={() => handleToggleItem(grandchild.id)}
                              aria-expanded={isItemExpanded(grandchild)}
                              aria-label={isItemExpanded(grandchild) ? "Collapse grandchild navigation item" : "Expand grandchild navigation item"}
                              disabled={isSaving}
                            >
                              <div className={styles.navigationItemTitleGroup}>
                                <p className={styles.navigationItemTitle}>{grandchild.label?.trim() || `Grandchild ${grandchildIndex + 1}`}</p>
                              </div>
                            </button>
                            <button
                              type="button"
                              className={styles.navigationRowCollapseButton}
                              onClick={() => handleToggleItem(grandchild.id)}
                              aria-expanded={isItemExpanded(grandchild)}
                              aria-label={isItemExpanded(grandchild) ? "Collapse grandchild navigation item" : "Expand grandchild navigation item"}
                              disabled={isSaving}
                            >
                              <Icon name={isItemExpanded(grandchild) ? "chevronUp" : "chevronDown"} size="1rem" />
                            </button>
                          </div>

                          {isItemExpanded(grandchild) ? (
                            <>
                              <div className={styles.navigationFieldsGrid}>
                                <label className={styles.label}>
                                  Parent item
                                  <select
                                    className={styles.input}
                                    value={child.id}
                                    onChange={(event) => handleReparentItem(grandchild.id, event.target.value)}
                                    disabled={isSaving}
                                  >
                                    <option value="">No parent (top-level)</option>
                                    {getParentOptions(grandchild.id).map((option) => (
                                      <option key={`nav-parent-option-${grandchild.id}-${option.id}`} value={option.id}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </label>

                                <label className={styles.label}>
                                  Label
                                  <input
                                    className={styles.input}
                                    type="text"
                                    value={grandchild.label || ""}
                                    onChange={(event) => {
                                      const nextChildren = (item.children || []).map((existingChild, existingChildIndex) => {
                                        if (existingChildIndex !== childIndex) return existingChild;
                                        return {
                                          ...existingChild,
                                          children: normalizeItems((existingChild.children || []).map((existingGrandchild, existingGrandchildIndex) =>
                                            existingGrandchildIndex === grandchildIndex
                                              ? { ...existingGrandchild, label: event.target.value }
                                              : existingGrandchild
                                          )),
                                        };
                                      });
                                      handleUpdateItem(item.id, { children: normalizeItems(nextChildren) });
                                    }}
                                    disabled={isSaving}
                                  />
                                </label>

                                <label className={styles.label}>
                                  Link type
                                  <select
                                    className={styles.input}
                                    value={grandchild.type || "page"}
                                    onChange={(event) => {
                                      const nextChildren = (item.children || []).map((existingChild, existingChildIndex) => {
                                        if (existingChildIndex !== childIndex) return existingChild;
                                        return {
                                          ...existingChild,
                                          children: normalizeItems((existingChild.children || []).map((existingGrandchild, existingGrandchildIndex) =>
                                            existingGrandchildIndex === grandchildIndex
                                              ? {
                                                ...existingGrandchild,
                                                type: event.target.value,
                                                href: event.target.value === "page" ? "" : existingGrandchild.href,
                                                pageId: event.target.value === "url" ? "" : existingGrandchild.pageId,
                                              }
                                              : existingGrandchild
                                          )),
                                        };
                                      });
                                      handleUpdateItem(item.id, { children: normalizeItems(nextChildren) });
                                    }}
                                    disabled={isSaving}
                                  >
                                    <option value="page">Page</option>
                                    <option value="url">Custom URL</option>
                                  </select>
                                </label>

                                {(grandchild.type || "page") === "page" ? (
                                  <label className={styles.label}>
                                    Page target
                                    <select
                                      className={styles.input}
                                      value={grandchild.pageId || ""}
                                      onChange={(event) => {
                                        const nextChildren = (item.children || []).map((existingChild, existingChildIndex) => {
                                          if (existingChildIndex !== childIndex) return existingChild;
                                          return {
                                            ...existingChild,
                                            children: normalizeItems((existingChild.children || []).map((existingGrandchild, existingGrandchildIndex) =>
                                              existingGrandchildIndex === grandchildIndex
                                                ? { ...existingGrandchild, pageId: event.target.value, href: "" }
                                                : existingGrandchild
                                            )),
                                          };
                                        });
                                        handleUpdateItem(item.id, { children: normalizeItems(nextChildren) });
                                      }}
                                      disabled={isSaving}
                                    >
                                      <option value="">Select page</option>
                                      {selectedSitePages.map((page) => (
                                        <option key={`nav-grandchild-page-${page.id}`} value={page.id}>
                                          {page.title}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                ) : (
                                  <label className={styles.label}>
                                    URL
                                    <input
                                      className={styles.input}
                                      type="text"
                                      value={grandchild.href || ""}
                                      onChange={(event) => {
                                        const nextChildren = (item.children || []).map((existingChild, existingChildIndex) => {
                                          if (existingChildIndex !== childIndex) return existingChild;
                                          return {
                                            ...existingChild,
                                            children: normalizeItems((existingChild.children || []).map((existingGrandchild, existingGrandchildIndex) =>
                                              existingGrandchildIndex === grandchildIndex
                                                ? { ...existingGrandchild, href: event.target.value, pageId: "" }
                                                : existingGrandchild
                                            )),
                                          };
                                        });
                                        handleUpdateItem(item.id, { children: normalizeItems(nextChildren) });
                                      }}
                                      disabled={isSaving}
                                    />
                                  </label>
                                )}
                              </div>

                              <div className={styles.navigationRowActionsFooter}>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    const grandChildren = child.children || [];
                                    const fromIndex = grandchildIndex;
                                    const toIndex = grandchildIndex - 1;
                                    if (toIndex < 0) return;
                                    const nextGrandChildren = [...grandChildren];
                                    const [moved] = nextGrandChildren.splice(fromIndex, 1);
                                    nextGrandChildren.splice(toIndex, 0, moved);
                                    const nextChildren = (item.children || []).map((existingChild, existingChildIndex) =>
                                      existingChildIndex === childIndex
                                        ? { ...existingChild, children: normalizeItems(nextGrandChildren) }
                                        : existingChild
                                    );
                                    handleUpdateItem(item.id, { children: normalizeItems(nextChildren) });
                                  }}
                                  disabled={isSaving || grandchildIndex === 0}
                                >
                                  Up
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    const grandChildren = child.children || [];
                                    const fromIndex = grandchildIndex;
                                    const toIndex = grandchildIndex + 1;
                                    if (toIndex >= grandChildren.length) return;
                                    const nextGrandChildren = [...grandChildren];
                                    const [moved] = nextGrandChildren.splice(fromIndex, 1);
                                    nextGrandChildren.splice(toIndex, 0, moved);
                                    const nextChildren = (item.children || []).map((existingChild, existingChildIndex) =>
                                      existingChildIndex === childIndex
                                        ? { ...existingChild, children: normalizeItems(nextGrandChildren) }
                                        : existingChild
                                    );
                                    handleUpdateItem(item.id, { children: normalizeItems(nextChildren) });
                                  }}
                                  disabled={isSaving || grandchildIndex === (child.children || []).length - 1}
                                >
                                  Down
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  tone="danger"
                                  onClick={() => {
                                    const nextChildren = (item.children || []).map((existingChild, existingChildIndex) => {
                                      if (existingChildIndex !== childIndex) return existingChild;
                                      return {
                                        ...existingChild,
                                        children: normalizeItems((existingChild.children || []).filter((_, existingGrandchildIndex) => existingGrandchildIndex !== grandchildIndex)),
                                      };
                                    });
                                    handleUpdateItem(item.id, { children: normalizeItems(nextChildren) });
                                  }}
                                  disabled={isSaving}
                                >
                                  Remove
                                </Button>
                              </div>
                            </>
                          ) : null}
                        </article>
                      ))}
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </div>
          ) : null}

          <div className={styles.row}>
            <Button size="sm" variant="secondary" onClick={handleGenerateFromPages} disabled={!selectedSitePages?.length || isSaving}>
              Generate from pages
            </Button>
            <Button size="sm" variant="secondary" onClick={handleAddItem}>
              Add item
            </Button>
            <Button size="sm" variant="secondary" onClick={handleReset} disabled={!hasUnsavedChanges || isSaving}>
              Discard
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!hasUnsavedChanges || isSaving}>
              {isSaving ? "Saving..." : "Save navigation"}
            </Button>
          </div>
      </section>

      <section className={`${styles.panel} ${styles.navigationPreviewSection}`.trim()}>
        <div className={styles.headerPreviewMeta}>
          <p className={styles.helpText}>Header preview</p>
          <div className={styles.headerPreviewMetaBadges}>
            <span className={styles.headerPreviewBadge}>{headerDraft.variant}</span>
            <span className={styles.headerPreviewBadge}>{headerDraft.overlayMode === "auto" ? "overlay" : "solid"}</span>
            <span className={styles.headerPreviewBadge}>{headerDraft.sticky ? "sticky" : "static"}</span>
          </div>
        </div>

        <div className={styles.headerPreviewCanvas}>
          <div className={styles.headerPreviewHeroGlow} aria-hidden="true" />
          <div className={styles.headerPreviewRuntimeShell}>
            <LiveRuntimeHeader
              siteName={selectedSite.name || "Brand"}
              siteRootHref="#"
              headerConfig={buildHeaderPayload(headerDraft)}
              navigationItems={previewNavItems}
              previewMode={true}
            />
          </div>
          {previewNavItems.length === 0 ? <p className={styles.headerPreviewHint}>Add visible navigation items to preview menu links.</p> : null}
        </div>
      </section>
      <MediaPicker
        styles={styles}
        isOpen={isLogoPickerOpen}
        title="Choose logo image"
        workspaceId={selectedSite?.workspaceId || ""}
        siteId={siteId}
        onClose={() => setIsLogoPickerOpen(false)}
        onSelect={(asset) => {
          setSiteHeaderDraft({
            logoUrl: asset?.url || "",
            logoAlt: asset?.alt || "",
            logoAssetId: asset?.id || "",
          });
          setIsLogoPickerOpen(false);
        }}
      />
    </section>
  );
}
