import type { Education, Role } from "./types";

// Newest first. Placeholder until T10.
export const roles: readonly Role[] = [
  {
    start: "2024",
    title: { en: "Software engineer", zh: "软件工程师" },
    company: { en: "Company name", zh: "公司名称" },
    results: [
      {
        en: "Placeholder: one line per result, starting with a verb.",
        zh: "占位：每行写一个成果，以动词开头。",
      },
      {
        en: "Add a number where you have one, such as time saved or users reached.",
        zh: "有数字就写数字，比如节省的时间或覆盖的用户。",
      },
    ],
    stack: ["TypeScript", "React", "AWS"],
  },
  {
    start: "2022",
    end: "2024",
    title: { en: "Role title", zh: "职位名称" },
    company: { en: "Company name", zh: "公司名称" },
    results: [{ en: "Placeholder result.", zh: "占位成果。" }],
    stack: [],
  },
  {
    start: "2021",
    end: "2022",
    title: { en: "Role title", zh: "职位名称" },
    company: { en: "Company name", zh: "公司名称" },
    results: [{ en: "Placeholder result.", zh: "占位成果。" }],
    stack: [],
  },
];

export const education: readonly Education[] = [
  {
    start: "2017",
    end: "2021",
    degree: { en: "Degree", zh: "学位" },
    school: { en: "University", zh: "大学" },
    detail: { en: "Placeholder detail.", zh: "占位详情。" },
  },
];
