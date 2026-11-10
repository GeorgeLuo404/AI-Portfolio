import type { Project } from "./types";

// Newest first, by start date. The three featured ones are the home page's
// Selected work, in this order, and the projects page (T10b) lists them all.
// Each part says plainly what George did, especially in team projects.
export const projects: readonly Project[] = [
  {
    id: "starlink",
    start: "2026-07",
    end: "2026-08",
    featured: true,
    group: "web",
    title: { en: "Starlink Automation website" },
    summary: {
      en: "A company website and admin system for a Shenzhen industrial-automation firm, covering its services, case studies, news, downloads, and enquiries.",
    },
    part: {
      en: "Client project, solo. I took it from requirements and design to deployment, trained the client, and handed it over.",
    },
    notes: [
      { en: "The client agreed to publish the source code." },
      {
        en: "Data is in PostgreSQL through Prisma, with session sign-in for editors and configurable file storage.",
      },
      { en: "The site is live and in use by the client." },
    ],
    stack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Tailwind CSS"],
    links: {
      live: "https://starlinkautomation.space/",
      source: "https://github.com/GeorgeLuo404/starlink-automation",
    },
    image: {
      src: "/projects/starlink.png",
      alt: {
        en: "The Starlink Automation home page: the company's slogan over a dark network of points, with its services listed below",
      },
    },
  },
  {
    id: "ai-twin",
    start: "2026-03",
    featured: true,
    group: "ai",
    title: { en: "This portfolio and its AI twin" },
    summary: {
      en: "This site, in English and Chinese, with a chat that answers as me from my public profile. It's tested against on-topic, off-topic, and jailbreak questions, and it loads in mainland China without a VPN.",
    },
    part: { en: "Personal project, solo." },
    notes: [
      {
        en: "I built a first prototype in March 2026, and started the current version in October 2026.",
      },
      {
        en: "Replies stream from DeepSeek through the AI SDK, with a rate limit on the API. The whole public profile goes in the prompt, without retrieval.",
      },
      {
        en: "The site runs on Vercel with functions in Hong Kong. Testers on mainland networks and 316 of 324 probes across the three carriers reached it.",
      },
      {
        en: "The ASCII art is made while the site builds, and the koi are drawn in characters in the browser.",
      },
    ],
    stack: ["Next.js", "TypeScript", "AI SDK", "DeepSeek", "next-intl"],
    links: {
      live: "https://georgeluo.dev/",
      source: "https://github.com/GeorgeLuo404/AI-Portfolio",
    },
    image: {
      src: "/projects/ai-twin.png",
      alt: {
        en: "This site's hero: the AI / Web Engineer headline on its grid, the intro, and the two koi in characters",
      },
    },
  },
  {
    id: "agents-demo",
    start: "2025-05",
    end: "2025-06",
    group: "ai",
    title: { en: "Agents demo" },
    summary: {
      en: "Notebooks that try out tool-using LLM agents: OpenAI function calling, LangChain agents with memory, and several agents working together in LangGraph.",
    },
    part: { en: "Personal learning project." },
    stack: ["Python", "OpenAI API", "LangChain", "LangGraph"],
    links: { source: "https://github.com/GeorgeLuo404/Agents-Demo" },
  },
  {
    id: "pigstar",
    start: "2025-03",
    end: "2025-07",
    group: "web",
    title: { en: "PigStar" },
    summary: {
      en: "A social site for photo posts, with sign-in, comments, likes, and follows, multi-image uploads that run in parallel, and a feed that loads more as you scroll.",
    },
    part: { en: "Personal project, solo." },
    notes: [
      {
        en: "The feed uses cursor pagination and an Intersection Observer. Images go through Cloudinary and Next.js Image for automatic format and quality.",
      },
      {
        en: "Data is in Neon PostgreSQL through Prisma, with documented migrations for development and production.",
      },
    ],
    stack: [
      "Next.js",
      "TypeScript",
      "Prisma",
      "PostgreSQL",
      "Clerk",
      "Cloudinary",
    ],
    links: { source: "https://github.com/GeorgeLuo404/pigstar" },
  },
  {
    id: "codearmour",
    start: "2024-05",
    end: "2024-08",
    featured: true,
    group: "ai",
    title: { en: "CodeArmour" },
    summary: {
      en: "A VS Code extension that flags likely security flaws in code and explains them, using models that run on the developer's own machine.",
    },
    part: {
      en: "UNSW capstone, team of four, with a client. I built the extension's side panel and connected it to the local models.",
    },
    notes: [
      {
        en: "The extension and its webview are TypeScript, and talk over HTTP to a Python service that runs the models.",
      },
      {
        en: "The team's models detect a flaw, classify it by CWE, and write a description, using LineVul, a CodeBERT-based classifier, and CodeT5. I worked on the interface and the model API, not the model training.",
      },
      {
        en: "It's a prototype from a course, not a production security scanner.",
      },
    ],
    stack: ["TypeScript", "VS Code API", "Webview", "Python"],
    links: { source: "https://github.com/GeorgeLuo404/CodeArmour" },
    image: {
      src: "/projects/codearmour.png",
      alt: {
        en: "CodeArmour in VS Code: a C++ file with a flagged line and its hover note, and a side panel listing three vulnerabilities with generated explanations",
      },
    },
  },
  {
    id: "squad404",
    start: "2024-02",
    end: "2024-05",
    group: "ai",
    title: { en: "Few-shot image classification" },
    summary: {
      en: "Image classifiers that learn from 5 to 10 examples per class, across three yes-or-no tasks, comparing prototypical networks on MobileNetV2 and ResNet18.",
    },
    part: {
      en: "UNSW machine learning course, team of five. I did the preprocessing, data augmentation, and evaluation.",
    },
    stack: ["Python", "PyTorch"],
    links: { source: "https://github.com/GeorgeLuo404/Squad404" },
  },
  {
    id: "visionary-unicorns",
    start: "2023-05",
    end: "2023-08",
    group: "ai",
    title: { en: "Penguin and turtle detection" },
    summary: {
      en: "Detecting and classifying penguins and turtles in photos, comparing eight detector setups on original and augmented data.",
    },
    part: {
      en: "UNSW computer vision course, team of five. I converted the labels, and trained and evaluated the YOLOv8 detectors.",
    },
    stack: ["Python", "YOLOv8", "Google Colab"],
    links: {
      source: "https://github.com/GeorgeLuo404/Visionary-Unicorns-Project",
    },
  },
  {
    id: "ai-gen-image",
    start: "2023-03",
    end: "2023-03",
    group: "ai",
    title: { en: "AI image generator" },
    summary: {
      en: "A full-stack web app I built to try DALL·E 2's text-to-image generation.",
    },
    part: { en: "Personal project, solo. No longer maintained." },
    stack: ["React", "Vite", "Express", "MongoDB", "OpenAI API"],
    links: { source: "https://github.com/GeorgeLuo404/AI-Gen-Image" },
  },
];
