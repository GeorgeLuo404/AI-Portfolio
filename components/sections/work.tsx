import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { getContent } from "@/content";
import type { SceneName } from "@/lib/ascii/scenes";
import { AsciiScene } from "../ascii-art";
import { ExternalLink } from "../external-link";
import { PixelIcon } from "../pixel-icon";
import { ProjectShot } from "../project-shot";

// Without a screenshot, a project's well shows one of these objects.
const OBJECTS: SceneName[] = ["orbit", "cube", "slabs"];

// A screen in a project's well: the screenshot in pixels, filling the well,
// or a smaller one with an object in characters. Plain, as in the concept:
// the page color on the well, with no frame.
function Screen({
  object = false,
  children,
}: {
  object?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`w-full bg-bg ${object ? "max-w-[480px] px-[22px] py-[18px]" : "max-w-[800px]"}`}
    >
      {children}
    </div>
  );
}

// The heading, in Archivo 500 like the skills stack: "Selected" over "Work",
// which hangs from the stem of the T. The D of "Selected" ends on L3. On
// phones "Selected" fills the width and "Work" hangs from the second E. On
// the Chinese page the English words are a graphic, and the Chinese heading
// sits above the aside.
function Head() {
  const t = useTranslations("work");
  const locale = useLocale();
  const [first, second] = t("display").split(" ");
  const words = (
    <>
      <span className="-ml-[0.049em] block">{first}</span>
      <span className="ml-[1.828em] block sm:ml-[3.336em]">{second}</span>
    </>
  );
  const display =
    "display display-medium relative z-1 text-(length:--f-head) text-signal";
  return (
    <header className="relative grid gap-y-8 pt-[72px] pb-10 sm:pt-24 sm:pb-14 lg:grid-cols-[var(--L3)_1fr] lg:gap-y-0 lg:pt-[120px] lg:pb-[72px]">
      {/* Below desktop, the heading has its own line that stops above the
          aside: on phones through the E of "Selected", on tablets on L3. */}
      <span
        aria-hidden="true"
        className="vline bottom-auto left-[calc(var(--f-head)*1.839)] h-[calc(72px+var(--f-head)*2)] sm:left-(--L3) sm:h-[calc(96px+var(--f-head)*2)] lg:hidden"
      />
      {locale === "en" ? (
        <h2 id="work-title" className={display}>
          {words}
        </h2>
      ) : (
        <p aria-hidden="true" lang="en" className={display}>
          {words}
        </p>
      )}
      <div className="pl-3 sm:pl-(--L3) lg:w-[calc(var(--C)-var(--mid))] lg:justify-self-end lg:pr-3 lg:pl-0">
        {locale !== "en" && (
          <h2 id="work-title" className="zh-heading mb-2.5">
            {t("heading")}
          </h2>
        )}
        <p
          className={`text-[18px] font-medium max-lg:max-w-[24em] sm:text-[20px] lg:text-[24px] ${locale === "en" ? "leading-[1.35] lg:leading-[1.3]" : "leading-[1.6]"}`}
        >
          {t("aside")}
        </p>
      </div>
    </header>
  );
}

// Selected work: the heading and its aside, then a row per project that
// alternates sides. As in the concept, the image wells stay inside the
// frame's hairlines, and no rules run between the rows.
export function Work() {
  const t = useTranslations("work");
  const locale = useLocale();
  const projects = getContent(locale).projects.filter(
    (project) => project.featured,
  );
  return (
    <section id="work" aria-labelledby="work-title">
      <div className="frame pb-[120px]">
        <span aria-hidden="true" className="vline left-(--L3) max-lg:hidden" />
        <Head />
        {projects.map((project, n) => {
          const flip = n % 2 === 1;
          const object = OBJECTS[n % OBJECTS.length];
          return (
            <article
              key={project.id}
              className={`grid grid-cols-[var(--L1)_1fr] lg:min-h-[440px] ${flip ? "lg:grid-cols-[var(--L3)_var(--L1)_1fr]" : "lg:grid-cols-[var(--L1)_calc(var(--L3)-var(--L1))_1fr]"}`}
            >
              <p
                className={`col-start-1 row-start-1 pt-9 text-[18px] leading-[1.15] font-medium tracking-[-0.02em] after:mt-5 after:block after:size-3 after:bg-signal sm:pt-10 sm:text-[26px] lg:pt-5 lg:text-[30px] lg:after:mt-7 lg:after:size-4 ${flip ? "lg:col-start-2 lg:pl-8" : ""}`}
              >
                {project.start.slice(0, 4)}
              </p>
              <div
                className={`col-start-2 row-start-1 flex max-w-[560px] flex-col gap-4 py-8 pr-1 pl-2 sm:gap-5 sm:py-10 sm:pr-6 sm:pl-0 lg:pt-5 lg:pr-4 lg:pb-14 ${flip ? "lg:col-start-3 lg:max-w-[480px]" : "lg:max-w-none"}`}
              >
                <h3 className="text-[24px] leading-[1.15] font-medium tracking-[-0.02em] sm:text-[26px] lg:text-[30px]">
                  {project.title}
                </h3>
                <p className="max-w-[26em] text-[17px] leading-[1.45] lg:text-[18px]">
                  {project.summary}
                </p>
                <p className="max-w-[28em] text-[15px] leading-[1.5] text-signal-text lg:text-[16px]">
                  {project.part}
                </p>
                <ul
                  aria-label={t("builtWith")}
                  className="flex flex-wrap gap-1.5"
                >
                  {project.stack.map((tool) => (
                    <li key={tool} className="chip chip-muted">
                      {tool}
                    </li>
                  ))}
                </ul>
                {(project.links.live || project.links.source) && (
                  <div className="flex flex-wrap gap-2 pt-6 lg:pt-12">
                    {project.links.live && (
                      <ExternalLink
                        href={project.links.live}
                        className="btn btn-lg btn-signal"
                      >
                        {t("view")}
                        <PixelIcon name="external" size={10} />
                      </ExternalLink>
                    )}
                    {project.links.source && (
                      <ExternalLink
                        href={project.links.source}
                        className="btn btn-lg btn-ghost"
                      >
                        {t("source")}
                      </ExternalLink>
                    )}
                  </div>
                )}
              </div>
              <div
                className={`col-span-full row-start-2 grid place-items-center bg-well p-4 sm:p-10 lg:row-start-1 ${flip ? "lg:col-[1]" : "lg:col-[3]"}`}
              >
                <Screen object={!project.image}>
                  {project.image ? (
                    <ProjectShot
                      src={project.image.src}
                      alt={project.image.alt}
                      title={project.title}
                      cols={240}
                      sizes="(min-width: 1024px) 760px, 100vw"
                    />
                  ) : (
                    <AsciiScene scene={object} />
                  )}
                </Screen>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
