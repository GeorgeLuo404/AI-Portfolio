import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChatProvider } from "@/components/chat/chat-provider";
import { Header } from "@/components/header";
import { ThemeScript } from "@/components/theme-script";
import { getContent } from "@/content";
import { htmlLang, routing } from "@/i18n/routing";
import { chatEnabled } from "@/lib/chat/config";
import "../../globals.css";

// Self-hosted, so no visitor's browser fetches fonts from another host. The
// grid depends on Archivo's exact metrics (see docs/DESIGN.md).
const archivo = localFont({
  src: "../../fonts/archivo-latin-wght.woff2",
  variable: "--font-archivo",
  weight: "100 900",
});

// The ASCII art needs a monospace font while this one loads, so no
// Arial-based fallback: the stack falls through to the system's monospace.
const jetbrainsMono = localFont({
  src: "../../fonts/jetbrains-mono-latin-wght.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  adjustFontFallback: false,
});

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
        <ThemeScript />
      </head>
      <body>
        <NextIntlClientProvider>
          <ChatProvider
            enabled={chatEnabled()}
            email={getContent(locale).contact.email}
          >
            <div className="page">
              <Header />
              {children}
            </div>
          </ChatProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
