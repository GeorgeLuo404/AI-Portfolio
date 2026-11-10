import type { Education, Role } from "./types";

// Newest first. From George's consolidated profile (2026-11-09): only what
// he confirmed, with no unmeasured numbers.
export const roles: readonly Role[] = [
  {
    start: "2026-02",
    end: "2026-08",
    title: { en: "AI solutions and technical support" },
    company: { en: "Starose AI" },
    results: [
      {
        en: "Helped clients set up AI API services in tools such as Cherry Studio, Claude Code, and OpenClaw, and troubleshot problems.",
      },
      {
        en: "Gave online and on-site demos of how AI could fit into clients' work.",
      },
      {
        en: "Turned clients' needs into proposals with scope and acceptance criteria.",
      },
    ],
    stack: [],
  },
  {
    start: "2024-10",
    end: "2025-07",
    title: { en: "Tier 1 Coder" },
    company: { en: "Outlier AI" },
    results: [
      {
        en: "Wrote and reviewed programming tasks in Python, JavaScript, and TypeScript for evaluating AI coding.",
      },
      {
        en: "Judged AI-written code for correctness, efficiency, readability, and whether it met the task.",
      },
      {
        en: "Wrote test cases and detailed feedback to find errors and improve the answers.",
      },
    ],
    stack: ["Python", "JavaScript", "TypeScript"],
  },
  {
    start: "2021-09",
    end: "2022-07",
    title: { en: "Software engineer" },
    company: { en: "Seasun Games" },
    results: [
      {
        en: "Built the front and back end of an exhibition admin dashboard: role-based access, search, filters, data management, and Excel export.",
      },
      {
        en: "Built the APIs for posts, likes, and comments in a WeChat mini program, with Redis queues for notifications and events.",
      },
      {
        en: "Improved the feed so a new post shows straight away after publishing.",
      },
      {
        en: "Ran integration testing with an e-contract provider, and coordinated changes to their API fields and docs.",
      },
      {
        en: "Helped new colleagues learn the codebase, and kept the team's reference docs.",
      },
    ],
    stack: [
      "React",
      "TypeScript",
      "UmiJS",
      "Ant Design",
      "Node.js",
      "GraphQL",
      "TypeORM",
      "Redis",
    ],
  },
  {
    start: "2020-07",
    end: "2021-06",
    title: { en: "Frontend engineer" },
    company: { en: "Meizu" },
    results: [
      {
        en: "Built the Meizu Watch product pages for desktop and mobile, with scroll-triggered animations in GSAP 3.",
      },
      {
        en: "Built the Meizu 18 series overview and specification pages, with scroll-driven effects in ScrollMagic.",
      },
      {
        en: "Fixed video playback on Android, and loaded the second-level navigation from the back end.",
      },
      {
        en: "Worked with designers, back-end engineers, and testers to ship pages that behave the same across devices.",
      },
    ],
    stack: ["React", "JavaScript", "GSAP", "ScrollMagic"],
  },
];

export const education: readonly Education[] = [
  {
    start: "2022-09",
    end: "2024-09",
    degree: { en: "Master of Information Technology, in AI" },
    school: { en: "UNSW Sydney" },
    details: [
      { en: "Weighted average 80 out of 100, a Distinction." },
      {
        en: "Artificial Intelligence 91, Web Front-end Programming 88, Computer Vision 82, and Machine Learning and Data Mining.",
      },
    ],
  },
  {
    start: "2016-09",
    end: "2020-06",
    degree: { en: "Bachelor of Computer Science and Technology" },
    school: { en: "Beijing Institute of Technology, Zhuhai" },
    details: [
      { en: "GPA 3.79 out of 4, in the top 2% of my program." },
      {
        en: "Special Scholarship in 2017, First-Class Scholarships in 2017 and 2019, and Outstanding Graduate in 2020.",
      },
      {
        en: "A computer science exchange at Cracow University of Technology, Poland, from February to July 2019.",
      },
    ],
  },
];
