import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AskLink } from "./chat/ask-link";
import { LangSwitch } from "./lang-switch";
import { MobileMenu } from "./mobile-menu";
import { PixelIcon } from "./pixel-icon";
import { ThemeToggle } from "./theme-toggle";

const SECTIONS = ["work", "skills", "experience", "contact"] as const;

// The sticky header: brand, section links, and tools, on the grid. Phones get
// a menu in place of the links and tools.
export function Header() {
  const t = useTranslations("header");
  const tool = "flex items-center border-l border-rule";
  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-bg">
      <div className="frame grid h-12 grid-cols-[1fr_auto] sm:grid-cols-[auto_1fr_auto] lg:grid-cols-[var(--L1)_1fr_auto]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-(--L3) z-1 hidden w-px bg-rule lg:block"
        />
        <Link
          href="/"
          className="flex items-center gap-2.5 pl-3 text-nav tracking-[-0.01em] whitespace-nowrap uppercase sm:pr-4 lg:pr-0"
        >
          <span className="grid size-[22px] shrink-0 place-items-center bg-signal text-white">
            <PixelIcon name="mark" size={12} />
          </span>
          <span>
            {t.rich("brand", {
              b: (chunks) => <b className="font-extrabold">{chunks}</b>,
              zh: (chunks) => (
                <b
                  lang="zh-CN"
                  className="text-[16px] font-black tracking-[0.04em]"
                >
                  {chunks}
                </b>
              ),
              en: (chunks) => <span lang="en">{chunks}</span>,
            })}
          </span>
        </Link>
        <nav
          aria-label={t("sections")}
          className="hidden items-center gap-4 border-l border-rule pl-4 text-sm font-medium sm:flex lg:gap-[22px] lg:pl-6 lg:text-nav"
        >
          {SECTIONS.map((id) => (
            <Link key={id} href={`/#${id}`} className="hover:text-signal-text">
              {t(id)}
            </Link>
          ))}
        </nav>
        <div className="flex items-stretch">
          <LangSwitch
            short
            className={`${tool} hidden gap-0.5 px-2.5 text-[13px] font-semibold sm:flex`}
            linkClassName="px-1.5 py-1"
          />
          <ThemeToggle className={`${tool} w-12 justify-center`} />
          <AskLink
            className={`${tool} hidden gap-2.5 bg-panel text-sm font-semibold tracking-[0.03em] text-signal-text uppercase sm:flex sm:w-12 sm:justify-center lg:w-auto lg:px-5 [&:lang(zh)]:tracking-[0.04em]`}
          >
            <PixelIcon name="chat" />
            <span className="hidden lg:inline">{t("ask")}</span>
            <span className="sr-only lg:hidden">{t("ask")}</span>
          </AskLink>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
