# Roadmap

Each task gets its own branch, merge commit, and checkpoint tag, so any step can be undone on its own. See [AGENTS.md](../AGENTS.md) for the workflow.

## Status

Tasks are listed in the planned order. T2b keeps its number from an earlier plan and runs after T4. T3 and T4 don't depend on each other, so either can go first.

| # | Task | Status | Branch | Checkpoint |
|---|---|---|---|---|
| T0 | Baseline and project docs | Merged | `chore/t0-baseline-docs` | `checkpoint/t0` |
| T1 | Upgrade dependencies, remove Clerk and `/dashboard` | Merged | `chore/t1-upgrade-deps` | `checkpoint/t1` |
| T2a | Lint and CI | Merged | `chore/t2-lint-ci` | `checkpoint/t2a` |
| T3 | Design in Figma | In review | `docs/t3-design` | |
| T4 | Remove upstream code and Sanity | Not started | | |
| T2b | Vercel deploy and mainland test | Not started | | |
| T5 | Foundations | Not started | | |
| T6 | Content files | Not started | | |
| T7 | ASCII art | Not started | | |
| T8 | Sections | Not started | | |
| T9 | DeepSeek chat | Not started | | |
| T10 | Real content | Not started | | |
| T11 | Chinese translation | Not started | | |
| T12 | Clean public history | Not started | | |
| T13 | Production launch | Not started | | |

