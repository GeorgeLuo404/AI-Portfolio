import type { Contact } from "./types";

// Public details only: the repo is public, so no phone number or home
// address. The résumé waits for George's PDFs, one per language (see Later in
// docs/ROADMAP.md).
export const contact: Contact = {
  email: "georgeluo404@gmail.com",
  wechat: "georgeluo38",
  github: "https://github.com/GeorgeLuo404",
  linkedin: "https://www.linkedin.com/in/george-luo-coder/",
  resume: { en: "#top" },
};
