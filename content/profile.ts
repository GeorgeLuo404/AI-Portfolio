import type { Profile } from "./types";

// From George's consolidated profile (2026-11-09). English first: the
// Chinese comes in T11, and falls back to English until then.
export const profile: Profile = {
  name: "George Luo",
  chineseName: "罗卓君",
  role: { en: "AI and web engineer", zh: "AI 与前端开发工程师" },
  chips: [
    { en: "AI integration", zh: "AI 应用集成" },
    { en: "Full-stack", zh: "全栈开发" },
    { en: "Open to roles", zh: "正在求职" },
  ],
  intro: {
    en: "I'm George Luo, an {role} in Shenzhen. I've built product landing pages at Meizu and admin systems at Seasun Games, and now I bring LLMs into web apps.",
  },
  statement: {
    en: "I build web products end to end, from the database to the scroll animation, and I bring language models into them.",
  },
  photo: {
    src: "/george.jpg",
    alt: {
      en: "George Luo in a black beanie, giving a thumbs-up at a coastal lookout",
      zh: "罗卓君戴着黑色毛线帽，在海边观景台竖起大拇指",
    },
  },
  availability: {
    en: "Open to full-time roles: on-site in Shenzhen, remote, or overseas. I can start within a week of accepting an offer.",
  },
  location: { en: "Shenzhen, China", zh: "中国深圳" },
  languages: [
    { en: "Mandarin, my first language", zh: "普通话（母语）" },
    { en: "Cantonese, spoken", zh: "粤语（可交流）" },
    {
      en: "English, fluent: I did my master's in Sydney and worked in Australia",
    },
  ],
};
