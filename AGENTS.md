# AGENTS.md

Personal portfolio with an AI twin chat, built with Next.js. Visitors are both in and outside mainland China, and the site is planned in English and Chinese.

Read [docs/ROADMAP.md](docs/ROADMAP.md) before starting work. It holds the task list, each task's scope, and the decisions behind them.

Content lives in typed content files in `content/`. Don't add a CMS or a database for content.

## Commands

Use pnpm.

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm exec tsc --noEmit` | Type check |
| `pnpm lint` | Biome check |
| `pnpm format` | Biome format |
| `pnpm chat:test` | Run the AI twin's test set against the dev server (needs `CHAT_ENABLED=true`) |

## Where things live

- `app/(portfolio)/[locale]/`: the public site in English (`/en`) and Chinese (`/zh`), with its root layout. The home page renders the sections in order.
- `app/globals.css`: the design tokens as Tailwind theme values, both themes, and the grid lengths measured from the headline.
- `app/fonts/`: Archivo and JetBrains Mono, self-hosted, with their OFL licenses.
- `components/`: the header, footer, and their parts, such as pixel icons and the language switch. `koi-figure.tsx` is the hero's koi and photo, and `ascii-art.tsx` renders the fixed art.
- `components/sections/`: the home page's sections, from the hero to Contact. Each matches the T3 prototype at 375, 768, and 1440 pixels wide.
- `lib/ascii/`: the ASCII art made while the site builds: the ripples and objects (`scenes.ts`) and the image converter (`image.ts`, using sharp). Visitors get the characters in the HTML and never download this code.
- `lib/koi/engine.ts`: the koi drawing and the photo reveal, with no DOM code, so the server draws the footer's still pair and the browser animates the hero's.
- `public/`: George's photo and the project images. Strip a photo's metadata before adding it, because the repo is public.
- `content/`: every fact about George, such as projects, skills, roles, and contact details, typed in `content/types.ts` with English and Chinese side by side. Sections and the AI twin both read it through `getContent(locale)`, which falls back to English for any field without Chinese, until T11.
- `i18n/` and `messages/`: next-intl routing and the English and Chinese interface text, such as headings, labels, and buttons. Chinese falls back to English for any message it lacks, until T11.
- `app/api/chat/` and `lib/chat/`: the AI twin's route, its instructions, and its switches. `app/(portfolio)/[locale]/chat/` is the chat page, `components/chat/` has its view and the hero's twin window, and `scripts/chat/` the test set. See `docs/CHAT.md`.
- `proxy.ts`: sends `/` to `/en` or `/zh` from the visitor's language. Next 16 calls middleware "proxy".
- `vercel.json`: runs the functions in Hong Kong (`hkg1`). It's the only Vercel-specific file.
- `design/`: the T3 HTML prototype that the Figma file is captured from. App code doesn't import from it. See `docs/DESIGN.md`.

There is no `app/layout.tsx`. Every page must sit inside a route group that has a root layout, because Next 16.4 fails the build otherwise.

## Rules

**Mainland China reachability**
- Pages must not depend on third-party hosts in visitors' browsers. That means no external scripts, analytics, remote fonts, or images served from other hosts.
- Render images with `next/image`, which serves them from our own domain.
- Check that any new script, font, image host, or API is reachable from the mainland before adding it.

**Hosting**
- Keep Vercel-specific APIs out of app code, so hosting can still move. The T2b mainland test passed, so the site stays on Vercel for now.
- Hosting stays outside mainland China for now, so no ICP filing is needed. The domain is `georgeluo.dev`, bought through Vercel. A `.dev` can't be used for an ICP filing, so a move into the mainland would need another domain.
- Check mainland reachability with `docs/MAINLAND-TEST.md`, at T2b and again at T13.
- Keep the site non-commercial: no paid services, ads, affiliate links, or payment flows. The Vercel Hobby plan doesn't allow them.

**Data and secrets**
- The repo is public. Never put visitor data or private details, such as a phone number or home address, in content, prompts, or commits.
- Server-only values must not use the `NEXT_PUBLIC_` prefix.
- Add every new environment variable to `.env.example` in the same change.

**Chat**
- Use the AI SDK with `@ai-sdk/deepseek`. Don't use OpenAI ChatKit or Agent Builder, which shuts down on November 30, 2026.
- Give the model public portfolio content only, in full in the system prompt rather than through RAG.
- Keep the `/api/chat` request and response format stable, so a different backend could replace it later. `docs/CHAT.md` documents it.
- Run `pnpm chat:test` after changing the instructions or the content, and before turning the chat on in production. Run it against the dev server: the live site's rate limit (20 requests a minute per IP) blocks a full run.
- Don't store or log what visitors type.

**Translations**
- From T5 onward, put user-facing text in translation files, not in components.
- From T6 onward, facts about George go in `content/`, with English and Chinese side by side. Interface wording goes in `messages/`.
- Never put a phone number, home address, or anything else private in `content/`, because the chat repeats it to anyone.

**Design**
- The layout closely follows a Dribbble concept by Faza Dzikrulloh, by George's choice (see T3 in `docs/ROADMAP.md`). Never reproduce its artwork, wording, or logo marks, and keep the credit to its designer.
- The grid lines are measured from the hero headline's letters, and display heading sizes are solved against them. If a display heading's words change, solve its size again (see `docs/DESIGN.md`).
- Once T3 is approved, build UI from `docs/DESIGN.md` and its Figma file, including its rules for Chinese text and both themes.
- iOS Safari zooms the whole page into a field whose text is under 16px. `app/globals.css` raises fields to 16px on iOS only, so don't override a field's font size there.
- Tailwind's `text-xs` and `text-sm` set their own line height. For body text, write the size, such as `text-[14px]`, so the design's 1.55 line height carries through.
- On the Chinese page, an English display heading is a graphic (`aria-hidden`, `lang="en"`), and a Chinese `h2` beside it carries the section's name.

**Upstream**
- This project started from [an upstream repo](https://github.com/sonnysangha/next-gen-ai-portfolio-openai-agentkit-sanity-clerk-nextjs-16) whose README limits use of its code. T4 removed the upstream-derived code, and T12 cleans the public history.
- Don't copy, paraphrase, or port code, schemas, prompts, or sample content from upstream. Build from `docs/DESIGN.md` and the project's own requirements instead.
- Keep the upstream credit in `README.md` until T12 confirms no derived code remains.

## Workflow

- Do one roadmap task per branch, named `<type>/t<N>-<slug>`, such as `chore/t1-upgrade-deps`.
- Merge each task with `git merge --no-ff`, so it stays a single merge commit that can be reverted.
- Before finishing a task, run the build, the type check, and lint.
- Update the task's status in `docs/ROADMAP.md` in the same branch.
- Ask before pushing, opening a PR, deploying, or changing an external account such as Vercel, Sanity, DeepSeek, or Figma.
- Write commit messages as `type: Summary`.

After a task merges, tag the merge commit `checkpoint/t<N>`. To undo a task, run `git revert -m 1 <merge commit>`. To inspect an earlier state, run `git switch --detach checkpoint/t<N>`.

## Troubleshooting

If the dev server compiles for minutes or logs `Can't resolve 'tailwindcss'`, the `.next` cache is stale. Stop the server, delete `.next`, and start it again.

If `tsc` reports a missing module in `.next/dev/types` after a route is deleted, the generated types are stale. Delete `.next` and run it again. Route types such as `PageProps` come from Next, so after deleting `.next`, run `pnpm exec next typegen` or a build before `tsc`.

React clears every attribute on `<html>` that it didn't render itself whenever the layout remounts, such as after switching language. Anything a script sets there, like the theme, has to be set again from a client component (see `components/theme-toggle.tsx`).

The koi only move while the page is visible. Some embedded browsers, such as Claude's preview pane, report a shown page as hidden and run almost no animation frames. In development, run `KOI.step(seconds)` in the console to move them on by hand.

Check UI changes in a browser as well as with the build. A hydration error from the Next 16.4 upgrade passed the build, the type check, and `curl`, and only showed up in the browser console.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
