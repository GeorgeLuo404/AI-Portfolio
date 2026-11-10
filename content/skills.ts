import type { SkillArea } from "./types";

// One area per line of the skills stack, whose giant words are English
// graphics in the section itself, solved against the grid (docs/DESIGN.md).
// Each tool here is backed by a role or a project.
export const skills: readonly SkillArea[] = [
  {
    id: "ai",
    name: { en: "AI apps" },
    summary: {
      en: "Streaming chat grounded in my own content, test sets for it, and an editor panel for local models",
    },
    tools: ["AI SDK", "DeepSeek", "OpenAI API", "LangChain", "PyTorch"],
  },
  {
    id: "web",
    name: { en: "Full-stack web" },
    summary: {
      en: "React and Next.js in front, Node, Prisma, PostgreSQL, and Redis behind",
    },
    tools: [
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Prisma",
      "PostgreSQL",
      "Redis",
    ],
  },
  {
    id: "motion",
    name: { en: "Motion & UI" },
    summary: {
      en: "Scroll-driven product pages, responsive layouts, and art drawn in characters",
    },
    tools: ["GSAP", "ScrollMagic", "Tailwind CSS", "Ant Design"],
  },
];
