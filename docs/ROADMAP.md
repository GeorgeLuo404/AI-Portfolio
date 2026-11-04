# Roadmap

Each task gets its own branch, merge commit, and checkpoint tag, so any step can be undone on its own. See [AGENTS.md](../AGENTS.md) for the workflow.

## Status

| # | Task | Status | Branch | Checkpoint |
|---|---|---|---|---|
| T0 | Baseline and project docs | Merged | `chore/t0-baseline-docs` | `checkpoint/t0` |
| T1 | Upgrade dependencies, remove Clerk and `/dashboard` | Merged | `chore/t1-upgrade-deps` | `checkpoint/t1` |
| T2a | Lint and CI | Merged | `chore/t2-lint-ci` | `checkpoint/t2a` |
| T2b | Vercel deploy and mainland go/no-go test | Not started | | |
| T3 | Design direction | Not started | | |
| T4 | Own content model | Not started | | |
| T5 | Layout shell and i18n setup | Not started | | |
| T6 | Sections | Not started | | |
| T7 | Contact form that sends email | Not started | | |
| T8 | Draft mode and webhook content updates | Not started | | |
| T9 | DeepSeek chat | Not started | | |
| T10 | Real content | Not started | | |
| T11 | Chinese translation | Not started | | |
| T12 | Clean public history | Not started | | |
| T13 | Production launch | Not started | | |

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

`pnpm.overrides` in `package.json` patches `js-yaml`, `smol-toml`, and `undici` where the Sanity CLI pins vulnerable versions. Remove them once the CLI ships patched versions. `minimatch` stays unpatched because its fix needs a major jump, and it is only reached through the CLI.

### T2a: Lint and CI
- Fix the Biome errors, exclude the generated `sanity.types.ts` and `schema.json` from Biome, and add CI for lint, type check, and build.
- **Done when:** lint passes with no errors, and CI passes on GitHub.

### T2b: Vercel deploy and mainland go/no-go test
- Connect Vercel with a custom domain, and run functions in `hkg1`.
- Deploy a minimal test page of our own, not upstream-derived code, then test it on China Telecom, Unicom, and Mobile networks without a VPN, on several different days.
- **Done when:** the test result is recorded here. If it fails, switch hosting (see the fallback under Decisions). It can run at any point, because the app stays free of Vercel-specific code.

### T3: Design direction
- Agree on the look and structure before writing UI: references George likes, the sections and their order, typography, colors, light and dark modes, and how Chinese text should look.
- Record the result in `docs/DESIGN.md`.
- **Done when:** George approves `docs/DESIGN.md`.

### T4: Own content model
- Write new Sanity schemas and Studio structure from the design and George's actual content, with English and Chinese fields from the start (`sanity-plugin-internationalized-array`).
- Delete the upstream schemas, `sanity/structure.ts`, and all upstream sample documents, including `contact` and `service`.
- Add a small seed of placeholder content we write ourselves, so the site can render before T10.
- **Done when:** typegen passes, Studio edits the new types in both languages, and no upstream schema or sample document remains.

### T5: Layout shell and i18n setup
- Add `next-intl`, `/en` and `/zh` routes under `[locale]`, a language switch, and a system font stack for Chinese.
- Build our own header, footer, theme toggle, and chat sidebar shell, following `docs/DESIGN.md`.
- Replace `components/ProfileImage.tsx`, `components/app-sidebar.tsx`, and the Aceternity components (`background-ripple-effect`, `layout-text-flip`), whose license bars redistributing their source.
- Fix the font setup in `app/globals.css`, which currently renders Times instead of the intended font.
- **Done when:** both routes render at desktop and phone widths, in light and dark modes, and `/zh` falls back to English until T11.

### T6: Sections
- Build each section from `docs/DESIGN.md` and the T4 schemas, replacing the current Hero. Upstream is not used as a code reference.
- Use translatable text and `next/image`. No Services section, because the site doesn't advertise paid work.
- **Done when:** each section renders at desktop and phone widths, with no third-party requests in the browser.

### T7: Contact form
- Send messages by email through Resend, and don't store them. Check Resend's current limits and its reachability first.
- Add input validation and rate limiting.
- **Done when:** a test message arrives, and bad input and repeated requests are rejected.

### T8: Draft mode and webhook content updates
- Add draft mode and visual editing with a viewer-only token.
- Update public pages through a Sanity webhook, in place of the browser connection that `SanityLive` opens.
- **Done when:** published edits reach the live page, and visitors' browsers make no requests to Sanity.

