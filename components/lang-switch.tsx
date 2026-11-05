"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { htmlLang, routing } from "@/i18n/routing";

// Links to the same page in each language. `short` gives EN and 中文 for the
// header, sized so both stand 11px tall (see docs/DESIGN.md).
export function LangSwitch({
  short = false,
  className,
  linkClassName,
}: {
  short?: boolean;
  className?: string;
  linkClassName?: string;
}) {
  const t = useTranslations("languages");
  const header = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  return (
    <nav aria-label={header("language")} className={className}>
      {routing.locales.map((code) => {
        const current = code === locale;
        return (
          <Link
            key={code}
            href={pathname}
            locale={code}
            lang={current ? undefined : htmlLang[code]}
            aria-current={current ? "page" : undefined}
            className={`${current ? "text-fg" : "text-muted hover:text-signal-text"} ${
              short
                ? code === "zh"
                  ? "-translate-y-px text-[12px]"
                  : "text-[16px]"
                : ""
            } ${linkClassName ?? ""}`}
          >
            {short ? t(`${code}Short`) : t(code)}
          </Link>
        );
      })}
    </nav>
  );
}
