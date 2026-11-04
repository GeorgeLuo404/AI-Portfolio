# Design

Status: draft for George's review (T3). UI work from T5 on follows this file once it's approved.

- **Figma:** [George Luo portfolio design](https://www.figma.com/design/yOam3gCoyO0uew2262qVq9), with Foundations, English, and Chinese pages.
- **Prototype:** `design/`, the source the Figma frames are captured from. Run it with the `design` entry in `.claude/launch.json`, or `python3 -m http.server 4321 --directory design`, then open `index.html`, `zh.html`, or `foundations.html`.

The Figma frames are captured from the HTML, so they're editable layers but not linked components or variables. Change the HTML first, then capture again. Figma's Starter plan limits MCP reads to about 20 a month, so the file is meant for review and comments rather than as a component library.

## Direction

The layout follows "Hegia – Personal Website for Developer", a Dribbble concept by Faza Dzikrulloh, as closely as George asked on 2026-11-05. Its designer describes it as a portfolio for developers "who see code as a form of architecture": a minimal grid, oversized type, monochrome surfaces with electric blue, and a tree as a metaphor for deep foundations.

| We follow | We make our own |
|---|---|
| The composition of every section, from the hero grid to the footer | All artwork: a procedural ASCII tree, ASCII objects for projects |
| Giant uppercase headings in a staircase, letters on the grid lines | All wording, written for job hunting rather than selling services |
| Electric blue on white and black, hairline cells, tag chips | The logo mark and pixel icons |
| A dark accordion, a braced call to action, a giant footer name | An AI twin in the hero, in place of the shot's website preview |

The footer credits the designer: "Layout after Hegia, a concept by Faza Dzikrulloh".

Principles:

1. **Type is the structure.** The vertical grid lines are measured from the hero headline's letters, and every other display heading is sized so its letters land on them.
2. **One moving moment.** The tree resolves from random characters when the page loads. Nothing else animates on its own.
3. **Pictures made of characters.** ASCII and pixel art stay sharp, light, and the same in both languages and themes.
4. **Lines carry meaning.** Hairlines mark the grid and the cells. Chips state facts. No shadows, gradients, or rounded cards.
5. **Chinese is designed, not translated.** English display words stay as graphics, and a Chinese heading carries the meaning.

## Sections

In page order:

| Section | Content |
|---|---|
| Navigation | Logo mark and name, section links, EN/中文 switch, theme switch, "Ask my AI twin". Sticky. A menu on phones. |
| Hero | "AI / Web Engineer" in giant type on the grid, three chips in a staircase, a short intro beside the logo mark, the ASCII tree on a dotted field, a statement box, and the AI twin window standing in a small room drawn in perspective |
| Selected work | "Selected work" heading, an aside, and three project rows that alternate sides: year, title, a line or two, stack chips, links, and an image well that bleeds to the page edge |
| Skills | A word stack in black: "AI agents", "Full-stack ( ▢ ) web", "Data & cloud", with blue pixel decorations, faint ASCII objects, and a legend of tools |
| Experience (dark) | Giant "Experience" with résumé, LinkedIn, and GitHub chips over it, an aside, and roles in an accordion |
| Contact (dark panel) | "Hiring an AI & web engineer?" in braces, with email, WeChat ID, and AI twin buttons |
| Footer (dark) | The name in giant type with the chips over it, a faint tree, page links, other profiles, contact details, the credit, and the language switch |

The hero headline reads "AI / Web Engineer" on both pages, as "AI / Web" over "Engineer". A thin slash joins the halves. On the Chinese page the English headline is a graphic, and the real heading is "AI / 前端开发工程师", at the top of the intro. Because 前端 means frontend, the second chip says Frontend and 前端开发. If the focus becomes full stack, change both.

## Grid from type

The hero headline sets the grid. Its size `f` is a share of the content width, and every vertical line is a letter edge measured in em of `f`. The letters were measured in Archivo 800 at −6% tracking, with the slash in Archivo 200.

| Line | Desktop and tablet | What lands on it |
|---|---|---|
| L0 | 0 | The A of "AI" |
| L1 | 1.444em | The top corner of the W |
| L2 | 2.432em | The stems of the E in "Web" and the E that starts "Engineer", which stack exactly |
| L3 | 3.702em | The ends of the B and the N, whose stems also stack at 3.069em |

"Engineer" is indented 2.356em, and line 1 is pulled 0.008em left so the A sits on L0.

Phones set the headline on three lines, "AI /", "Web", and "Engineer", at the full content width. There, L1 (0.989em) holds the right edge of the I and the stems of both Es, L2 (2.259em) the ends of the B and the N, and L3 (4.107em) the second E of "Engineer".

Other display headings are solved against these lines:

| Heading | Size | Letters on the lines |
|---|---|---|
| Selected work | `0.7302 f` | The D ends on L3, "Work" hangs from the stem of the T, and its R starts on L3. Phones: full width, "Work" hangs from the second E. |
| Skills stack | `0.5029 f`, Archivo 500 | "AI agents" starts on L2 and its E stands on L3, "Full-stack" starts on L0, "Data & cloud" on L1 |
| Experience | `1.4288 f` | The R stands on L3. Tablets: `1.2446 f`, with the second E on L2. Phones: full width. |
| Footer name | `1.1207 f` | "Luo" starts on the stem of the R in "George", on L2 |

If a heading's words change, measure the new letters and solve its size again. The prototype's `?grid` option draws the lines in red on top of everything, which makes a miss easy to see.

## Tokens

### Color

| Name | Light | Dark | Use |
|---|---|---|---|
| Signal | `#1B2BFF` | `#4352FF` | Display type, fills, chips. Dark is 3.9:1 on black, so large text only. |
| Signal text | `#1B2BFF` | `#6874FF` | Small blue text. 7.4:1 on white, 5.5:1 on black. |
| Ink and paper | `#000000` on `#FFFFFF` | `#FFFFFF` on `#000000` | Text and background |
| Panel | `#F4F4F4` | `#121212` | Chips, the statement box, the header button, the contact panel |
| Well | `#E9E9E9` | `#161616` | Project image wells |
| Rule | `#E6E6E6` | `#242424` | Grid lines and borders |
| Muted | `#6E6E6E` | `#8F8F8F` | Secondary text. 5.1:1 and 6.5:1. |
| Dot | `#D2D2D2` | `#2E2E2E` | The dotted field behind the tree |

The page follows the visitor's system setting, and the header switch saves a choice. In the light theme the page still turns dark from Experience down: those sections use the dark tokens in both themes.

### Type

All fonts are OFL. Production self-hosts them with `next/font/local`, because remote fonts break the mainland reachability rule. The grid depends on Archivo's exact metrics, so production must use the same Archivo version, or re-measure.

| Style | Font | Size | Line height | Tracking | Notes |
|---|---|---|---|---|---|
| Display | Archivo 800 | From the grid table | 0.73 | −6% | Uppercase |
| Slash | Archivo 200 | Same as its headline | | | Joins the halves of the hero headline |
| Word stack | Archivo 500 | `0.5029 f` | 0.82 | −4% | Uppercase, skills |
| Statement | Archivo 500 | 26px | 1.3 | −1.5% | Hero statement box |
| Intro | Archivo 400 | 19px | 1.45 | 0 | Hero intro |
| Title | Archivo 600 | 22px | 1.2 | −1% | Project titles |
| Body | Archivo 400 | 15px to 17px | 1.55 | 0 | |
| Chip | Archivo 500 | 15px in the hero, 13px elsewhere | 1 | +3% | Uppercase |
| Button | Archivo 600 | 12px | 1 | +5% | Uppercase, 36px tall, 44px on phones |
| Terminal | JetBrains Mono 500 | 14px | 1.4 | 0 | AI twin and chat only |
| ASCII | JetBrains Mono 500, 800 for the tree | Box width ÷ columns ÷ 0.6 | 1 | 0 | Sized to fill its box |
| Chinese heading | Noto Sans SC 900 | `clamp(26px, 2.5vw, 36px)` | 1.25 | +2% | |
| Chinese body | System font | 17px | 1.75 | 0 | PingFang SC, Microsoft YaHei, Noto Sans CJK SC |

### Layout

| Width | Range | Designed at | Margin | Headline `f` |
|---|---|---|---|---|
| Desktop | 1024px and up | 1440 | 40px | 10.3% of the content width |
| Tablet | 640–1023px | 768 | 24px | 12.7% of the content width |
| Phone | Below 640px | 390 | 16px | Content width ÷ 6.034 |

The page is at most 1440px wide. Content sits between two hairlines inset by the margin, and those lines run the full height of the page. The hero has lines at L1, L2, and L3; Selected work and Experience have L3; the skills stack has all three; the footer name has L2. On tablets and phones, where content stacks, the lines stop at their heading.

### Motion

- On load, the tree resolves from random characters in 1.3 seconds.
- The AI twin's caret blinks.
- Both stop when the visitor has reduced motion turned on. Accordion rows open instantly. Nothing animates on scroll.

## Components

All corners are square, borders are 1px, and nothing has a shadow. `design/foundations.html` shows each one.

- **Chips:** panel (blue text on panel), solid (white on signal), and muted (small grey).
- **Buttons:** signal, line, light, and ghost. Pixel icons only where they add meaning: external link, download, copy, mail, chat.
- **AI twin window:** title and status, a terminal prompt with a blinking caret, three suggested questions, a note that answers can be wrong, and an Ask button. In the hero it stands in a room: lines from the stage corners to the window, a center line, a horizon, a grey panel and a signal panel behind it. `site.js` draws the lines from the window's position.
- **Chat panel:** a 440px side panel on desktop and a full-width sheet on phones. Visitor messages are signal blocks, twin replies have an ink rule, and declined questions use a grey rule and text. Esc closes it.
- **Project row:** year with a signal square, title, description, chips, and links on one side, and an image well on the other, alternating.
- **Experience row:** dates, title, and company in one line. Opening a row shows result bullets and stack chips.
- **Pixel icons:** drawn on 4 to 15 pixel grids in `design/site.js`: mark, chat, send, external, download, mail, copy, plus, minus, down, menu, close, cross, spark, sun, moon, carets, brace.
- **ASCII art:** `design/scripts/render-ascii.mjs` grows the tree from a seed, with two small trees behind it, and renders bare branches for the contact panel and small objects for the project wells.

## Chinese

- Set `lang="zh-CN"` on Chinese pages, so browsers use Simplified Chinese glyph shapes.
- Chinese text never gets uppercase or negative tracking. Body line height is 1.75 or more.
- English display words, the hero's "AI / Web Engineer" included, stay as graphics on the Chinese page, marked `aria-hidden` and `lang="en"`. A Chinese heading next to or under each one is the real heading.
- The Chinese page uses George's Chinese name, 罗卓君, in the header, the hero intro, and under the footer name.
- Body text uses the visitor's system font, so nothing downloads. The heavy display font is trimmed to the characters the site uses, which the build can list because all content lives in the repo (T6).

## Accessibility

- Every text pair meets WCAG AA. Dark signal (`#4352FF`) is used only for large text and fills with white text (5.4:1).
- Focus is visible: a 2px signal outline, and white on the dark sections.
- ASCII art, display graphics on the Chinese page, and decorative glyphs are hidden from screen readers.
- Experience rows are buttons with `aria-expanded`. The theme switch's label says what it switches to.

## Placeholders for T10

Replace these with real content:

- The intro, statement, and chips
- Projects two and three, and the image wells, which become screenshots
- Skill areas and their tools
- Roles, dates, companies, results, and education
- Email address and WeChat ID

## Notes for building it

- The prototype loads Google Fonts, and loads Figma's capture script only when the URL has a `#figmacapture` hash. Neither ships in production.
- URL options: `?static` skips the load animation, `?theme=light` or `?theme=dark` forces a theme, and `?grid` shows the grid lines.
- A small script in each page's head applies a saved theme before first paint, so the page doesn't flash. Production needs the same.
- Pixel icons bake their color in when drawn, because a captured SVG doesn't inherit `currentColor`, so `site.js` redraws them when the theme changes. Production can use `currentColor`.
- Rebuild the components in T5 and T8 rather than copying the prototype's CSS wholesale. Keep the tokens and the grid measurements in this file.
- Regenerate the art with `node design/scripts/render-ascii.mjs > design/ascii.js`.
