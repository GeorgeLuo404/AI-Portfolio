// Type tests for the content shapes. `tsc` fails if any of these stops
// holding: an unused `@ts-expect-error` is an error too.
import type { Localized, Profile } from "./types";

// @ts-expect-error English is required.
export const missingEnglish: Localized = { zh: "只有中文" };

// Chinese is optional until T11.
export const englishOnly: Localized = { en: "English only" };

// @ts-expect-error The intro must place the role.
export const introWithoutRole: Profile["intro"] = { en: "I build things." };
