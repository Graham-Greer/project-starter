"use client";

import { ThemeProvider } from "../ThemeContext";

export default function AppProviders({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
