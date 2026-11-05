import { useLocale, useTranslations } from "next-intl";
import { getContent } from "@/content";
import { StillKoi } from "./ascii-art";
import { LangSwitch } from "./lang-switch";

const SECTIONS = ["work", "skills", "experience", "contact"] as const;

// The footer stays dark in both themes: the name in giant type with chips
// over it and a faint, still pair of koi behind, links, contact details, the
// credit, and the language switch.
export function Footer() {
  const t = useTranslations("footer");
  const header = useTranslations("header");
  const chip =
    "absolute z-1 inline-flex h-[30px] items-center bg-signal px-3.5 text-[11px] font-medium tracking-chip whitespace-nowrap text-white uppercase";
  const locale = useLocale();
  const { profile, contact } = getContent(locale);
  const [ai, frontend, open] = profile.chips;
  return (
    <footer className="ink">
      <div className="frame pt-16 sm:pt-[88px]">
        <div className="relative min-h-[calc(var(--f-name)*1.46+40px)]">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-(--L2) w-px bg-rule"
          />
          <StillKoi className="pointer-events-none absolute top-10 right-0 w-[80%] sm:top-auto sm:-bottom-10 sm:w-[56%] lg:w-[44%]" />
          {/* "Luo" starts on the stem of the R in "George", on L2. */}
          <p
            aria-hidden="true"
            lang="en"
            className="display relative text-(length:--f-name) text-fg"
          >
            <span className="-ml-[0.049em] block">George</span>
            <span className="ml-[2.095em] block">Luo</span>
          </p>
          <span
            aria-hidden="true"
            className={`${chip} top-[calc(var(--f-name)*0.4)] left-3 sm:left-[calc(var(--L1)*0.42)]`}
          >
            {ai}
          </span>
          <span
            aria-hidden="true"
            className={`${chip} top-[calc(var(--f-name)*1.1)] left-(--L2)`}
          >
            {frontend}
          </span>
          <span
            aria-hidden="true"
            className={`${chip} top-[calc(var(--f-name)*0.2)] right-3 sm:right-auto sm:left-[calc(var(--L3)+24px)]`}
          >
            {open}
          </span>
          {locale === "zh" && (
            <p className="relative mt-6 pl-(--L2) text-[clamp(26px,2.5vw,36px)] leading-[1.25] font-black tracking-[0.02em]">
              {profile.chineseName}
            </p>
          )}
        </div>

        <div className="relative mt-14 grid grid-cols-1 gap-y-10 pb-[72px] sm:grid-cols-2 lg:grid-cols-[var(--L3)_calc(var(--mid)-var(--L3))_1fr] lg:gap-y-0">
          <nav
            aria-label={t("onThisSite")}
            className="pl-3 text-[26px] leading-[1.2] tracking-[-0.02em] text-muted sm:col-span-2 sm:text-[34px] lg:col-span-1"
          >
            <a href="#top" className="text-fg hover:text-signal-text">
              {t("home")}
            </a>
            {SECTIONS.map((id) => (
              <span key={id}>
                <span aria-hidden="true" className="ml-1.5 font-extralight">
                  /
                </span>{" "}
                <a href={`#${id}`} className="hover:text-signal-text">
                  {header(id)}
                </a>
              </span>
            ))}
          </nav>
          <div className="flex flex-col gap-1.5 pl-3 text-[14px] text-muted lg:pl-7">
            <h3 className="mb-2 text-[14px] font-semibold text-fg">
              {t("elsewhere")}
            </h3>
            <a href={contact.github} className="hover:text-signal-text">
              GitHub
            </a>
            <a href={contact.linkedin} className="hover:text-signal-text">
              LinkedIn
            </a>
            <a href={contact.resume} className="hover:text-signal-text">
              {t("resume")}
            </a>
          </div>
          <div className="flex flex-col gap-1.5 pl-3 text-[14px] text-muted lg:pl-7">
            <h3 className="mb-2 text-[14px] font-semibold text-fg">
              {t("contact")}
            </h3>
            <a
              href={`mailto:${contact.email}`}
              className="hover:text-signal-text"
            >
              {contact.email}
            </a>
            <span>{t("wechat", { id: contact.wechat })}</span>
          </div>
        </div>

        <div className="relative flex flex-col justify-between gap-x-8 gap-y-3 border-t border-rule px-3 pt-[18px] pb-7 text-[11px] tracking-[0.06em] text-muted uppercase sm:flex-row sm:flex-wrap [&:lang(zh)]:tracking-[0.02em]">
          <span>{t("copyright", { year: new Date().getFullYear() })}</span>
          <span>{t("credit")}</span>
          <LangSwitch className="flex gap-6" />
          <a href="#top" className="hover:text-signal-text">
            {t("top")}
          </a>
        </div>
      </div>
    </footer>
  );
}
