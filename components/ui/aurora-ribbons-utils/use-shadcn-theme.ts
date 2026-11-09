"use client";

import { useEffect, useState } from "react";
import { Color } from "three";

export type ThemeMode = "auto" | "light" | "dark";

/*
 * Counter has no shadcn --primary/--accent tokens. The ribbons read three
 * optional aliases set in app/globals.css, which point at Counter's palette:
 *   --counter-aurora-primary -> --color-violet   (#6638D8)
 *   --counter-aurora-accent  -> --color-lavender (#F1EBFF)
 *   --counter-aurora-muted   -> --color-lavender (#F1EBFF)
 * Custom properties resolve var() before getComputedStyle returns them, so
 * Three.js receives plain hex. The fallbacks below are the same colors.
 */
const FALLBACK = { primary: "#6638d8", accent: "#f1ebff", muted: "#f1ebff" };

function readHexColor(styles: CSSStyleDeclaration, token: string, fallback: string) {
  const value = styles.getPropertyValue(token).trim();
  return new Color(/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : fallback);
}

export function useShadcnTheme(theme: ThemeMode) {
  const [palette, setPalette] = useState(() => ({
    primaryColor: new Color(FALLBACK.primary),
    accentColor: new Color(FALLBACK.accent),
    mutedColor: new Color(FALLBACK.muted),
    isDark: theme === "dark",
  }));

  useEffect(() => {
    const root = document.documentElement;

    function updatePalette() {
      const styles = getComputedStyle(root);
      const isDark =
        theme === "dark" ||
        (theme === "auto" && (root.classList.contains("dark") || root.dataset.theme === "dark"));

      setPalette({
        primaryColor: readHexColor(styles, "--counter-aurora-primary", FALLBACK.primary),
        accentColor: readHexColor(styles, "--counter-aurora-accent", FALLBACK.accent),
        mutedColor: readHexColor(styles, "--counter-aurora-muted", FALLBACK.muted),
        isDark,
      });
    }

    updatePalette();
    const observer = new MutationObserver(updatePalette);
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    return () => observer.disconnect();
  }, [theme]);

  return palette;
}
