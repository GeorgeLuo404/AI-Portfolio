import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChatView } from "@/components/chat/chat-view";
import { getContent } from "@/content";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { chatEnabled } from "@/lib/chat/config";

// The AI twin's own page. A page rather than a pop-up, so phones scroll it
// like any other page, the back button leaves it, and the chat's code loads
// only here. Questions asked elsewhere arrive through the tab's storage.

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/chat">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "chat" });
  const meta = await getTranslations({ locale, namespace: "meta" });
  return {
    title: `${t("title")} · ${meta("title")}`,
    robots: { index: false },
  };
}

export default async function ChatPage({
  params,
}: PageProps<"/[locale]/chat">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const twin = await getTranslations("twin");
  const t = await getTranslations("chat");
  const email = getContent(locale).contact.email;
  return (
    <main className="frame flex min-h-[calc(100svh-49px)] flex-col">
      <div className="flex w-full flex-1 flex-col lg:mx-auto lg:max-w-[760px] lg:border-x lg:border-rule">
        {chatEnabled() ? (
          <ChatView />
        ) : (
          <div className="flex flex-col gap-3 px-4 py-6">
            <p className="text-muted">{twin("resting")}</p>
            <p className="text-[14px] text-muted">
              {twin("offNote")}{" "}
              <a
                href={`mailto:${email}`}
                className="text-signal-text underline underline-offset-2"
              >
                {email}
              </a>
            </p>
            <Link
              href="/"
              className="text-signal-text underline underline-offset-2"
            >
              {t("back")}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
