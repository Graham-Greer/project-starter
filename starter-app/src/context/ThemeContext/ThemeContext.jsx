"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";

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

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [isMounted, setIsMounted] = useState(false);

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
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (storedTheme === "light" || storedTheme === "dark") {
      setDomTheme(storedTheme);
      setTheme(storedTheme);
      setIsMounted(true);
      return undefined;
    }

    clearDomTheme();
    setTheme(getSystemTheme());
    setIsMounted(true);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      setTheme(getSystemTheme());
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

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
    [theme, isMounted, setThemePreference, clearThemePreference, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
