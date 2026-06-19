"use client";

import { createContext, useContext, ReactNode } from "react";
import { useTheme as useThemeHook } from "@/hooks/useTheme";

interface ThemeContextValue {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useThemeHook();
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}
