"use client";

import { applySavedTheme } from "./theme";

const html = `(${applySavedTheme})()`;

// Applies the theme while the HTML is parsed, so the page doesn't flash. A
// script that React adds on the client never runs, so on the client it's
// marked as plain text, which also stops React warning about it. When the
// layout remounts, such as after switching language, `ThemeToggle` applies
// the theme instead. See Next's guide, "Preventing flash before hydration".
export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      // biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed script of our own, with no outside input.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