Optional work after launch is listed under [Later](#later).

The `checkpoint/baseline` tag marks the project as it was before this work started (commit `9a10424`).

## Tasks

### T0: Baseline and project docs
- Tag the baseline, and add `AGENTS.md`, `CLAUDE.md`, this roadmap, and `.env.example`.
- **Done when:** the docs are merged and the dev server runs normally.

### T1: Upgrade dependencies, remove Clerk and `/dashboard`
- Delete `app/dashboard/` and `components/ui/breadcrumb.tsx`. On Next 16.4, a page outside a root layout is a hard build error.
- Upgrade to Next 16.4, React 19.3, Sanity 6, next-sanity 13, and `@sanity/client` 8.
- Keep `@sanity/icons` on 3.x, because `sanity/structure.ts` uses icons that newer majors no longer export under those names.
- Update the `SanityImageSource` import and the deprecated default export in `sanity/lib/image.ts`.
- Remove Clerk from `app/(portfolio)/layout.tsx`, `components/ProfileImage.tsx`, `package.json`, and `.env.example`, and delete `proxy.ts`.
- Move `shadcn` to dev dependencies, because `app/globals.css` only needs it at build time.
- Add `packageManager` and `engines`, and allow the pnpm build scripts we need.
- Try forcing patched versions for the remaining advisories, and keep only those that don't break the build.
- Decide how to handle the block that Next 16.4 adds to `AGENTS.md` when `next dev` runs.
- Update `radix-ui`, because Slot 1.2.3 causes a sidebar hydration error on React 19.3.
- Add `--force` to `schema extract` in the `typegen` script, as Sanity 6 requires.
- **Done when:** the build and type check pass, the audit shows 0 critical advisories, and logging in and editing in Studio works in a real browser.

`pnpm.overrides` in `package.json` patches `js-yaml`, `smol-toml`, and `undici` where the Sanity CLI pins vulnerable versions. T4 removes them along with Sanity. `minimatch` stays unpatched because its fix needs a major jump, and it is only reached through the CLI.

### T2a: Lint and CI
- Fix the Biome errors, exclude the generated `sanity.types.ts` and `schema.json` from Biome, and add CI for lint, type check, and build.
- **Done when:** lint passes with no errors, and CI passes on GitHub.

### T3: Design in Figma
- Base the look on the style of the Dribbble shot "Hegia – Personal Website for Developer": electric blue on white and black, giant grotesk headings, thin grid lines, ASCII and dithered art, tag chips, numbered project rows, and a page that turns dark toward the end.
- Borrow the style only. Make the artwork, wording, logo marks, and exact composition our own, such as an ASCII portrait made from George's photo, and rewrite the shot's agency pitch for job hunting.
- Sections, in order: a hero with George's name, title, skill tags, ASCII portrait, and an "Ask my AI twin" box; selected work; a skills word stack; an experience accordion on dark; an open-to-roles call to action with email and WeChat ID; and a footer with the name in giant type and the language switch.
- Chinese: keep the giant English words as graphics in both languages, with a bold Chinese heading under them, and set Chinese on its own where the meaning matters, such as the job title. Use system fonts for Chinese body text, and a heavy Chinese display font such as Source Han Sans Heavy (OFL), trimmed to the characters used. An OFL pixel font with Chinese, such as Ark Pixel, is an option for labels.
- Leave out a light/dark toggle, because the page itself moves from light to dark.
- Build the design as a static HTML page under `design/` at 1440, 768, and 390 px wide, check it in a browser, then capture each width into a new Figma file in George's team. On Figma's Starter plan, MCP read calls are capped at about 20 a month, but creating files and capturing pages aren't counted. Starter files are reported to allow 3 pages: use them for foundations, the English pages, and the Chinese versions.
- Use placeholder text for George's title and projects until T10.
- Record the decisions, design tokens, and the Figma link in `docs/DESIGN.md`.
- **Result so far:** the prototype in `design/`, the [Figma file](https://www.figma.com/design/yOam3gCoyO0uew2262qVq9), and `docs/DESIGN.md`. Decided: the headline "AI/Web Engineer" and "AI/前端开发工程师", with the Chinese set on its own at the English height (option A).
- **Done when:** George approves the Figma file and `docs/DESIGN.md`.

### T4: Remove upstream code and Sanity
- Delete Studio (`app/(sanity)/`), `sanity/`, `sanity.config.ts`, `sanity.cli.ts`, `sanity.types.ts`, and `schema.json`.
- Delete the upstream-derived UI: `components/PortfolioContent.tsx`, `components/sections/HeroSection.tsx`, `components/ProfileImage.tsx`, `components/app-sidebar.tsx`, and the Aceternity components (`background-ripple-effect`, `layout-text-flip`), whose license bars redistributing their source. Also delete the shadcn components, hooks, and styles that nothing uses anymore.
- Remove the Sanity packages and `styled-components`, the `typegen` script, the `@sanity/icons` pin, the `pnpm.overrides` added for the Sanity CLI, the Sanity image host in `next.config.ts`, the Sanity variables in `.env.example` and CI, and the generated-file exclusions in `biome.json`.
- Replace the page with a minimal placeholder of our own, which T2b deploys.
- Update `AGENTS.md` for the new layout and commands.
- **Done when:** the build, type check, and lint pass, no Sanity package or upstream-derived file remains, and the audit is re-measured.

### T2b: Vercel deploy and mainland test
- George buys a `.com` domain through Vercel. A `.com` can move to a mainland registrar later if an ICP filing is ever needed.
- Connect the repo to Vercel, run functions in `hkg1` (Hong Kong), and deploy the T4 placeholder page on the custom domain.
- Test it on China Telecom, Unicom, and Mobile networks without a VPN, on several different days.
- **Done when:** the result is recorded here. If it fails, try a no-ICP option first, such as a static copy of the site on a host with better routing into China, which Vercel itself suggests. Hosting in the mainland isn't planned. The test can run at any point after T4, because the app stays free of Vercel-specific code.

### T5: Foundations
- Add `next-intl` with `/en` and `/zh` routes under `[locale]`, and a language switch. `/zh` falls back to English until T11.
- Self-host the T3 fonts with `next/font/local`, replacing the font setup in `app/globals.css` that currently renders Times, and set `lang` per locale (`zh-CN` for Chinese).
- Turn the T3 colors, type scale, spacing, and grid into Tailwind theme tokens.
- Build the header and footer.
- **Done when:** both routes render the header and footer at desktop, tablet, and phone widths.

### T6: Content files
- Define typed TypeScript content files with English and Chinese side by side. English is required. Chinese is optional until T11, then required.
- Write placeholder content of our own, so pages render before T10.
- Add one loader that both the sections and the chat use.
- **Done when:** a missing English field fails the type check, and `/zh` falls back to English.

### T7: ASCII art
- Write our own converter that turns an image into ASCII or dithered art when the site builds, with an optional animated version that respects the reduced-motion setting.
- Mark the art as decorative for screen readers.
- **Done when:** it renders a placeholder photo at all three widths without layout shift.

### T8: Sections
- Build each section from the Figma file at desktop, tablet, and phone widths, with text from translation and content files, and images through `next/image`.
- No services section, because the site doesn't advertise paid work.
- **Done when:** each section matches the Figma file at all three widths, and the browser makes no third-party requests.

### T9: DeepSeek chat
- Add an `/api/chat` route using the AI SDK and `deepseek-flash`, with the model ID in an environment variable.
- Put all public content in the system prompt, which DeepSeek caches cheaply. Don't use RAG: the content fits easily in the 1M-token context, retrieval can miss facts, and DeepSeek has no embeddings API.
- Write the prompts from our own requirements: answer only about George, politely decline other topics, and say so when the content doesn't cover a question.
- Keep a test set of on-topic, off-topic, and jailbreak questions, and run it before turning the chat on.
- Add the chat UI from T3 (the hero box and a chat panel), a rate limit on `/api/*`, and an on/off switch that defaults to off.
- Keep the `/api/chat` request and response format stable, so a different backend could replace it later.
- **Done when:** replies stream from a mainland network, the test set passes, and the rate limit works.

### T10: Real content
- George shares the resume and a photo outside the repo. Move only public facts into the content files, in English first, with no phone number or home address, because the repo is public.
- Use the photo for the ASCII portrait.
- **Done when:** no placeholder content remains.

### T11: Chinese translation
- Translate the UI and content. Claude drafts the Chinese, and George reviews the diff.
- Make the Chinese fields required, and trim the Chinese display font to the characters used.
- Have the chat answer in the visitor's language.
- **Done when:** `/zh` shows no leftover English, apart from names, technical terms, and the English display words kept as graphics.

### T12: Clean public history
- Re-run the similarity scan against upstream, and confirm no upstream-derived code remains apart from shared open-source parts such as shadcn.
- Publish the clean tree as a fresh history, either a new repo or a reset of this one, and make the old history private. George decides which, because both are hard to undo.
- Remove the upstream credit from `README.md` only after both steps, or keep a voluntary "inspired by" note. Credit the Dribbble designer there too, if their name is known.
- **Done when:** the public repo has no upstream-derived code anywhere in its history.

### T13: Production launch
- Set the production environment variables and the firewall rule, and rewrite `README.md`.
- Repeat the mainland test on the finished site.
- **Done when:** the production site passes the mainland test, and the T9 switch has a settled state.

### Later
Optional, after launch:
- **Agentic chat:** tools that let the chat open a project card or jump to a section, plus retrieval only if long-form content outgrows the prompt.
- **Contact form:** send messages by email without storing them, with validation and rate limiting.
- **Python chat service:** a FastAPI or LangGraph version behind the same `/api/chat` format, as a showcase.
- **Web admin:** Payload CMS on top of the T6 content model, if editing files gets in the way.

## Decisions

Decided on 2026-11-03 unless marked otherwise. Where a decision replaces an earlier one, its reason says so.

| Decision | Reason |
|---|---|
| Use the AI SDK and DeepSeek, not OpenAI ChatKit | Upstream's chat needs Agent Builder, which shuts down on 2026-11-30, and a DeepSeek key can't replace it. The AI SDK also makes the provider easy to change. OpenAI also blocks API calls from Vercel's Hong Kong region (noted 2026-11-05). |
| Remove Clerk, and let visitors chat without signing in | Clerk only gated the chat, and it needs an owned domain, DNS records, and separate OAuth credentials in production. |
| Protect the chat with a firewall rate limit and a small prepaid balance | Needs no extra service. Vercel Hobby includes one rate-limit rule, but it has no daily limit, so the balance caps spending. |
| Don't advertise paid work | Vercel Hobby is non-commercial, and its rules count advertising a service as commercial use. |
| Try Vercel first, on a custom domain | Cheap to test and easy to reverse. `*.vercel.app` is blocked in the mainland, and Vercel doesn't guarantee availability there. |
| Don't host in mainland China for now (2026-11-05) | Hosting outside the mainland, Hong Kong included, needs no ICP filing. If T2b fails, try a no-ICP option first. Replaces the 2026-11-03 plan to fall back to mainland hosting with an ICP filing. |
| Do the i18n setup at T5, and translation at T11 | Adding it late means moving every route, redoing every section, and migrating content. |
| Keep the block that `next dev` adds to `AGENTS.md` | It points agents to docs matching the installed Next version, and committing it avoids a dirty diff after every dev run. |
| Keep the GitHub repo public | Owner's choice. Everything committed is public, so private details stay out of the repo. |
| Build our own design, and stop porting upstream (2026-11-04) | Copyright covers code, not ideas, so once no upstream-derived code remains, its permission and attribution terms no longer apply. It also avoids porting sections that a later redesign would throw away. |
| Base the design on the style of a Dribbble shot, not its artwork (2026-11-05) | George's choice of look. A style is free to borrow, but the shot's artwork, wording, logo marks, and exact composition belong to its designer. |
| Design in HTML first, then capture it into Figma (2026-11-05) | Figma's Starter plan caps MCP read calls at about 20 a month, but creating files and capturing pages aren't counted. The HTML page also serves as the reference for T5 and T8. |
| No light/dark toggle (2026-11-05) | The design moves from light to dark down the page by itself. |
| Replace Sanity with typed content files in the repo (2026-11-05) | One editor, little content, rare changes. Files need nothing running, keep pages fully static for mainland visitors, get version history and rollback from git, turn translation into a reviewable diff, and let the Chinese font be trimmed at build time. Payload CMS can sit on top later if a web admin is wanted. Replaces the 2026-11-03 decision to keep Sanity. |
| Give the chat full context, not RAG (2026-11-05) | The content fits easily in `deepseek-flash`'s 1M-token context and caches cheaply. Retrieval can miss facts, and DeepSeek has no embeddings API. |
| Keep the chat in TypeScript (2026-11-05) | One codebase and one deploy. A Python service can replace it later behind the same API. |
| Link to email and WeChat at launch, and add a contact form later (2026-11-05) | Less to build and to protect from spam. A later form sends email and stores nothing. Replaces the 2026-11-03 plan to build the form before launch. |

## Open items

| Item | Needed by | Owner |
|---|---|---|
| Buy a `.com` domain through Vercel | T2b | George |
| Find a tester on a mainland network without a VPN | T2b | George |
| Share the resume and a photo, outside the repo | T10 | George |
| Find the Dribbble designer's name, for an optional credit | T12 | George |
| Keep the upstream credit in `README.md` while upstream-derived code remains | Until T12 | Everyone |
| Decide whether the chat stays on for mainland visitors, given China's rules on public AI services | T13 | George |
| Delete the Clerk app and remove its keys from `.env.local` | Now | George |
| Delete the Sanity project and remove its values from `.env.local` | After T4 | George |

## Baseline measurements

Taken on 2026-11-03 at `checkpoint/baseline`.

| Check | Result |
|---|---|
| Build and type check | Pass |
| Biome | 23 errors, 8 warnings |
| Production audit | 258 advisories: 8 critical, 101 high, 126 moderate, 23 low |
| Sections built | 1 of 12 (Hero) |
| Sanity content | 109 published sample documents in a public dataset named `development` |

## After T1

Taken on 2026-11-03 on `chore/t1-upgrade-deps`.

| Check | Result |
|---|---|
| Build and type check | Pass |
| Biome | 19 errors, 7 warnings |
| Production audit | 1 advisory: 1 moderate (`minimatch`) |
| Full audit, including dev dependencies | 2 advisories: 1 moderate (`minimatch`), 1 low (`deepmerge`, no fix published) |
| Third-party hosts contacted by the public page | `*.api.sanity.io` only, from `SanityLive` (removed in T4) |
| Studio in a real browser | Login, saving a draft to Sanity, and discarding it all work |
| Fresh clone with a frozen install and no Clerk keys | Build, type check, and typegen pass |

## After T2a

Taken on 2026-11-03 on `chore/t2-lint-ci`.

| Check | Result |
|---|---|
| Biome | 0 errors, 0 warnings |
| CI steps in a fresh clone with only the workflow's values | Install, lint, build, and type check pass |
| CI on GitHub | Pass, on commit `6e42f8f` |
