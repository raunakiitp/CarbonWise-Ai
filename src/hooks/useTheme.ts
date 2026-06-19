"use client";

import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

/**
 * Hook for dark/light mode with system preference detection and persistence
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = localStorage.getItem("cw-theme") as Theme | null;
      if (stored) {
        setThemeState(stored);
        document.documentElement.setAttribute("data-theme", stored);
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initial: Theme = prefersDark ? "dark" : "light";
        setThemeState(initial);
        document.documentElement.setAttribute("data-theme", initial);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("cw-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme, isDark: theme === "dark" };
}
