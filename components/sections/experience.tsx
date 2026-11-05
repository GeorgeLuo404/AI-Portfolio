import { useLocale, useTranslations } from "next-intl";
import { getContent } from "@/content";
import { AsciiScene } from "../ascii-art";
import { PixelIcon } from "../pixel-icon";
import { RoleList, type RoleRow } from "../role-list";

// Experience, dark in both themes: an aside, the giant word with the
// résumé, LinkedIn, and GitHub chips over it, and roles and education in an
// accordion beside a faint ring.
export function Experience() {
  const t = useTranslations("experience");
  const locale = useLocale();
  const { roles, education, contact } = getContent(locale);
  const en = locale === "en";
  const dates = (start: string, end?: string) =>
    end ? t("range", { start, end }) : t("current", { start });
  const rows: RoleRow[] = [
    ...roles.map((role) => ({
      dates: dates(role.start, role.end),
      title: role.title,
      org: role.company,
      results: role.results,
      stack: role.stack,
    })),
    ...education.map((school) => ({
      dates: dates(school.start, school.end),
      title: school.degree,
      org: school.school,
      results: school.detail ? [school.detail] : [],
      stack: [],
    })),
  ];
  const chip =
    "chip chip-solid z-1 h-8 text-xs sm:absolute hover:brightness-[0.82]";
  const display = "display text-(length:--f-exp) text-fg";
  const word = <span className="-ml-[0.076em] block">{t("display")}</span>;
  return (
    <section id="experience" aria-labelledby="exp-title" className="ink">
      <div className="frame pt-14 sm:pt-[72px]">
        <span aria-hidden="true" className="vline left-(--L3) max-lg:hidden" />
        <div className="grid pb-10 lg:grid-cols-[var(--L3)_1fr]">
          <div className="pl-3 sm:pl-(--L3) lg:col-start-2 lg:max-w-[34em] lg:pl-7">
            {!en && (
              <h2 id="exp-title" className="zh-heading mb-2.5">
                {t("heading")}
              </h2>
            )}
            <p className="text-[18px] leading-[1.45] max-lg:max-w-[24em]">
              {t("aside")}
            </p>
          </div>
        </div>
        <div className="relative grid gap-2 sm:block">
          {/* Below desktop the word has its own line: on tablets the E
              stands on L2, and on phones the line runs through the N. */}
          <span
            aria-hidden="true"
            className="vline bottom-auto left-[calc(var(--f-exp)*4.19)] h-[calc(var(--f-exp)*0.73)] sm:left-(--L2) lg:hidden"
          />
          {en ? (
            <h2 id="exp-title" className={`relative z-1 ${display}`}>
              {word}
            </h2>
          ) : (
            <p
              aria-hidden="true"
              lang="en"
              className={`relative z-1 ${display}`}
            >
              {word}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-1.5 sm:mt-0 sm:block">
            <a
              href={contact.resume}
              className={`${chip} sm:top-[46%] sm:left-(--L1)`}
            >
              {t("resume")}
              <PixelIcon name="download" size={10} />
            </a>
            <a
              href={contact.linkedin}
              className={`${chip} sm:top-[78%] sm:left-(--L3)`}
            >
              LinkedIn
              <PixelIcon name="external" size={10} />
            </a>
            <a
              href={contact.github}
              className={`${chip} sm:top-[12%] sm:left-[calc(var(--L3)+var(--L1))] lg:left-(--mid)`}
            >
              GitHub
              <PixelIcon name="external" size={10} />
            </a>
          </div>
        </div>
        <div className="mt-12 grid lg:grid-cols-[var(--L3)_1fr]">
          <div
            aria-hidden="true"
            className="relative self-end pr-8 max-lg:hidden"
          >
            <AsciiScene scene="ring" faint />
            <span className="-mt-10 grid size-16 place-items-center bg-signal text-white">
              <PixelIcon name="mark" size={30} />
            </span>
          </div>
          <div className="pb-24">
            <p className="pb-[18px] pl-3 text-[14px] text-muted lg:pl-7">
              {t("lead")}
            </p>
            <RoleList rows={rows} usedLabel={t("used")} />
          </div>
        </div>
      </div>
    </section>
  );
}
