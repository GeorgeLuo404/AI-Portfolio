# Design

Status: draft for George's review (T3). UI work from T5 on follows this file once it's approved.

- **Figma:** [George Luo portfolio design](https://www.figma.com/design/yOam3gCoyO0uew2262qVq9), with Foundations, English, and Chinese pages.
- **Prototype:** `design/`, the source the Figma frames are captured from. Run it with the `design` entry in `.claude/launch.json`, or `python3 -m http.server 4321 --directory design`, then open `index.html`, `zh.html`, or `foundations.html`.

The Figma frames are captured from the HTML, so they're editable layers but not linked components or variables. Change the HTML first, then capture again. Figma's Starter plan limits MCP reads to about 20 a month, so the file is meant for review and comments rather than as a component library.

## Direction

The look borrows the style of the Dribbble shot "Hegia – Personal Website for Developer". Its designer isn't identified yet.

| We borrow | We make our own |
|---|---|
| Electric blue on white and black | All artwork: an ASCII portrait of George, ASCII objects for projects |
| Giant uppercase grotesk headings that stagger by columns | All wording, written for job hunting rather than selling services |
| Hairline cells and section borders | The logo mark and pixel icons |
| Small tag chips, numbered or dated rows, a dark accordion | The exact composition of every section |
| A page that turns dark toward the end | An AI twin built into the hero |

Principles:

1. **Type is the structure.** Giant blue words set the grid; everything around them stays quiet.
2. **One moving moment.** The portrait resolves from random characters when the page loads. Nothing else animates on its own.
3. **Pictures made of characters.** ASCII and pixel art stay sharp, light, and the same in both languages.
4. **Lines carry meaning.** Hairlines mark cells and sections. Chips state facts. No shadows, gradients, or rounded cards.
5. **Chinese is designed, not translated.** The Chinese page gets its own headline treatment and type settings.

## Sections

In page order:

| Section | Content | Reference section it replaces |
|---|---|---|
| Navigation | Logo mark and name, section links, EN/中文 switch, "Ask my AI twin". Sticky. | Header |
| Hero | Job title in giant type, three chips, a short intro, the AI twin box, a facts list, the ASCII portrait | Hero with the ASCII tree |
| Selected work | Three projects in alternating rows: year, title, one or two lines, stack chips, links, an image well | Numbered projects |
| Skills | Three skill areas in giant black type with a line of detail each, over a faint ASCII torus | Services word stack |
| Experience (dark) | Giant "Experience", résumé and LinkedIn chips, roles in an accordion | Workflow accordion |
| Contact (dark) | "Open to new roles" in an ASCII corner frame, with email, WeChat ID, and AI twin buttons | Launch-your-website call to action |
| Footer (dark) | The name in giant type, the language switch, links, contact details | Footer |

## Tokens

### Color

| Name | Hex | Use | Contrast |
|---|---|---|---|
| Signal | `#1B2BFF` | Display type, primary buttons, chips, AI twin accents | 7.4:1 on paper. Never text on ink (2.8:1). |
| Ink | `#000000` | Body text, borders, dark sections | 21:1 on paper |
| Paper | `#FFFFFF` | Page background, text on signal or ink | |
| Panel | `#E8E8E8` | Project image wells | |
| Graphite | `#6E6E6E` | Secondary text on paper | 5.1:1 |
| Ash | `#8F8F8F` | Secondary text on ink | 6.5:1 |
| Rule | `#D9D9D9` | Hairlines on paper | |
| Rule on ink | `#2B2B2B` | Hairlines on ink | |
| Field | `#262626` | ASCII texture on ink | Decorative |

### Type

All fonts are OFL. Production self-hosts them with `next/font/local`, because remote fonts break the mainland reachability rule.

| Style | Font | Size | Line height | Tracking | Notes |
|---|---|---|---|---|---|
| Display XL | Archivo 900 | `clamp(56px, 9.7vw, 148px)` | 0.84 | −4.5% | Uppercase. Hero title. |
| Display giant | Archivo 900 | `clamp(48px, 13.6vw, 204px)` | 0.84 | −4.5% | Experience, footer name |
| Display L | Archivo 900 | `clamp(48px, 8.6vw, 132px)` | 0.84 | −4.5% | Section heads |
| Display M | Archivo 900 | `clamp(40px, 6.6vw, 100px)` | 0.86 | −4% | Skill lines |
| Title | Archivo 700 | 32px | 1.1 | −1.5% | Project titles |
| Body | Archivo 400 | 17px, 16px on phones | 1.55 | 0 | |
| Chip | Archivo 600 | 11.5px | 1 | +6% | Uppercase |
| Terminal | JetBrains Mono 500 | 16px | 1.4 | 0 | AI twin and chat only |
| ASCII | JetBrains Mono 500 | Box width ÷ columns ÷ 0.6 | 1 | 0 | Sized to fill its box |
| Chinese display | Noto Sans SC 900 | `clamp(64px, 13vw, 196px)` in the hero | 1.02 | 0 | |
| Chinese heading | Noto Sans SC 900 | `clamp(30px, 3.4vw, 52px)` | 1.2 | +2% | |
| Chinese body | System font | 16px | 1.8 | 0 | PingFang SC, Microsoft YaHei, Noto Sans CJK SC |

Mono is kept to the AI twin and ASCII art, so it reads as the machine's voice. Buttons use sentence case; only chips and display type are uppercase.

### Layout

| Width | Range | Designed at | Columns | Margin | Gap |
|---|---|---|---|---|---|
| Desktop | 1024px and up | 1440 | 12 | 32px | 24px |
| Tablet | 640–1023px | 768 | 8 | 24px | 16px |
| Phone | Below 640px | 390 | 4 | 16px | 12px |

The page is at most 1440px wide, with hairlines at its edges. Spacing steps are 4, 8, 12, 16, 24, 32, 48, 64, 96, and 128px. Display lines stagger by whole columns: two of nine in the hero, two of eight in section heads.

### Motion

- On load, the hero portrait resolves from random characters in 1.3 seconds.
- The AI twin's caret blinks.
- Both stop when the visitor has reduced motion turned on. Accordion rows open instantly. Nothing animates on scroll.

## Components

All corners are square, borders are 1px, and nothing has a shadow. `design/foundations.html` shows each one.

- **Chips:** outline (signal), solid (signal), and muted (rule border, graphite text).
- **Buttons:** signal, line, light, and line-on-ink, all 44px tall. Pixel icons only where they add meaning: external link, download, copy, mail, chat.
- **AI twin box:** title and status, a terminal prompt with a blinking caret, three suggested questions, a note that answers can be wrong, and an Ask button.
- **Chat panel:** a 440px side panel on desktop and a full-width sheet on phones. Visitor messages are signal blocks, twin replies have an ink rule, and declined questions use a grey rule and text.
- **Facts list:** label and value rows divided by hairlines.
- **Project row:** text on one side and an image well on the other, alternating. The well bleeds to the page edge.
- **Experience row:** dates, title, and company in one line. Opening a row shows result bullets and stack chips.
- **Pixel icons:** drawn on 7 to 9 pixel grids, in `design/site.js`: mark, chat, send, external, download, mail, copy, plus, minus, down, menu, close, cross, spark.
- **ASCII art:** `design/scripts/render-ascii.mjs` renders the placeholder scenes. T7 builds the production converter, which works from a photo.

## Chinese

- Set `lang="zh-CN"` on Chinese pages, so browsers use Simplified Chinese glyph shapes.
- Chinese text never gets uppercase or negative tracking. Body line height is 1.8.
- English display words such as "Selected work" and "Experience" stay as graphics on the Chinese page, marked `aria-hidden`. A Chinese heading under each one is the real heading.
- Where the meaning matters, Chinese is set on its own: the hero title and "正在寻找新的机会".
- Body text uses the visitor's system font, so nothing downloads. The heavy display font is trimmed to the characters the site uses, which the build can list because all content lives in the repo (T6).
- The name stays in English. Add a Chinese name only if George wants one.

**Open: the Chinese hero.** Option A sets 软件 / 工程师 in giant Chinese type. Option B keeps the English title as a graphic with 软件工程师 below it. The Chinese page uses A; the foundations page shows both.

## Accessibility

- Every text pair meets WCAG AA. Signal is never used for text on ink.
- Focus is visible: a 2px signal outline on paper, and white on ink.
- ASCII art and decorative glyphs are hidden from screen readers.
- Experience rows are buttons with `aria-expanded`.

## Placeholders for T10

Replace these with real content:

- The job title (currently "Software engineer"), intro, chips, and facts
- Projects two and three, and the image wells, which become screenshots
- Skill areas and their details
- Roles, dates, companies, results, and education
- Email address and WeChat ID
- The ASCII portrait, rendered from George's photo

## Notes for building it

- The prototype loads Google Fonts, and loads Figma's capture script only when the URL has a `#figmacapture` hash. Neither ships in production.
- Rebuild the components in T5 and T8 rather than copying the prototype's CSS wholesale. Keep the tokens and measurements in this file.
- Regenerate the placeholder art with `node design/scripts/render-ascii.mjs > design/ascii.js`.
