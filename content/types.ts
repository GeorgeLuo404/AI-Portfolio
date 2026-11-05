// The shapes of the portfolio's content. Every fact about George lives in the
// files next to this one, so the sections and the AI twin read the same thing.

/**
 * Text in each language. English is required. Chinese is optional until the
 * translation task (T11), and `getContent` falls back to English without it.
 */
export type Localized<T extends string = string> = { en: T; zh?: T };

/** A year, such as "2024", or a year and month, such as "2024-03". */
export type YearMonth = `${number}` | `${number}-${number}`;

/** The intro places the highlighted role with a `{role}` token. */
export type Intro = `${string}{role}${string}`;

export type Profile = {
  name: string;
  chineseName: string;
  /** The role, highlighted in the intro. */
  role: Localized;
  /** The three chips over the hero headline and the footer name. */
  chips: readonly [Localized, Localized, Localized];
  intro: Localized<Intro>;
  statement: Localized;
  /** When George can start, and what kind of work he's after. */
  availability: Localized;
};

export type Project = {
  /** Used for anchors and image paths. */
  id: string;
  year: number;
  title: Localized;
  summary: Localized;
  stack: readonly string[];
  links: { live?: string; source?: string };
  /** A screenshot in `public/`, from T10. Until then the well shows ASCII art. */
  image?: { src: string; alt: Localized };
};

export type SkillArea = {
  id: string;
  name: Localized;
  summary: Localized;
  tools: readonly string[];
};

export type Role = {
  start: YearMonth;
  /** Leave out while the role is current. */
  end?: YearMonth;
  title: Localized;
  company: Localized;
  /** One line per result, starting with a verb. */
  results: readonly Localized[];
  stack: readonly string[];
};

export type Education = {
  start: YearMonth;
  end?: YearMonth;
  degree: Localized;
  school: Localized;
  detail?: Localized;
};

/** Public contact details only. No phone number or home address. */
export type Contact = {
  email: string;
  wechat: string;
  github: string;
  linkedin: string;
  /** A PDF in `public/`, one per language. */
  resume: Localized;
};

export type Content = {
  profile: Profile;
  projects: readonly Project[];
  skills: readonly SkillArea[];
  roles: readonly Role[];
  education: readonly Education[];
  contact: Contact;
};
