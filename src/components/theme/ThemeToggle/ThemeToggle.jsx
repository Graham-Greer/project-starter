"use client";

import { useSyncExternalStore } from "react";
import { useThemeContext } from "../../../hooks";
import { Icon } from "../../primitives";
import { Button } from "../../ui";
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
    <Button
      type="button"
      className={styles.button}
      variant="secondary"
      size="md"
      iconOnly
      onClick={toggleTheme}
      aria-label={ariaLabel}
      title={ariaLabel}
      iconLeft={<Icon name={showDarkThemeIcon ? "sun" : "moon"} className={styles.icon} decorative={true} />}
    />
  );
}
