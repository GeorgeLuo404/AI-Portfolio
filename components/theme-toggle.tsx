"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { PixelIcon } from "./pixel-icon";

// The page follows the system setting until someone picks a theme here, and
// the choice is saved. The script in the layout applies it before first paint.
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("header");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const system = matchMedia("(prefers-color-scheme: dark)");
    const read = () =>
      setDark(
        root.dataset.theme ? root.dataset.theme === "dark" : system.matches,
      );
    read();
    system.addEventListener("change", read);
    return () => system.removeEventListener("change", read);
  }, []);

  function toggle() {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setDark(!dark);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? t("toLight") : t("toDark")}
      className={className}
    >
      {/* Both icons render, and CSS shows the one for the theme in use, so
          the first paint is right before this component runs. */}
      <PixelIcon name="moon" className="dark:hidden" />
      <PixelIcon name="sun" className="hidden dark:block" />
    </button>
  );
}
