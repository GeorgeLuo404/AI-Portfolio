import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { htmlLang, routing } from "@/i18n/routing";
import "../../globals.css";

// Self-hosted, so no visitor's browser fetches fonts from another host. The
// grid depends on Archivo's exact metrics (see docs/DESIGN.md).
const archivo = localFont({
  src: "../../fonts/archivo-latin-wght.woff2",
  variable: "--font-archivo",
  weight: "100 900",
});

const jetbrainsMono = localFont({
  src: "../../fonts/jetbrains-mono-latin-wght.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
});

// Applies a saved or forced theme before first paint, so the page doesn't
// flash. ?theme=light or ?theme=dark wins over a saved choice.
const themeScript = `(() => {
  const params = new URLSearchParams(location.search);
  let theme = params.get("theme");
  if (theme !== "light" && theme !== "dark") {
    try { theme = localStorage.getItem("theme"); } catch {}
  }
  if (theme === "light" || theme === "dark") {
    document.documentElement.dataset.theme = theme;
  }
})();`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("title"), description: t("description") };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <html
      lang={htmlLang[locale]}
      className={`${archivo.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed script of our own, with no outside input.
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body>
        <NextIntlClientProvider>
          <div className="page">
            <Header />
            {children}
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
