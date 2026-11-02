# AGENTS.md

Personal portfolio with an AI twin chat, built with Next.js and Sanity. Visitors are both in and outside mainland China, and the site is planned in English and Chinese.

Read [docs/ROADMAP.md](docs/ROADMAP.md) before starting work. It holds the task list, each task's scope, and the decisions behind them.

## Commands

Use pnpm.

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm exec tsc --noEmit` | Type check |
| `pnpm lint` | Biome check |
| `pnpm format` | Biome format |
| `pnpm typegen` | Regenerate `schema.json` and `sanity.types.ts` |

## Where things live

- `app/(portfolio)/`: the public site, with its own root layout.
- `app/(sanity)/studio/`: Sanity Studio at `/studio`, with its own root layout.
- `components/sections/`: one Server Component per page section, each fetching its own data with `defineQuery` and `sanityFetch`.
- `components/ui/`: shadcn and Aceternity components.
- `sanity/schemaTypes/`: the content schema.
- `sanity/lib/`: Sanity client, image URLs, and live content helpers.

There is no `app/layout.tsx`. Every page must sit inside a route group that has a root layout, because Next 16.4 fails the build otherwise.

Run `pnpm typegen` after changing a schema or a GROQ query. Don't edit `schema.json` or `sanity.types.ts` by hand.

## Rules

**Mainland China reachability**
- Pages must not depend on third-party hosts in visitors' browsers. That means no external scripts, analytics, or remote fonts, and no direct `cdn.sanity.io` image URLs.
- Render images with `next/image`, which serves them from our own domain.
- Check that any new script, font, image host, or API is reachable from the mainland before adding it.

**Hosting**
- Keep Vercel-specific APIs out of app code, because hosting may have to move after the T2b test.
- Keep the site non-commercial: no paid services, ads, affiliate links, or payment flows. The Vercel Hobby plan doesn't allow them.

**Data and secrets**
- The Sanity dataset is publicly readable without a login. Never store visitor data or anything private in it.
- Never pass a Sanity write token to the browser. Use a viewer-only token where the browser needs one.
- Server-only values must not use the `NEXT_PUBLIC_` prefix.
- Add every new environment variable to `.env.example` in the same change.

**Chat**
- Use the AI SDK with `@ai-sdk/deepseek`. Don't use OpenAI ChatKit or Agent Builder, which shuts down on November 30, 2026.
- Give the model portfolio content only. Exclude `contact` documents.

**Translations**
- From T3b onward, put user-facing text in translation files, not in components.

**Using upstream as a reference**
- [The upstream repo](https://github.com/sonnysangha/next-gen-ai-portfolio-openai-agentkit-sanity-clerk-nextjs-16) is the reference for section layouts, not a source to copy wholesale.
- Don't copy its dependency versions, which include vulnerable releases. Don't copy its use of `SANITY_API_TOKEN` as a browser token, or its contact form that writes to Sanity.
- Its README limits use of its code. It allows learning and portfolio demonstration, requires attribution, and asks for written permission for commercial use, redistribution, or deployment. Check the open items in `docs/ROADMAP.md` before deploying.

## Workflow

- Do one roadmap task per branch, named `<type>/t<N>-<slug>`, such as `chore/t1-upgrade-deps`.
- Merge each task with `git merge --no-ff`, so it stays a single merge commit that can be reverted.
- Before finishing a task, run the build, the type check, and lint.
- Update the task's status in `docs/ROADMAP.md` in the same branch.
- Ask before pushing, opening a PR, deploying, or changing an external account such as Vercel, Sanity, or DeepSeek.
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
