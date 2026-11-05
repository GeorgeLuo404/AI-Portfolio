# Design

Status: approved by George on 2026-11-06 (T3). UI work from T5 on follows this file.

- **Figma:** [George Luo portfolio design](https://www.figma.com/design/yOam3gCoyO0uew2262qVq9), with Foundations, English, and Chinese pages.
- **Prototype:** `design/`, the source the Figma frames are captured from. Run it with the `design` entry in `.claude/launch.json`, or `python3 -m http.server 4321 --directory design`, then open `index.html`, `zh.html`, or `foundations.html`.

The Figma frames are captured from the HTML, so they're editable layers but not linked components or variables. Change the HTML first, then capture again. Figma's Starter plan limits MCP reads to about 20 a month, so the file is meant for review and comments rather than as a component library.

## Direction

The layout follows "Hegia – Personal Website for Developer", a Dribbble concept by Faza Dzikrulloh, as closely as George asked on 2026-11-05. Its designer describes it as a portfolio for developers "who see code as a form of architecture": a minimal grid, oversized type, monochrome surfaces with electric blue, and a tree as a metaphor for deep foundations.

| We follow | We make our own |
|---|---|
| The composition of every section, from the hero grid to the footer | All artwork: two koi drawn in characters in place of the shot's tree, pond ripples, ASCII objects for projects |
| Giant uppercase headings in a staircase, letters on the grid lines | All wording, written for job hunting rather than selling services |
| Electric blue on white and black, hairline cells, tag chips | The logo mark and pixel icons |
| A dark accordion, a braced call to action, a giant footer name | An AI twin in the hero, in place of the shot's website preview |

The footer credits the designer: "Layout after Hegia, a concept by Faza Dzikrulloh".

Principles:

1. **Type is the structure.** The vertical grid lines are measured from the hero headline's letters, and every other display heading is sized so its letters land on them.
2. **One living picture.** Two koi swim slowly in the hero, and they're the only thing that moves on its own. A button trades them for George's photo.
3. **Pictures made of characters.** ASCII and pixel art stay sharp, light, and the same in both languages and themes.
4. **Lines carry meaning.** Hairlines mark the grid and the cells. Chips state facts. No shadows, gradients, or rounded cards.
5. **Chinese is designed, not translated.** English display words stay as graphics, and a Chinese heading carries the meaning.

## Sections

In page order:

| Section | Content |
|---|---|
| Navigation | Logo mark and name, section links, EN/中文 switch, theme switch, "Ask my AI twin". Sticky. A menu on phones. |
| Hero | "AI / Web Engineer" in giant type on the grid, three chips in a staircase, a short intro that highlights the role, the logo mark in the intro's bottom-right corner, two koi circling in a brushed ring on a dotted field with a button that trades them for George's photo, a statement box, and the AI twin window standing in a small room drawn in perspective |
| Selected work | "Selected work" heading, an aside, and three project rows that alternate sides: year, title, a line or two, stack chips, links, and an image well that bleeds to the page edge |
| Skills | A word stack in black: "AI agents", "Full-stack ( ▢ ) web", "Data & cloud", with blue pixel decorations, faint ASCII objects, and a legend of tools |
| Experience (dark) | Giant "Experience" with résumé, LinkedIn, and GitHub chips over it, an aside, and roles in an accordion |
| Contact (dark panel) | "Hiring an AI & web engineer?" in braces, with email, WeChat ID, and AI twin buttons, over faint pond ripples |
| Footer (dark) | The name in giant type with the chips over it, a faint, still pair of koi, page links, other profiles, contact details, the credit, and the language switch |

The hero headline reads "AI / Web Engineer" on both pages, as "AI / Web" over "Engineer". A thin slash joins the halves. On the Chinese page the English headline is a graphic, and the real heading, "AI / 前端开发工程师", is hidden for screen readers. The intro names the role on both pages, highlighted: "AI and web engineer" and "AI 与前端开发工程师". Because 前端 means frontend, the second chip says Frontend and 前端开发. If the focus becomes full stack, change both.

## Hero art

Two koi circle each other clockwise inside a brushed ring, drawn in characters: one in solid ink and one in outline. They stand for George's sign, Pisces, and together they make a yin-yang, which Chinese often calls 阴阳鱼, yin-yang fish. Each head circles close to the center and the body spirals out behind it, so the two lie head to tail, each tail curling around to meet the other fish's head. Following George's line-drawing reference, the fish are drawn side on, with their bellies to the ring and their backs facing each other across the S-curve. Each has an eye in the other fish's color, which doubles as one of the yin-yang's dots, a gill line, and scales. Its fins are small: pectoral, pelvic, and anal fins hang from the belly toward the ring, and a low dorsal fin runs along the back. The tail fans out smoothly from the body into two soft points, with fine streaks along it, and sways as the fish swims. On the solid fish it's as dark as the body. The picture is 180 characters across, so the fins have room to show. The characters take the ink color, so the two fish swap colors when the theme changes.

- **Idle:** the koi swim a lap every 26 seconds, bending as they go and paddling their fins. The ring turns with them: it swells just behind each tail, runs dry between them, and its edge drifts as it turns. Faint ripples spread out from the ring. The dot grid runs through the whole picture and is hidden only behind the fish.
- **Show my face (我长啥样):** the koi break the circle and swim off in opposite directions. A ripple front from the center turns the art into George's portrait in characters, then the photo itself fades in. The caption changes from "Fig. 1 Two koi in N characters" to "Fig. 2 George himself" (用 N 个字符画成的两条锦鲤 and 罗卓君本人).
- **Bring the fish back (把鱼叫回来):** the photo fades back to characters, water spreads from the center, the ring brushes itself on again, and the koi swim in from the left along the top and from the right along the bottom, then curl back into the yin-yang.
- **The photo:** `design/assets/george.jpg`, cropped from George's own photo to his head, his thumbs-up, and the coast behind him. It's black and white, so it suits both themes, and it was saved without metadata, so no location or camera details ship. It loads after the page settles, or as soon as someone reaches for the button.
- **Sources:** the koi are drawn from scratch in code. George's reference images, a brush yin-yang, a black-and-white koi painting, and a line drawing with long fins, set the mood only. Nothing is traced or converted from them.

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
| Dot | `#D2D2D2` | `#2E2E2E` | The dotted field behind the koi |

The page follows the visitor's system setting, and the header switch saves a choice. In the light theme the page still turns dark from Experience down: those sections use the dark tokens in both themes.

### Type

All fonts are OFL. Production self-hosts them with `next/font/local` from `app/fonts/`, because remote fonts break the mainland reachability rule. The files are Fontsource's builds of the Google Fonts versions (Archivo variable, latin subset). The grid depends on Archivo's exact metrics, so check the letter edges against the grid lines when the hero is built (T8), and re-measure if the font changes.

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
| ASCII | JetBrains Mono 500, 800 for the koi | Box width ÷ columns ÷ 0.6 | 1 | 0 | Sized to fill its box |
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

- The hero's koi move at about 24 frames a second. On load they resolve from random characters in 1.3 seconds. They pause while the hero is off screen or the tab is hidden.
- Showing the photo takes about 4 seconds, and bringing the fish back about 3. A click during either jumps to its end and turns back.
- Until someone first presses the art button, two square ripples run out from it every 3.2 seconds, starting 1.6 seconds after load.
- The AI twin's caret blinks.
- With reduced motion turned on, the koi hold still, the caret stops, the button doesn't ripple, and it swaps the photo with a fade. Accordion rows open instantly. Nothing animates on scroll.

## Components

All corners are square, borders are 1px, and nothing has a shadow. `design/foundations.html` shows each one.

- **Chips:** panel (blue text on panel), solid (white on signal), and muted (small grey).
- **Logo mark:** the pixel G on a signal square, 98px on desktop, 64px on tablets, and 52px on phones, on both pages. In the hero it sits in the intro's bottom-right corner, on the frame line and the art's top rule, however long the intro runs.
- **Highlight:** a `mark` on the panel color with 0.1em padding. It reaches 0.1em into the space before it, so a phrase that starts a line keeps the line's edge. The role in the hero never breaks across lines.
- **Art button:** a signal button, 30px tall, in the art's top-right corner, and on phones in its bottom-right corner, just above the caption. Beside the caption, as first drawn, it covered the caption's end on a 375px phone. It says what it will do: a smiling face with "Show my face" or 我长啥样, then a fish with "Bring the fish back" or 把鱼叫回来. Hover darkens it, because the pixel icons bake in their color.
- **Buttons:** signal, line, light, and ghost. Pixel icons only where they add meaning: external link, download, copy, mail, chat.
- **AI twin window:** title and status, a terminal prompt with a blinking caret, three suggested questions, a note that answers can be wrong, and an Ask button. In the hero it stands in a room: lines from the stage corners to the window, a center line, a horizon, a grey panel and a signal panel behind it. `site.js` draws the lines from the window's position.
- **Chat panel:** a 440px side panel on desktop and a full-width sheet on phones. Visitor messages are signal blocks, twin replies have an ink rule, and declined questions use a grey rule and text. Esc closes it.
- **Project row:** year with a signal square, title, description, chips, and links on one side, and an image well on the other, alternating.
- **Experience row:** dates, title, and company in one line. Opening a row shows result bullets and stack chips.
- **Pixel icons:** drawn on 4 to 15 pixel grids in `design/site.js`: mark, chat, send, external, download, mail, copy, plus, minus, down, menu, close, cross, spark, sun, moon, carets, brace, face, fish.
- **ASCII art:** `design/koi.js` draws the koi every frame: a spine that follows each fish's track and spirals out while it circles, a side-on body of tapered capsules whose belly is fuller than its back, small fins along the back and belly, a forked tail fan with streaks, and the turning ring with dry-brush streaks. It also turns the photo into characters with the photo's own crop, and draws the footer's still pair. `design/scripts/render-ascii.mjs` renders the fixed art: pond ripples for the contact panel and small objects for the project wells.

## Chinese

- Set `lang="zh-CN"` on Chinese pages, so browsers use Simplified Chinese glyph shapes.
- Chinese text never gets uppercase or negative tracking. Body line height is 1.75 or more.
- English display words, the hero's "AI / Web Engineer" included, stay as graphics on the Chinese page, marked `aria-hidden` and `lang="en"`. A Chinese heading next to or under each one is the real heading. In the hero, that heading is hidden for screen readers, and the intro names the role instead.
- At the same size, Chinese characters stand about a third taller than Latin capitals. Where they sit side by side, as in the header's language switch, size them to the same height: EN is 16px and 中文 12px, both 11px tall, and 中文 is raised 1px so they share a center line. Keep Chinese at 12px or more.
- The Chinese page uses George's Chinese name, 罗卓君, in the header, the hero intro, and under the footer name.
- Body text uses the visitor's system font, so nothing downloads. The heavy display font is trimmed to the characters the site uses, which the build can list because all content lives in the repo (T6).

## Accessibility

- Every text pair meets WCAG AA. Dark signal (`#4352FF`) is used only for large text and fills with white text (5.4:1).
- Focus is visible: a 2px signal outline, and white on the dark sections.
- ASCII art, display graphics on the Chinese page, and decorative glyphs are hidden from screen readers. The photo has alt text, and screen readers reach it only while it shows.
- Experience rows are buttons with `aria-expanded`. The theme switch's label says what it switches to.

## Placeholders for T10

Replace these with real content, in the files in `content/`:

- The intro, statement, and chips
- Projects two and three, and the image wells, which become screenshots
- Skill areas and their tools
- Roles, dates, companies, results, and education
- Email address and WeChat ID
- George's start date, so the AI twin can answer the "Start date" (何时到岗) chip

## Notes for building it

- The prototype loads Google Fonts, and loads Figma's capture script only when the URL has a `#figmacapture` hash. Neither ships in production.
- URL options: `?static` draws one still frame of the koi, `?face` starts on the photo, `?theme=light` or `?theme=dark` forces a theme, and `?grid` shows the grid lines. In the console, `KOI.step(seconds)` moves the koi on by hand.
- In the app (T7), `components/koi-figure.tsx` draws the koi into a `pre` from `lib/koi/engine.ts`, with the same pause and reduced-motion rules, and `next/image` serves the photo from our own domain. `lib/ascii/scenes.ts` renders the fixed art while the site builds, matching the prototype's character for character, and `lib/ascii/image.ts` converts project images. In development, `KOI.step(seconds)` works there too.
- A small script in each page's head applies a saved theme before first paint, so the page doesn't flash. Production needs the same.
- Pixel icons bake their color in when drawn, because a captured SVG doesn't inherit `currentColor`, so `site.js` redraws them when the theme changes. Production can use `currentColor`.
- Rebuild the components in T5 and T8 rather than copying the prototype's CSS wholesale. Keep the tokens and the grid measurements in this file.
- Regenerate the fixed art with `node design/scripts/render-ascii.mjs > design/ascii.js`.
