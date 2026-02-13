"use client";

import { useSyncExternalStore } from "react";
import { useThemeContext } from "../../../hooks";
import styles from "./theme-toggle.module.css";

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function ThemeToggle() {
  const {
    state: { theme },
    actions: { toggleTheme },
  } = useThemeContext();
  const isHydrated = useHydrated();
  const showDarkThemeIcon = isHydrated && theme === "dark";
  const ariaLabel = isHydrated
    ? theme === "dark"
      ? "Switch to light theme"
      : "Switch to dark theme"
    : "Toggle theme";

  return (
    <button
      type="button"
      className={styles.button}
      onClick={toggleTheme}
      aria-label={ariaLabel}
    >
      {showDarkThemeIcon ? (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
          <path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-16a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 17a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm10-8a1 1 0 0 1 0 2h-2a1 1 0 1 1 0-2h2ZM5 12a1 1 0 0 1 0 2H3a1 1 0 1 1 0-2h2Zm13.364-6.95a1 1 0 0 1 1.414 1.414l-1.414 1.414a1 1 0 0 1-1.414-1.415l1.414-1.414ZM7.05 16.95a1 1 0 0 1 1.414 1.415L7.05 19.778a1 1 0 0 1-1.414-1.414l1.414-1.414Zm12.728 1.414a1 1 0 0 1-1.414 1.414l-1.414-1.414a1 1 0 0 1 1.414-1.415l1.414 1.415ZM8.464 7.05A1 1 0 0 1 7.05 8.464L5.636 7.05A1 1 0 0 1 7.05 5.636l1.414 1.414Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
          <path d="M21 14.5A9 9 0 1 1 9.5 3a1 1 0 0 1 1.17 1.35 7 7 0 0 0 8.98 8.98A1 1 0 0 1 21 14.5Z" />
        </svg>
      )}
    </button>
  );
}
