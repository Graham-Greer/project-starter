"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const THEME_STORAGE_KEY = "theme-preference";

export const ThemeContext = createContext(undefined);

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setDomTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function clearDomTheme() {
  delete document.documentElement.dataset.theme;
}

function getStoredThemePreference() {
  if (typeof window === "undefined") return null;
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === "light" || storedTheme === "dark" ? storedTheme : null;
}

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  return getStoredThemePreference() || getSystemTheme();
}

export function ThemeProvider({ children }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState(getInitialTheme);
  const [isMounted] = useState(true);
  const isCmsPreviewRoute = pathname?.startsWith("/cms/preview/");

  const setThemePreference = useCallback((nextTheme) => {
    setDomTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  }, []);

  const clearThemePreference = useCallback(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    clearDomTheme();
    setTheme(getSystemTheme());
  }, []);

  const toggleTheme = useCallback(() => {
    setThemePreference(theme === "dark" ? "light" : "dark");
  }, [theme, setThemePreference]);

  useEffect(() => {
    const forcedPreviewTheme = (() => {
      if (!isCmsPreviewRoute || typeof window === "undefined") return null;
      const params = new URLSearchParams(window.location.search);
      return params.get("theme") === "dark" ? "dark" : "light";
    })();

    if (forcedPreviewTheme) {
      setDomTheme(forcedPreviewTheme);
      return undefined;
    }

    const storedTheme = getStoredThemePreference();
    if (storedTheme) {
      setDomTheme(storedTheme);
      return undefined;
    }

    clearDomTheme();
    setDomTheme(theme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      setTheme(getSystemTheme());
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, [isCmsPreviewRoute, theme]);

  const value = useMemo(
    () => ({
      state: {
        theme,
        isMounted,
      },
      actions: {
        setThemePreference,
        clearThemePreference,
        toggleTheme,
      },
    }),
    [theme, isMounted, setThemePreference, clearThemePreference, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
