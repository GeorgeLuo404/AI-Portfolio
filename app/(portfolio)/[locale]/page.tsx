import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AsciiImage, AsciiScene } from "@/components/ascii-art";
import { KoiFigure } from "@/components/koi-figure";
import { getContent } from "@/content";
import { routing } from "@/i18n/routing";

// A placeholder until the sections from docs/DESIGN.md are built (T8): the
// headline and the intro, then the art from T7 in a stack, which T8 moves
// into the sections. The headline is an English graphic on both pages, with
// the real heading for screen readers.
export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const { profile, projects } = getContent(locale);
  const { image } = projects[0];
  const [beforeRole, afterRole] = profile.intro.split("{role}");
  const [first, second] = t("display").split(" / ");
  const [web, ...rest] = second.split(" ");
  return (
    <main id="top" className="frame">
      <div className="grid content-center gap-8 py-24 pl-3">
        <h1>
          <span className="sr-only">{t("title")}</span>
          <span
            aria-hidden="true"
            lang="en"
            className="display block text-(length:--f) text-signal"
          >
            <span className="block">
              {first} <span className="font-extralight">/</span> {web}
            </span>
            <span className="block">{rest.join(" ")}</span>
          </span>
        </h1>
        <p className="max-w-[32em] text-intro leading-[1.45]">
          {beforeRole}
          <mark className="whitespace-nowrap">{profile.role}</mark>
          {afterRole}
        </p>
      </div>
      <KoiFigure
        photo={profile.photo}
        className="border-t border-rule lg:h-[640px]"
      />
      <div className="grid border-t border-rule sm:grid-cols-2">
        {image && (
          <div className="bg-well p-6 sm:p-10">
            <AsciiImage src={image.src} alt={image.alt} />
          </div>
        )}
        <div className="bg-well p-6 sm:border-l sm:border-rule sm:p-10">
          <AsciiScene scene="orbit" />
        </div>
      </div>
      <div className="ink overflow-hidden py-16">
        <AsciiScene scene="ripples" faint />
      </div>
    </main>
  );
}
