import type { Profile } from "./types";

// Placeholder until T10, apart from the names.
export const profile: Profile = {
  name: "George Luo",
  chineseName: "罗卓君",
  role: { en: "AI and web engineer", zh: "AI 与前端开发工程师" },
  chips: [
    { en: "AI products", zh: "AI 产品" },
    { en: "Frontend", zh: "前端开发" },
    { en: "Open to roles", zh: "正在求职" },
  ],
  intro: {
    en: "I'm George Luo, an {role}. I work across the stack, from model calls and data to the interface people use every day.",
    zh: "我是罗卓君，一名 {role}。从模型调用、数据到每天被使用的界面，整条链路我都能做。",
  },
  statement: {
    en: "From the first prompt to the last pixel, I build AI products that hold up in front of real users.",
    zh: "从第一句提示词到最后一个像素，我做经得起真实用户检验的 AI 产品。",
  },
  availability: {
    en: "Placeholder: when George can start, and whether he wants full-time, remote, or on-site work.",
  },
};
