# AGENTS.md

Personal portfolio with an AI twin chat, built with Next.js. Visitors are both in and outside mainland China, and the site is planned in English and Chinese.

Read [docs/ROADMAP.md](docs/ROADMAP.md) before starting work. It holds the task list, each task's scope, and the decisions behind them.

Content will live in typed content files in the repo (T6). Don't add a CMS or a database for content.

## Commands

Use pnpm.

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm exec tsc --noEmit` | Type check |
| `pnpm lint` | Biome check |
| `pnpm format` | Biome format |

## Where things live

- `app/(portfolio)/`: the public site, with its own root layout. For now it holds a placeholder page, until the sections are built (T8).
- `app/globals.css`: Tailwind and the placeholder's styles. T5 turns the design tokens into the theme.
- `design/`: the T3 HTML prototype that the Figma file is captured from. App code doesn't import from it. See `docs/DESIGN.md`.

There is no `app/layout.tsx`. Every page must sit inside a route group that has a root layout, because Next 16.4 fails the build otherwise.

## Rules

**Mainland China reachability**
- Pages must not depend on third-party hosts in visitors' browsers. That means no external scripts, analytics, remote fonts, or images served from other hosts.
- Render images with `next/image`, which serves them from our own domain.
- Check that any new script, font, image host, or API is reachable from the mainland before adding it.

**Hosting**
- Keep Vercel-specific APIs out of app code, because hosting may have to move after the T2b test.
- Hosting stays outside mainland China for now, so no ICP filing is needed.
- Keep the site non-commercial: no paid services, ads, affiliate links, or payment flows. The Vercel Hobby plan doesn't allow them.

**Data and secrets**
- The repo is public. Never put visitor data or private details, such as a phone number or home address, in content, prompts, or commits.
- Server-only values must not use the `NEXT_PUBLIC_` prefix.
- Add every new environment variable to `.env.example` in the same change.

**Chat**
- Use the AI SDK with `@ai-sdk/deepseek`. Don't use OpenAI ChatKit or Agent Builder, which shuts down on November 30, 2026.
- Give the model public portfolio content only, in full in the system prompt rather than through RAG.
- Keep the `/api/chat` request and response format stable, so a different backend could replace it later.

**Translations**
- From T5 onward, put user-facing text in translation files, not in components.
- From T6 onward, content lives in typed content files, with English and Chinese side by side.

**Design**
- The layout closely follows a Dribbble concept by Faza Dzikrulloh, by George's choice (see T3 in `docs/ROADMAP.md`). Never reproduce its artwork, wording, or logo marks, and keep the credit to its designer.
- The grid lines are measured from the hero headline's letters, and display heading sizes are solved against them. If a display heading's words change, solve its size again (see `docs/DESIGN.md`).
- Once T3 is approved, build UI from `docs/DESIGN.md` and its Figma file, including its rules for Chinese text and both themes.

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

If `tsc` reports a missing module in `.next/dev/types` after a route is deleted, the generated types are stale. Delete `.next` and run it again.

Check UI changes in a browser as well as with the build. A hydration error from the Next 16.4 upgrade passed the build, the type check, and `curl`, and only showed up in the browser console.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
