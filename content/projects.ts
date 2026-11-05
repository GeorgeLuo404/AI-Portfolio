import type { Project } from "./types";

// Newest first. Projects two and three, their links, and the screenshots are
// placeholders until T10.
export const projects: readonly Project[] = [
  {
    id: "ai-twin",
    year: 2026,
    title: { en: "AI portfolio twin", zh: "AI 作品集分身" },
    summary: {
      en: "This site's chat. It answers recruiters' questions from my résumé and projects, and declines anything off topic.",
      zh: "就是本站的对话功能。它根据我的简历和项目回答招聘方的问题，并拒绝无关话题。",
    },
    stack: ["Next.js", "AI SDK", "DeepSeek"],
    // This site is the live project.
    links: {
      live: "#top",
      source: "https://github.com/GeorgeLuo404/AI-Portfolio",
    },
    phoneImage: {
      src: "/projects/placeholder-phone.png",
      alt: {
        en: "Placeholder: a sketch of the AI twin's chat on a phone",
        zh: "占位图：手机上 AI 分身对话的示意图",
      },
    },
    image: {
      src: "/projects/placeholder.png",
      alt: {
        en: "Placeholder: a sketch of the AI twin's chat window",
        zh: "占位图：AI 分身对话窗口的示意图",
      },
    },
  },
  {
    id: "project-two",
    year: 2025,
    title: { en: "Project two", zh: "项目二" },
    summary: {
      en: "Placeholder. One or two lines on the problem, what you built, and the result, with a number if you have one.",
      zh: "占位文字。用一两句话写问题、你做了什么和结果，有数字就写上数字。",
    },
    stack: ["TypeScript", "PostgreSQL", "AWS"],
    links: { live: "#work", source: "#work" },
  },
  {
    id: "project-three",
    year: 2024,
    title: { en: "Project three", zh: "项目三" },
    summary: {
      en: "Placeholder. Keep the same shape: the problem, what you built, and what changed for the people who used it.",
      zh: "占位文字。保持同样的结构：问题、你做了什么、对使用者带来了什么改变。",
    },
    stack: ["Python", "FastAPI", "Docker"],
    links: { live: "#work", source: "#work" },
  },
];
