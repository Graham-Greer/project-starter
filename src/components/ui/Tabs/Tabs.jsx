"use client";

import { useMemo, useRef, useState } from "react";
import styles from "./tabs.module.css";

function getInitialTab(items, candidate) {
  const firstEnabled = items.find((item) => !item.disabled)?.id || null;
  if (!candidate) return firstEnabled;
  const isValid = items.some((item) => item.id === candidate && !item.disabled);
  return isValid ? candidate : firstEnabled;
}

export default function Tabs({
  items = [],
  value,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  className = "",
  ...props
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() => getInitialTab(items, defaultValue));
  const tabsRef = useRef({});
  const currentValue = getInitialTab(items, isControlled ? value : internalValue);

  const enabledItems = useMemo(() => items.filter((item) => !item.disabled), [items]);

  const setValue = (nextValue) => {
    if (!isControlled) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  const moveFocus = (currentId, direction) => {
    if (enabledItems.length === 0) return;
    const index = enabledItems.findIndex((item) => item.id === currentId);
    if (index === -1) return;

    let nextIndex = index + direction;
    if (nextIndex < 0) nextIndex = enabledItems.length - 1;
    if (nextIndex >= enabledItems.length) nextIndex = 0;

    const nextId = enabledItems[nextIndex].id;
    setValue(nextId);
    tabsRef.current[nextId]?.focus();
  };

  const tabsClassName = [
    styles.tabs,
    orientation === "vertical" ? styles.vertical : styles.horizontal,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={tabsClassName} {...props}>
      <div className={styles.tabList} role="tablist" aria-orientation={orientation}>
        {items.map((item) => {
          const isSelected = currentValue === item.id;
          const tabId = `tab-${item.id}`;
          const panelId = `panel-${item.id}`;

          return (
            <button
              key={item.id}
              id={tabId}
              ref={(node) => {
                tabsRef.current[item.id] = node;
              }}
              type="button"
              role="tab"
              className={`${styles.tab} ${isSelected ? styles.tabActive : ""}`}
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => setValue(item.id)}
              onKeyDown={(event) => {
                if (orientation === "horizontal") {
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    moveFocus(item.id, 1);
                  }
                  if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    moveFocus(item.id, -1);
                  }
                } else {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    moveFocus(item.id, 1);
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    moveFocus(item.id, -1);
                  }
                }
                if (event.key === "Home") {
                  event.preventDefault();
                  const first = enabledItems[0]?.id;
                  if (first) {
                    setValue(first);
                    tabsRef.current[first]?.focus();
                  }
                }
                if (event.key === "End") {
                  event.preventDefault();
                  const last = enabledItems[enabledItems.length - 1]?.id;
                  if (last) {
                    setValue(last);
                    tabsRef.current[last]?.focus();
                  }
                }
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item) => {
        const isSelected = currentValue === item.id;
        return (
          <div
            key={item.id}
            id={`panel-${item.id}`}
            role="tabpanel"
            className={styles.panel}
            aria-labelledby={`tab-${item.id}`}
            hidden={!isSelected}
          >
            {item.content}
          </div>
        );
      })}
    </div>
  );
}
