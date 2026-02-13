"use client";

import { useEffect, useId } from "react";
import Button from "@/components/ui/Button";
import styles from "./confirmation-modal.module.css";

export default function ConfirmationModal({
  isOpen = false,
  title = "Please confirm",
  description = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmTone = "danger",
  confirmVariant = "primary",
  confirmLoading = false,
  onConfirm,
  onCancel,
  children,
}) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onCancel?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="presentation" onClick={onCancel}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          ) : null}
        </header>

        {children ? <div className={styles.content}>{children}</div> : null}

        <footer className={styles.actions}>
          <Button autoFocus size="sm" variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button size="sm" variant={confirmVariant} tone={confirmTone} loading={confirmLoading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </footer>
      </div>
    </div>
  );
}
