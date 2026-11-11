"use client";

import * as React from "react";

export type Theme = "light" | "dark" | "system";

export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = "coffee_theme";

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getThemeSnapshot(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {
    // Storage unavailable
  }
  return "system";
}

function getServerThemeSnapshot(): Theme {
  return "system";
}

function subscribeMedia(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getMediaSnapshot(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getServerMediaSnapshot(): boolean {
  return false;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  const systemDark = React.useSyncExternalStore(subscribeMedia, getMediaSnapshot, getServerMediaSnapshot);

  const resolvedTheme: "light" | "dark" = theme === "dark" || (theme === "system" && systemDark) ? "dark" : "light";

  // Synchronize document class
  React.useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolvedTheme]);

  const setTheme = React.useCallback((next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Storage unavailable
    }
  }, []);

  const value = React.useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
