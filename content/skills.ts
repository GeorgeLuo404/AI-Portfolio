import type { SkillArea } from "./types";

// Placeholder until T10. The giant words in the skills stack are English
// graphics in the section itself, solved against the grid (docs/DESIGN.md).
export const skills: readonly SkillArea[] = [
  {
    id: "ai",
    name: { en: "AI agents", zh: "AI 智能体" },
    summary: {
      en: "LLM apps, retrieval, tool use, and evaluation",
      zh: "LLM 应用、检索、工具调用与评测",
    },
    tools: ["AI SDK", "DeepSeek"],
  },
  {
    id: "web",
    name: { en: "Full-stack web", zh: "全栈网页" },
    summary: {
      en: "TypeScript, React, Next.js, and Node",
      zh: "TypeScript、React、Next.js 与 Node",
    },
    tools: ["TypeScript", "React", "Next.js", "Node"],
  },
  {
    id: "data",
    name: { en: "Data and cloud", zh: "数据与云" },
    summary: {
      en: "Python, PostgreSQL, Docker, and AWS",
      zh: "Python、PostgreSQL、Docker 与 AWS",
    },
    tools: ["Python", "PostgreSQL", "Docker", "AWS"],
  },
];
