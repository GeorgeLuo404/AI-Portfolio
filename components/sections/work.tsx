import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { getContent } from "@/content";
import type { SceneName } from "@/lib/ascii/scenes";
import { AsciiImage, AsciiScene } from "../ascii-art";
import { PixelIcon } from "../pixel-icon";

// Without a screenshot, a project's well shows one of these objects.
const OBJECTS: SceneName[] = ["orbit", "cube", "slabs"];

// A screen in a project's well: a bar with the project's name and path, and
// the screenshot in characters below it.
function Screen({
  bar,
  phone = false,
  className = "",
  children,
}: {
  bar: [string, string];
  phone?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`w-full border border-rule bg-bg ${phone ? "max-w-[190px] justify-self-end max-sm:hidden" : "max-w-[480px]"} ${className}`}
    >
      <div
        aria-hidden="true"
        className="flex justify-between gap-3 border-b border-rule px-3 py-2 font-mono text-[11px] leading-none font-medium text-muted"
      >
        <span>{bar[0]}</span>
        <span>{bar[1]}</span>
      </div>
      <div className={phone ? "px-3 py-[26px]" : "px-[22px] py-[18px]"}>
        {children}
      </div>
    </div>
  );
}

// The heading: "Selected" over "Work", which hangs from the stem of the T
// and ends where the D of "Selected" does. On phones "Work" hangs from the
// second E, on L2. On the Chinese page the English words are a graphic, and
// the Chinese heading sits above the aside.
function Head() {
  const t = useTranslations("work");
  const locale = useLocale();
  const [first, second] = t("display").split(" ");
  const words = (
    <>
      <span className="-ml-[0.044em] block">{first}</span>
      <span className="ml-[1.864em] block sm:ml-[3.348em]">{second}</span>
    </>
  );
  const display = "display relative z-1 text-(length:--f-head) text-signal";
  return (
    <header className="relative grid gap-y-8 pt-[72px] pb-10 sm:pt-24 sm:pb-14 lg:grid-cols-[var(--L3)_1fr] lg:gap-y-0 lg:pt-[120px] lg:pb-[72px]">
      {/* Below desktop, the heading has its own line that stops above the
          aside: on phones through the E of "Selected", on tablets on L3. */}
      <span
        aria-hidden="true"
        className="vline bottom-auto left-[calc(var(--f-head)*1.871)] h-[calc(72px+var(--f-head)*1.46)] sm:left-(--L3) sm:h-[calc(96px+var(--f-head)*1.46)] lg:hidden"
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
        <p className="text-[18px] leading-[1.45] font-medium max-lg:max-w-[24em]">
          {t("aside")}
        </p>
      </div>
    </header>
  );
}

// Selected work: the heading and its aside, then a row per project that
// alternates sides, with an image well that bleeds to the page edge.
export function Work() {
  const t = useTranslations("work");
  const locale = useLocale();
  const { projects } = getContent(locale);
  return (
    <section id="work" aria-labelledby="work-title">
      <div className="frame pb-[120px]">
        <span aria-hidden="true" className="vline left-(--L3) max-lg:hidden" />
        <Head />
        {projects.map((project, n) => {
          const flip = n % 2 === 1;
          const pair = !!project.phoneImage;
          const object = OBJECTS[n % OBJECTS.length];
          return (
            <article
              key={project.id}
              className={`grid grid-cols-[var(--L1)_1fr] border-t border-rule last:border-b lg:min-h-[440px] ${flip ? "lg:grid-cols-[var(--L3)_var(--L1)_1fr]" : "lg:grid-cols-[var(--L1)_calc(var(--L3)-var(--L1))_1fr]"}`}
            >
              <p
                className={`col-start-1 row-start-1 pt-8 pl-3 text-base font-medium tracking-[-0.01em] after:mt-6 after:block after:size-3 after:bg-signal sm:pt-10 sm:text-[22px] ${flip ? "lg:col-start-2 lg:pl-8" : ""}`}
              >
                {project.year}
              </p>
              <div
                className={`col-start-2 row-start-1 flex max-w-[520px] flex-col gap-4 py-8 pr-1 pl-2 sm:py-10 sm:pr-8 sm:pl-0 ${flip ? "lg:col-start-3 lg:max-w-[460px]" : "lg:max-w-none"}`}
              >
                <h3 className="text-[22px] leading-[1.2] font-semibold tracking-[-0.01em]">
                  {project.title}
                </h3>
                <p className="max-w-[30em] text-[15px] leading-[1.55] text-muted">
                  {project.summary}
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
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    {project.links.live && (
                      <a href={project.links.live} className="btn btn-signal">
                        {t("view")}
                        <PixelIcon name="external" size={10} />
                      </a>
                    )}
                    {project.links.source && (
                      <a href={project.links.source} className="btn btn-ghost">
                        {t("source")}
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div
                className={`col-span-full row-start-2 grid place-items-center gap-5 bg-well py-6 max-lg:-mx-(--g) max-lg:px-(--g) sm:py-10 lg:row-start-1 lg:p-12 ${pair ? "sm:grid-cols-[minmax(0,190px)_minmax(0,480px)] sm:justify-center" : ""} ${flip ? "lg:col-[1] lg:-ml-(--g)" : "lg:col-[3] lg:-mr-(--g)"}`}
              >
                {project.phoneImage && (
                  <Screen bar={[project.id, "9:41"]} phone>
                    <AsciiImage
                      src={project.phoneImage.src}
                      alt={project.phoneImage.alt}
                      cols={36}
                    />
                  </Screen>
                )}
                <Screen
                  bar={[project.id, `/projects/${project.id}`]}
                  className={pair ? "sm:justify-self-start" : ""}
                >
                  {project.image ? (
                    <AsciiImage
                      src={project.image.src}
                      alt={project.image.alt}
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
