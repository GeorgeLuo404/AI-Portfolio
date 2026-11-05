import { useLocale, useTranslations } from "next-intl";
import { getContent } from "@/content";
import { AsciiScene } from "../ascii-art";
import { PixelIcon } from "../pixel-icon";

// Skills: a stack of words in black, each starting on a grid line, with blue
// pixel decorations, faint ASCII objects behind, and a legend of tools.
// The words are English graphics, solved against the grid, so on the Chinese
// page they're hidden from screen readers and a Chinese heading leads.
export function Skills() {
  const t = useTranslations("skills");
  const locale = useLocale();
  const { skills } = getContent(locale);
  const en = locale === "en";
  return (
    <section id="skills" aria-labelledby="skills-title">
      <div className="frame overflow-hidden pt-24 pb-10 sm:pt-28 sm:pb-14 lg:pt-[140px]">
        <AsciiScene
          scene="ring"
          faint
          className="pointer-events-none absolute top-[60px] -left-[4%] w-[60%] sm:w-[34%]"
        />
        <AsciiScene
          scene="orbit"
          faint
          className="pointer-events-none absolute top-10 -right-[2%] w-[60%] sm:w-[30%]"
        />
        <h2
          id="skills-title"
          className={en ? "sr-only" : "zh-heading relative mb-10 pl-3"}
        >
          {t("heading")}
        </h2>
        <div className="relative">
          <PixelIcon
            name="spark"
            size={40}
            className="absolute bottom-[calc(100%+24px)] left-3 text-signal sm:left-[calc(var(--L1)-8px)]"
          />
          <span aria-hidden="true" className="vline left-(--L1)" />
          <span aria-hidden="true" className="vline left-(--L2)" />
          <span
            aria-hidden="true"
            className="vline left-(--L3) max-sm:hidden"
          />
          {/* Each line starts on a grid line: the A on L2, the F on the left
              edge, and the D on L1. The E of "Agents" lands on L3. */}
          <ul
            aria-hidden={en ? undefined : true}
            lang="en"
            className="relative z-1 text-(length:--f-skill) leading-[0.9] font-medium tracking-[-0.04em] whitespace-nowrap uppercase sm:leading-[0.82] [&>li]:flex [&>li]:items-center [&>li]:gap-x-[0.16em]"
          >
            <li className="pl-[calc(var(--L2)-0.006em)]">{t("lines.ai")}</li>
            <li className="-ml-[0.081em] max-sm:flex-wrap">
              <span>{t("lines.full")}</span>
              {/* Phones break the line here, and the rest starts on L1. */}
              <span aria-hidden="true" className="h-0 basis-full sm:hidden" />
              <span
                aria-hidden="true"
                className="font-extralight text-signal max-sm:ml-(--L1)"
              >
                (
              </span>
              <span
                aria-hidden="true"
                className="mx-[0.12em] inline-block h-[0.78em] w-[1.9em] overflow-hidden border-2 border-signal bg-bg px-[0.12em] py-[0.06em]"
              >
                <AsciiScene scene="cube" className="h-full overflow-hidden" />
              </span>
              <span aria-hidden="true" className="font-extralight text-signal">
                )
              </span>
              <span>{t("lines.web")}</span>
              <span
                aria-hidden="true"
                className="ml-[0.18em] grid size-[0.62em] flex-none place-items-center bg-signal text-white"
              >
                <PixelIcon name="mark" size={22} />
              </span>
            </li>
            <li className="pl-[calc(var(--L1)-0.081em)]">{t("lines.data")}</li>
          </ul>
          <PixelIcon
            name="carets"
            size={44}
            className="absolute right-3 bottom-[calc(100%+32px)] text-signal sm:top-[calc(100%+28px)] sm:right-auto sm:bottom-auto sm:left-(--L2)"
          />
          <PixelIcon
            name="brace"
            size={64}
            className="absolute top-[58%] right-5 text-signal max-sm:hidden lg:right-12"
          />
        </div>
        <ul className="relative mt-12 grid border-t border-rule sm:mt-[72px] lg:mt-24 lg:grid-cols-[var(--L3)_calc(var(--mid)-var(--L3))_1fr]">
          {skills.map((area) => (
            <li
              key={area.id}
              className="pt-3 pr-6 pl-3 text-sm leading-[1.5] text-muted lg:pt-4"
            >
              <b className="block font-semibold text-fg">{area.name}</b>
              {area.summary}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
