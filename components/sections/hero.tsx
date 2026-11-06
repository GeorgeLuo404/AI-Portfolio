import { useLocale, useTranslations } from "next-intl";
import { getContent } from "@/content";
import { KoiFigure } from "../koi-figure";
import { PixelIcon } from "../pixel-icon";
import { TwinStage } from "../twin-stage";

// The hero, on the grid measured from its own headline: "AI / Web Engineer"
// in giant type, three chips in a staircase, the intro with the logo mark in
// its corner, the koi, the statement, and the AI twin in its room.
export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const { profile } = getContent(locale);
  const [beforeRole, afterRole] = profile.intro.split("{role}");
  // The display words are an English graphic on both pages, solved against
  // the grid (docs/DESIGN.md), so only English has them.
  const [ai, rest] = t("display").split(" / ");
  const [web, engineer] = rest.split(" ");
  const line = "w-px justify-self-start bg-rule";
  return (
    <section id="top" aria-labelledby="hero-title">
      <div className="frame hero-grid">
        <span aria-hidden="true" className={`${line} col-start-2 row-[1/3]`} />
        <span aria-hidden="true" className={`${line} col-start-3 row-[1/3]`} />
        <span
          aria-hidden="true"
          className={`${line} col-start-4 row-[1/3] sm:row-[1/4] lg:row-[1/6]`}
        />

        {/* The English headline is a graphic on both pages, so screen
            readers get the heading as text. */}
        <h1
          id="hero-title"
          className="z-1 [grid-area:title] pt-[calc(var(--f)*0.5)] sm:pt-[calc(var(--f)*0.36)]"
        >
          <span className="sr-only">{t("title")}</span>
          <span
            aria-hidden="true"
            lang="en"
            className="display block text-(length:--f) text-signal"
          >
            {/* Line 1 starts at the left edge. "Engineer" starts where the E
                of "Web" does, so the two Es stack, and so do the B and the N.
                Phones set the three words on three lines. */}
            <span className="-ml-[0.008em] block max-sm:tracking-[-0.004em] sm:inline-block">
              {ai} <span className="font-extralight">/</span>
            </span>{" "}
            <span className="-ml-[0.007em] block sm:ml-0 sm:inline-block">
              {web}
            </span>
            <span className="ml-[0.913em] block sm:ml-[2.356em]">
              {engineer}
            </span>
          </span>
        </h1>

        <ul
          aria-label={t("focus")}
          className="hero-chips pt-7 pb-8 sm:pt-[calc(var(--f)*0.26)] sm:pb-9 lg:pb-12"
        >
          {profile.chips.map((chip) => (
            <li
              key={chip}
              className="chip h-[34px] w-full px-1 text-[10.5px] tracking-[0.02em] sm:h-[38px] sm:px-1.5 sm:text-[11px] sm:tracking-chip lg:px-3.5 lg:text-[15px]"
            >
              {chip}
            </li>
          ))}
        </ul>

        <div className="flex min-w-0 flex-col [grid-area:side]">
          <div className="flex items-center gap-4 border-t border-b border-rule pl-3 sm:mt-[calc(var(--f)*0.26)] sm:border-t-0 sm:pl-5 lg:mt-[calc(var(--f)*0.26+30px)] lg:gap-8 lg:pl-7">
            <p className="max-w-[32em] flex-1 py-5 text-base leading-[1.45] sm:py-2 lg:text-intro">
              {beforeRole}
              <mark className="whitespace-nowrap">{profile.role}</mark>
              {afterRole}
            </p>
            {/* The logo mark sits in the cell's bottom-right corner, on the
                frame line and the art's top rule, however tall the text. */}
            <span
              aria-hidden="true"
              className="ml-auto grid size-[52px] flex-none place-items-center self-end bg-signal text-white sm:size-16 lg:size-[98px]"
            >
              <PixelIcon name="mark" size={42} />
            </span>
          </div>
          <KoiFigure photo={profile.photo} className="flex-1" />
        </div>

        <div className="relative border-y border-rule bg-panel [grid-area:state] py-8 pr-4 pl-3 before:absolute before:-top-px before:left-0 before:size-[18px] before:bg-signal sm:pt-8 sm:pr-6 sm:pb-9 sm:pl-5 lg:pt-11 lg:pr-10 lg:pb-12 lg:pl-7">
          <p className="max-w-[21em] text-[20px] leading-[1.3] font-medium tracking-[-0.015em] sm:text-[21px] lg:text-[26px] [&:lang(zh)]:text-[18px] [&:lang(zh)]:leading-[1.6] [&:lang(zh)]:tracking-[0.02em] sm:[&:lang(zh)]:text-[19px] lg:[&:lang(zh)]:text-[24px]">
            {profile.statement}
          </p>
        </div>

        <TwinStage className="[grid-area:stage]" />

        <a
          href="#work"
          className="flex h-11 items-center justify-end gap-2 border-t border-rule [grid-area:scroll] pr-3 text-xs tracking-[0.04em] text-muted uppercase hover:text-signal-text"
        >
          {t("scroll")}
          <PixelIcon name="down" size={11} />
        </a>
      </div>
    </section>
  );
}
