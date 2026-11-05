import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/hero";
import { Work } from "@/components/sections/work";
import { routing } from "@/i18n/routing";

// The home page: every section from docs/DESIGN.md, in order. The header
// and footer come from the layout.
export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <main>
      <Hero />
      <Work />
    </main>
  );
}
