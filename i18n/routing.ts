import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh"],
  defaultLocale: "en",
});

// The value for each page's `lang` attribute, so browsers pick Simplified
// Chinese glyph shapes.
export const htmlLang = { en: "en", zh: "zh-CN" } as const;
