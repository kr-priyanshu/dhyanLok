"use client";

import { useLayoutEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";

export default function ThemeClient() {
  const { bgColor, textColor, headingFont, accentColor } = useThemeStore();

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-bg', bgColor);
    root.style.setProperty('--theme-text', textColor);
    root.style.setProperty('--theme-heading-font', headingFont);
    root.style.setProperty('--theme-accent', accentColor || textColor);
  }, [bgColor, textColor, headingFont, accentColor]);

  return null;
}
