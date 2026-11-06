# Roadmap

Each task gets its own branch, merge commit, and checkpoint tag, so any step can be undone on its own. See [AGENTS.md](../AGENTS.md) for the workflow.

## Status

Tasks are listed in the planned order. T2b keeps its number from an earlier plan and runs after T4. T3 and T4 don't depend on each other, so either can go first.

| # | Task | Status | Branch | Checkpoint |
|---|---|---|---|---|
| T0 | Baseline and project docs | Merged | `chore/t0-baseline-docs` | `checkpoint/t0` |
| T1 | Upgrade dependencies, remove Clerk and `/dashboard` | Merged | `chore/t1-upgrade-deps` | `checkpoint/t1` |
| T2a | Lint and CI | Merged | `chore/t2-lint-ci` | `checkpoint/t2a` |
| T3 | Design in Figma | Merged | `docs/t3-design` | `checkpoint/t3` |
| T4 | Remove upstream code and Sanity | Merged | `chore/t4-remove-upstream` | `checkpoint/t4` |
| T2b | Vercel deploy and mainland test | Not started | | |
| T5 | Foundations | Merged | `feat/t5-foundations` | `checkpoint/t5` |
| T6 | Content files | Merged | `feat/t6-content-files` | `checkpoint/t6` |
| T7 | ASCII art | Merged | `feat/t7-ascii-art` | `checkpoint/t7` |
| T8 | Sections | Merged | `feat/t8-sections` | `checkpoint/t8` |
| T9 | DeepSeek chat | Merged | `feat/t9-chat` | `checkpoint/t9` |
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
- Follow the Dribbble shot "Hegia – Personal Website for Developer" by Faza Dzikrulloh as closely as possible, as George asked on 2026-11-05: its composition, a grid whose lines run along the headline's letters, giant grotesk headings, electric blue on white and black, tag chips, a dark accordion, and a page that turns dark toward the end.
- Make the artwork, wording, and logo marks our own, such as the hero's two koi drawn in characters, and rewrite the shot's agency pitch for job hunting. Credit the designer in the footer.
- Sections, in order: a hero with the title, skill tags, intro, the koi art with a photo reveal, and the "Ask my AI twin" window; selected work; a skills word stack; an experience accordion on dark; a call to action with email and WeChat ID; and a footer with the name in giant type and the language switch.
- Chinese: keep the giant English words as graphics in both languages, the hero title included, with a bold Chinese heading as the real heading. Use George's Chinese name, 罗卓君. Use system fonts for Chinese body text, and a heavy Chinese display font such as Source Han Sans Heavy (OFL), trimmed to the characters used.
- Light and dark themes: follow the system setting, with a switch in the header.
- Build the design as a static HTML page under `design/` at 1440, 768, and 390 px wide, check it in a browser, then capture each width into a new Figma file in George's team. On Figma's Starter plan, MCP read calls are capped at about 20 a month, but creating files and capturing pages aren't counted. Starter files are reported to allow 3 pages: use them for foundations, the English pages, and the Chinese versions.
- Use placeholder text for George's title and projects until T10.
- Record the decisions, design tokens, and the Figma link in `docs/DESIGN.md`.
- **Result so far:** the prototype in `design/`, the [Figma file](https://www.figma.com/design/yOam3gCoyO0uew2262qVq9), and `docs/DESIGN.md`. Decided: the headline "AI / Web Engineer" on both pages, with "AI / 前端开发工程师" as the Chinese heading. On 2026-11-05 George replaced the tree with two koi in a yin-yang, for his sign, Pisces, and a button that swaps them for his photo. On 2026-11-06 the Figma file was captured again from this version: Foundations at 1440, English at 1440 (light and dark), 768, and 390, and Chinese at 1440 and 390.
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
- Connect the repo to Vercel, run functions in `hkg1` (Hong Kong), and deploy the site on the custom domain.
- Test it on China Telecom, Unicom, and Mobile networks without a VPN, on several different days.
- Finish T9's two deployed checks: chat replies stream on those networks (with `DEEPSEEK_API_KEY` and `CHAT_ENABLED=true` set in Vercel), and a firewall rate limit on `/api/*` works.
- **Done when:** the result is recorded here. If it fails, try a no-ICP option first, such as a static copy of the site on a host with better routing into China, which Vercel itself suggests. Hosting in the mainland isn't planned. The test can run at any point after T4, because the app stays free of Vercel-specific code.

### T5: Foundations
- Add `next-intl` with `/en` and `/zh` routes under `[locale]`, and a language switch. `/zh` falls back to English until T11.
- Self-host the T3 fonts with `next/font/local`, and set `lang` per locale (`zh-CN` for Chinese).
- Turn the T3 colors, type scale, spacing, and grid into Tailwind theme tokens.
- Build the header and footer.
- **Done when:** both routes render the header and footer at desktop, tablet, and phone widths.

### T6: Content files
- Define typed TypeScript content files with English and Chinese side by side. English is required. Chinese is optional until T11, then required.
- Write placeholder content of our own, so pages render before T10.
- Add one loader that both the sections and the chat use.
- **Done when:** a missing English field fails the type check, and `/zh` falls back to English.
- Built as `content/`: one file per topic, the shapes in `content/types.ts`, and `getContent(locale)` in `content/index.ts`. `content/types.check.ts` holds type tests, so `tsc` fails if English stops being required. Facts about George moved there from the translation files: the chips, the Chinese name, and the contact details.

### T7: ASCII art
- Generate the fixed ASCII art when the site builds, from `design/scripts/render-ascii.mjs`, and add our own converter for images, such as project screenshots.
- Port the hero's koi and photo reveal from `design/koi.js` to a client component. Keep the load animation optional, pause the koi off screen, and hold them still with reduced motion.
- Mark the art as decorative for screen readers, and give the photo alt text.
- **Done when:** the koi, the ripples, and a converted placeholder image render at all three widths without layout shift.
- Built as `lib/ascii/` (the fixed art and a converter using sharp, both run while the site builds), `lib/koi/engine.ts`, and `components/koi-figure.tsx`. The placeholder page stacks the art until T8 moves it into the sections, and the footer has its still koi. The placeholder image in `public/projects/` is our own sketch of a chat window. A converted image keeps its background blank and takes the ink color, like the other fixed art. The load animation is on by default, with an `intro` prop to turn it off, and off with reduced motion.

### T8: Sections
- Build each section from the Figma file at desktop, tablet, and phone widths, with text from translation and content files, and images through `next/image`.
- No services section, because the site doesn't advertise paid work.
- **Done when:** each section matches the Figma file at all three widths, and the browser makes no third-party requests.
- Built in `components/sections/`, with each element's position measured against the T3 prototype, which the Figma file was captured from. The AI twin's window and its buttons are a picture until T9 wires them up, and the contact panel's AI twin button goes to that window until then. Project links, project two and three, and the screenshots stay placeholders until T10.

### T9: DeepSeek chat
- Add an `/api/chat` route using the AI SDK and `deepseek-flash`, with the model ID in an environment variable.
- Put all public content in the system prompt, which DeepSeek caches cheaply. Don't use RAG: the content fits easily in the 1M-token context, retrieval can miss facts, and DeepSeek has no embeddings API.
- Write the prompts from our own requirements: answer only about George, politely decline other topics, and say so when the content doesn't cover a question.
- Keep a test set of on-topic, off-topic, and jailbreak questions, and run it before turning the chat on.
- Add the chat UI from T3 (the hero box and a chat panel), a rate limit on `/api/*`, and an on/off switch that defaults to off.
- Keep the `/api/chat` request and response format stable, so a different backend could replace it later.
- **Done when:** replies stream from a mainland network, the test set passes, and the rate limit works.
- Built as `app/api/chat/route.ts`, `lib/chat/`, `components/chat/`, and `scripts/chat/`, documented in `docs/CHAT.md`. AI SDK 7 and `@ai-sdk/deepseek` 3, with DeepSeek's thinking mode off. The twin speaks as George in the first person but never commits to anything for him, a declined reply is marked in the response so the page shows it in grey, and the conversation lasts for the browser tab. While the chat is off, the twin window says so and offers email. The test set passes. Two parts wait for a deployment: the mainland streaming test (T2b) and the firewall rate limit (T2b, T13).

### T10: Real content
- George shares the resume outside the repo. Move only public facts into the content files, in English first, with no phone number or home address, because the repo is public.
- Replace the placeholder project images with screenshots.
- **Done when:** no placeholder content remains.

### T11: Chinese translation
- Translate the UI and content. Claude drafts the Chinese, and George reviews the diff.
- Make the Chinese fields required, and trim the Chinese display font to the characters used.
- Have the chat answer in the visitor's language.
- **Done when:** `/zh` shows no leftover English, apart from names, technical terms, and the English display words kept as graphics.

### T12: Clean public history
- Re-run the similarity scan against upstream, and confirm no upstream-derived code remains apart from shared open-source parts such as shadcn.
- Publish the clean tree as a fresh history, either a new repo or a reset of this one, and make the old history private. George decides which, because both are hard to undo.
- Remove the upstream credit from `README.md` only after both steps, or keep a voluntary "inspired by" note. Credit the Dribbble designer, Faza Dzikrulloh, there too.
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
| Follow a Dribbble shot's composition closely, with our own artwork and words (2026-11-05) | George's choice. Layout and grid are design ideas, while the shot's artwork, wording, and logo belong to its designer, Faza Dzikrulloh, who is credited in the footer. Replaces that morning's decision to borrow the style only. |
| Measure the grid lines from the hero headline's letters (2026-11-05) | It's what makes the reference look engineered, and George asked for it. Other display headings are sized so their letters land on the same lines. |
| Keep English display words on the Chinese page, the hero title included (2026-11-05) | George's choice. The Chinese heading beside each graphic carries the meaning. Replaces setting the Chinese hero title on its own. |
| Design in HTML first, then capture it into Figma (2026-11-05) | Figma's Starter plan caps MCP read calls at about 20 a month, but creating files and capturing pages aren't counted. The HTML page also serves as the reference for T5 and T8. |
| Light and dark themes with a switch (2026-11-05) | George asked for both. The page follows the system setting until the visitor picks one. Replaces that morning's decision to leave the toggle out. |
| Replace Sanity with typed content files in the repo (2026-11-05) | One editor, little content, rare changes. Files need nothing running, keep pages fully static for mainland visitors, get version history and rollback from git, turn translation into a reviewable diff, and let the Chinese font be trimmed at build time. Payload CMS can sit on top later if a web admin is wanted. Replaces the 2026-11-03 decision to keep Sanity. |
| Give the chat full context, not RAG (2026-11-05) | The content fits easily in `deepseek-flash`'s 1M-token context and caches cheaply. Retrieval can miss facts, and DeepSeek has no embeddings API. |
| Keep the chat in TypeScript (2026-11-05) | One codebase and one deploy. A Python service can replace it later behind the same API. |
| Link to email and WeChat at launch, and add a contact form later (2026-11-05) | Less to build and to protect from spam. A later form sends email and stores nothing. Replaces the 2026-11-03 plan to build the form before launch. |
| The AI twin speaks as George, in the first person (2026-11-06) | George's choice. The site already speaks in his voice ("Ask my AI twin"), and visitors call him "you". The twin never commits to offers, interviews, start dates, or pay, and says it's an AI when asked. Replaces that day's choice of the third person. |
| Keep a visitor's conversation for the browser tab (2026-11-06) | George's choice. It survives a reload and ends with the tab, and nothing is stored on the server. |
| While the chat is off, keep the twin window and say it's offline (2026-11-06) | George's choice. The hero keeps its design, and visitors get the email address instead. |
| Convert images to ASCII art while the site builds, with sharp (2026-11-06) | George's choice. The art ships in the HTML, so visitors download no converter and see it before any script runs. Next already installs sharp for its own image resizing, so it adds no new package to the install. |

## Open items

| Item | Needed by | Owner |
|---|---|---|
| Buy a `.com` domain through Vercel | T2b | George |
| Find a tester on a mainland network without a VPN | T2b | George |
| Share the resume, outside the repo | T10 | George |
| Keep the upstream credit in `README.md` while upstream-derived code remains | Until T12 | Everyone |
| Decide whether the chat stays on for mainland visitors, given China's rules on public AI services | T13 | George |
| Delete the Clerk app and remove its keys from `.env.local` | Now | George |
| Delete the Sanity project and remove its values from `.env.local` | Now that T4 is done | George |

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

## After T4

Taken on 2026-11-06 on `chore/t4-remove-upstream`.

| Check | Result |
|---|---|
| Build, type check, and Biome | Pass, 0 errors, 0 warnings |
| Production audit | No known vulnerabilities |
| Full audit, including dev dependencies | No known vulnerabilities |
| Dependencies | `next`, `react`, `react-dom`, plus dev tools. Sanity, `styled-components`, shadcn, Radix, Motion, and their helpers are gone, along with the `pnpm.overrides` for the Sanity CLI |
| Third-party hosts contacted by the public page | None. The placeholder uses system fonts |
| Routes | `/` only. `/studio` is gone |

## After T5

Taken on 2026-11-06 on `feat/t5-foundations`.

| Check | Result |
|---|---|
| Build, type check, and Biome | Pass, 0 errors, 0 warnings |
| Routes | `/en` and `/zh`, both static. `/` redirects by the browser's language |
| Header and footer | Checked at 1440, 768, and 390, in both languages and both themes, with the phone menu |
| Third-party hosts contacted by the page | None. Archivo and JetBrains Mono are self-hosted, and Chinese uses system fonts |

## After T6

Taken on 2026-11-06 on `feat/t6-content-files`.

| Check | Result |
|---|---|
| Build, type check, and Biome | Pass, 0 errors, 0 warnings |
| A project title with only Chinese | Fails the type check: `Property 'en' is missing` |
| `/zh` with the Chinese intro removed, then set to "" | Shows the English intro both times |
| Content without Chinese yet | The start date and the résumé link, which fall back to English |
| Saved theme after switching language | Kept both ways, with no console errors. Before this fix, the switch cleared it and React warned about the theme script |

## After T7

Taken on 2026-11-06 on `feat/t7-ascii-art`.

| Check | Result |
|---|---|
| Build, type check, and Biome | Pass, 0 errors, 0 warnings |
| Layout shift | None at 375, 768, and 1440: every element sits in the same place with scripts on and off |
| Fixed art against the prototype | The ripples and the orbit object match `design/ascii.js` character for character |
| Photo reveal | Works both ways in both languages and both themes. With reduced motion, the photo swaps in without the animation |
| Page size | `/en` is 71 KB of HTML, 13 KB compressed, with the art. The koi code adds 32 KB of JavaScript before compression |
| Third-party hosts contacted by the page | None. The photo comes from `/_next/image` about 2 seconds after load |

## After T8

Taken on 2026-11-06 on `feat/t8-sections`.

| Check | Result |
|---|---|
| Build, type check, and Biome | Pass, 0 errors, 0 warnings |
| Sections against the prototype | Every measured element in the hero, Selected work, Skills, Experience, Contact, and the footer sits at the same position and size at 375, 768, and 1440. The exceptions are on purpose: the first project's placeholder screenshots, and the art button on phones (see T7) |
| Layout shift | None: with scripts off, every section starts where it does with scripts on |
| Chinese page | One `h1` and an `h2` per section, all in Chinese, with the English display words hidden from screen readers. No duplicate IDs |
| Page size | 175 KB of HTML, 27 KB compressed, with all the art |
| Third-party hosts contacted by the page | None |

## After T9

Taken on 2026-11-06 on `feat/t9-chat`.

| Check | Result |
|---|---|
| Build, type check, and Biome | Pass, 0 errors, 0 warnings |
| Test set (`pnpm chat:test`) | 38 of 38: on-topic, first-person, private, commitment, off-topic, and jailbreak questions in English and Chinese |
| Chat in the browser | Opens from the hero, header, phone menu, and contact panel. Streams replies, shows declines in grey, closes with Esc, and keeps the conversation through a reload |
| Chat switched off | The twin window says it's offline and offers email, the Ask links go to it, and `/api/chat` answers 503 |
| API key | Not in any built file, for the browser or the server |
| Still to do | Stream replies from a mainland network, and add the firewall rate limit, once the site is deployed (T2b) |