### T9: DeepSeek chat
- Add an `/api/chat` route using the AI SDK and `deepseek-flash`, with the model ID in an environment variable.
- Put a snapshot of portfolio content in the system prompt, and write the prompts from our own requirements.
- Add the chat UI to the sidebar, a rate limit on `/api/*`, and an on/off switch that defaults to off.
- **Done when:** replies stream from a mainland network, off-topic questions are declined, and the rate limit works.

### T10: Real content
- Replace the placeholder content with George's real content, in English first.
- Decide whether to keep the dataset name `development` or move to a new `production` dataset.
- **Done when:** no placeholder content remains.

### T11: Chinese translation
- Translate the UI and content, and have the chat answer in the visitor's language.
- **Done when:** `/zh` shows no leftover English, apart from names and terms meant to stay in English.

### T12: Clean public history
- Re-run the similarity scan against upstream, and confirm no upstream-derived code remains apart from shared open-source parts such as shadcn.
- Publish the clean tree as a fresh history, either a new repo or a reset of this one, and make the old history private. George decides which, because both are hard to undo.
- Remove the upstream credit from `README.md` only after both steps, or keep a voluntary "inspired by" note.
- **Done when:** the public repo has no upstream-derived code anywhere in its history.

### T13: Production launch
- Set the production environment variables, the Sanity CORS origin, and the firewall rule, and rewrite `README.md`.
- Repeat the mainland test on the finished site.
- **Done when:** the production site passes the mainland test and the T9 switch has a settled state.

## Decisions

Decided on 2026-11-03 unless marked otherwise.

| Decision | Reason |
|---|---|
| Use the AI SDK and DeepSeek, not OpenAI ChatKit | Upstream's chat needs Agent Builder, which shuts down on 2026-11-30, and a DeepSeek key can't replace it. The AI SDK also makes the provider easy to change. |
| Remove Clerk, and let visitors chat without signing in | Clerk only gated the chat, and it needs an owned domain, DNS records, and separate OAuth credentials in production. Studio has its own login. |
| Protect the chat with a firewall rate limit and a small prepaid balance | Needs no extra service. Vercel Hobby includes one rate-limit rule, but it has no daily limit, so the balance caps spending. |
| Don't advertise paid work | Vercel Hobby is non-commercial, and its rules count advertising a service as commercial use. |
| Try Vercel first, on a custom domain | Cheap to test and easy to reverse. `*.vercel.app` is blocked in the mainland, and Vercel doesn't guarantee availability there. |
| If the T2b test fails, host in the mainland with an ICP filing | This is the dependable route. EdgeOne Pages is the first candidate, not yet tried. |
| Do the i18n setup at T5, and translation at T11 | Adding it late means moving every route, redoing every section, and migrating content. |
| Send contact messages by email | Sanity's free plan only allows public datasets, so stored messages would be publicly readable. |
| Keep Sanity | It gives a hosted editing UI, translated fields through plugins, and a free tier. The schemas get rewritten in T4 either way. |
| Keep the block that `next dev` adds to `AGENTS.md` | It points agents to docs matching the installed Next version, and committing it avoids a dirty diff after every dev run. |
| Keep the GitHub repo public | Owner's choice. Everything committed is public, so private details stay out of the repo. |
| Build our own design and content model, and stop porting upstream (2026-11-04) | Copyright covers code, not ideas, so once no upstream-derived code remains, its permission and attribution terms no longer apply. It also avoids porting sections that a later redesign would throw away. |

## Open items

| Item | Needed by | Owner |
|---|---|---|
| Share design references and the sections you want | T3 | George |
| Keep the upstream credit in `README.md` while upstream-derived code remains | Until T12 | Everyone |
| Buy a `.com` or `.cn` domain, after confirming the ending can be ICP-filed | T2b | George |
| Find a tester on a mainland network without a VPN | T2b | George |
| Confirm whether an ICP filing is possible | Only if T2b fails | George |
| Ask the local cyberspace authority whether the chat needs registration | Before enabling chat for mainland visitors | George |
| Delete the Clerk app and remove its keys from `.env.local` | Now that T1 is merged | George |

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
| Third-party hosts contacted by the public page | `*.api.sanity.io` only, from `SanityLive` (removed in T7) |
| Studio in a real browser | Login, saving a draft to Sanity, and discarding it all work |
| Fresh clone with a frozen install and no Clerk keys | Build, type check, and typegen pass |

## After T2a

Taken on 2026-11-03 on `chore/t2-lint-ci`.

| Check | Result |
|---|---|
| Biome | 0 errors, 0 warnings |
| CI steps in a fresh clone with only the workflow's values | Install, lint, build, and type check pass |
| CI on GitHub | Pass, on commit `6e42f8f` |
