import type { Locale } from "next-intl";
import { contact } from "./contact";
import { education, roles } from "./experience";
import { profile } from "./profile";
import { projects } from "./projects";
import { skills } from "./skills";
import type { Content, Localized } from "./types";

export type * from "./types";

export const content: Content = {
  profile,
  projects,
  skills,
  roles,
  education,
  contact,
};

/** Content with every `Localized` field turned into the text for one locale. */
export type Resolved<T> = T extends Localized<infer S>
  ? S
  : T extends object
    ? { readonly [K in keyof T]: Resolved<T[K]> }
    : T;

function isLocalized(value: object): value is Localized {
  return (
    "en" in value &&
    typeof value.en === "string" &&
    Object.keys(value).every((key) => key === "en" || key === "zh")
  );
}

function resolve(value: unknown, locale: Locale): unknown {
  if (typeof value !== "object" || value === null) return value;
  if (Array.isArray(value)) return value.map((item) => resolve(item, locale));
  // An empty translation counts as missing, so it falls back too.
  if (isLocalized(value)) return value[locale] || value.en;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, resolve(item, locale)]),
  );
}

const cache = new Map<Locale, Resolved<Content>>();

/**
 * The content in one language, falling back to English for any field that
 * has no translation yet. The sections and the AI twin's prompt (T9) both
 * read it from here.
 */
export function getContent(locale: Locale): Resolved<Content> {
  let resolved = cache.get(locale);
  if (!resolved) {
    resolved = resolve(content, locale) as Resolved<Content>;
    cache.set(locale, resolved);
  }
  return resolved;
}
