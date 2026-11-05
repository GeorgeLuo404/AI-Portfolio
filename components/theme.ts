/**
 * Puts a forced or saved theme on `<html>`. `?theme=light` or `?theme=dark`
 * wins over a saved choice; with neither, the page follows the system.
 *
 * Keep it self-contained, with no imports: `ThemeScript` inlines its source
 * so it runs before first paint.
 */
export function applySavedTheme() {
  let theme = new URLSearchParams(location.search).get("theme");
  if (theme !== "light" && theme !== "dark") {
    try {
      theme = localStorage.getItem("theme");
    } catch {}
  }
  if (theme === "light" || theme === "dark") {
    document.documentElement.dataset.theme = theme;
  }
}
