import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import en from "@/messages/en.json";
import { routing } from "./routing";

type Messages = { [key: string]: string | Messages };

// Chinese falls back to English for any message it doesn't have yet, until
// the translation task (T11) makes every message required.
function withFallback(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const fallback = base[key];
    out[key] =
      typeof value === "object" && typeof fallback === "object"
        ? withFallback(fallback, value)
        : value;
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const messages =
    locale === "zh"
      ? withFallback(en, (await import("@/messages/zh.json")).default)
      : en;
  return { locale, messages };
});
