"use client";

import { useMemo, useState } from "react";
import { Icon } from "../../primitives";
import styles from "./accordion.module.css";

function normalizeInitialValue(type, value) {
  if (type === "multiple") {
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  }
  return Array.isArray(value) ? value[0] || null : value || null;
}

export default function Accordion({
  items = [],
  type = "single",
  value,
  defaultValue,
  onValueChange,
  collapsible = true,
  className = "",
  ...props
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() =>
    normalizeInitialValue(type, defaultValue),
  );

  const currentValue = normalizeInitialValue(type, isControlled ? value : internalValue);

  const valueSet = useMemo(() => {
    if (type === "multiple") {
      return new Set(currentValue);
    }
    return new Set(currentValue ? [currentValue] : []);
  }, [currentValue, type]);

  const setValue = (nextValue) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  const toggleItem = (itemId) => {
    if (type === "multiple") {
      const next = new Set(currentValue);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      setValue(Array.from(next));
      return;
    }

    if (currentValue === itemId) {
      if (collapsible) setValue(null);
      return;
    }

    setValue(itemId);
  };

  return (
    <div className={`${styles.accordion} ${className}`.trim()} {...props}>
      {items.map((item, index) => {
        const itemId = item.id || `accordion-item-${index}`;
        const triggerId = `${itemId}-trigger`;
        const panelId = `${itemId}-panel`;
        const isOpen = valueSet.has(itemId);

        return (
          <div key={itemId} className={styles.item}>
            <h3 className={styles.heading}>
              <button
                id={triggerId}
                type="button"
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                disabled={item.disabled}
                onClick={() => toggleItem(itemId)}
              >
                <span>{item.title}</span>
                <Icon
                  name="chevronDown"
                  className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                  decorative={true}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!isOpen}
              inert={!isOpen ? true : undefined}
              className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
            >
              <div className={styles.panelInner}>{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
