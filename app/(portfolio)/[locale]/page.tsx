import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/footer";
import { PixelIcon } from "@/components/pixel-icon";
import { Contact } from "@/components/sections/contact";
import { Experience } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { Skills } from "@/components/sections/skills";
import { Work } from "@/components/sections/work";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { chatEnabled } from "@/lib/chat/config";

// The home page: every section from docs/DESIGN.md, in order, and the
// footer. The header comes from the layout.
export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const showChatShortcut = chatEnabled();
  const t = await getTranslations("header");
  return (
    <>
      {showChatShortcut && (
        <Link
          href="/chat"
          className="chat-shortcut btn btn-signal size-12 px-0 hover:brightness-90"
          title={t("ask")}
        >
          <PixelIcon name="chat" size={24} />
          <span className="sr-only">{t("ask")}</span>
        </Link>
      )}
      <main>
        <Hero />
        <Work />
        <Skills />
        <Experience />
        <Contact />
      </main>
      <Footer hasChatShortcut={showChatShortcut} />
    </>
  );
}
