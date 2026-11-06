"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { AskLink } from "./chat/ask-link";
import { LangSwitch } from "./lang-switch";
import { PixelIcon } from "./pixel-icon";

const SECTIONS = ["work", "skills", "experience", "contact"] as const;

// Phones only: a menu button, and a sheet that drops below the header.
export function MobileMenu() {
  const t = useTranslations("header");
  const [open, setOpen] = useState(false);

  // Close once a link in the sheet takes the page to a section.
  useEffect(() => {
    const close = () => setOpen(false);
    addEventListener("hashchange", close);
    return () => removeEventListener("hashchange", close);
  }, []);
  const row =
    "flex min-h-13 items-center border-b border-rule px-[calc(var(--g)+12px)] text-[17px] font-medium";
  return (
    <>
      <button
        type="button"
        aria-label={t("menu")}
        aria-expanded={open}
        aria-controls="menu-sheet"
        onClick={() => setOpen(!open)}
        className="grid w-12 place-items-center border-l border-rule sm:hidden"
      >
        <PixelIcon name={open ? "close" : "menu"} size={16} />
      </button>
      <div
        id="menu-sheet"
        className={`absolute top-full right-[calc(-1*var(--g))] left-[calc(-1*var(--g))] flex-col border-y border-rule bg-bg sm:hidden ${open ? "flex" : "hidden"}`}
      >
        {SECTIONS.map((id) => (
          <a key={id} href={`#${id}`} className={row}>
            {t(id)}
          </a>
        ))}
        <LangSwitch className={`${row} gap-4`} linkClassName="text-[17px]" />
        <AskLink
          onOpen={() => setOpen(false)}
          className={`${row} w-full gap-2.5 border-b-0 bg-panel text-signal-text`}
        >
          <PixelIcon name="chat" />
          {t("ask")}
        </AskLink>
      </div>
    </>
  );
}
