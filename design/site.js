// Pixel icons, ASCII art, the theme switch, and small interactions for the T3
// design prototype. URL options: ?static skips the load animation, ?theme=dark
// or ?theme=light forces a theme, and ?grid shows the grid lines on top. A
// #figmacapture hash from Figma's generate_figma_design tool loads Figma's
// capture script, which then sends the rendered page to the Figma file.

(() => {
  const ICONS = {
    mark: [
      ".######.",
      "##....##",
      "##......",
      "##..####",
      "##....##",
      "##....##",
      ".######.",
    ],
    external: [
      "..#####",
      ".....##",
      "....#.#",
      "...#..#",
      "..#....",
      ".#.....",
      "#......",
    ],
    down: [
      "...#...",
      "...#...",
      "...#...",
      "#..#..#",
      ".#.#.#.",
      "..###..",
      "...#...",
    ],
    plus: [
      "...#...",
      "...#...",
      "...#...",
      "#######",
      "...#...",
      "...#...",
      "...#...",
    ],
    minus: [
      ".......",
      ".......",
      ".......",
      "#######",
      ".......",
      ".......",
      ".......",
    ],
    spark: [
      "....#....",
      ".#..#..#.",
      "..#.#.#..",
      "...###...",
      "#########",
      "...###...",
      "..#.#.#..",
      ".#..#..#.",
      "....#....",
    ],
    chat: [
      "#########",
      "#.......#",
      "#.#.#.#.#",
      "#.......#",
      "#########",
      "..##.....",
      ".#.......",
    ],
    send: [
      "...#...",
      "....#..",
      ".....#.",
      "#######",
      ".....#.",
      "....#..",
      "...#...",
    ],
    copy: [
      "..######",
      "..#....#",
      "###....#",
      "#.#....#",
      "#.#....#",
      "#.######",
      "#....#..",
      "######..",
    ],
    mail: [
      "#########",
      "##.....##",
      "#.#...#.#",
      "#..#.#..#",
      "#...#...#",
      "#.......#",
      "#########",
    ],
    download: [
      "...#...",
      "...#...",
      "#..#..#",
      ".#.#.#.",
      "..###..",
      "...#...",
      ".......",
      "#######",
    ],
    menu: [
      "########",
      "........",
      "........",
      "########",
      "........",
      "........",
      "########",
    ],
    close: [
      "#.....#",
      ".#...#.",
      "..#.#..",
      "...#...",
      "..#.#..",
      ".#...#.",
      "#.....#",
    ],
    cross: [
      "...#...",
      "...#...",
      ".......",
      "##.#.##",
      ".......",
      "...#...",
      "...#...",
    ],
    sun: [
      "....#....",
      ".#.....#.",
      "...###...",
      "..#####..",
      "#.#####.#",
      "..#####..",
      "...###...",
      ".#.....#.",
      "....#....",
    ],
    moon: [
      "...##....",
      "..##.....",
      ".##......",
      "###......",
      "###......",
      "####.....",
      ".####....",
      "..#####..",
      "...###...",
    ],
    carets: [
      "...#.......#...",
      "..###.....###..",
      ".##.##...##.##.",
      "##...##.##...##",
    ],
    brace: [
      "..###",
      ".##..",
      ".##..",
      ".##..",
      "##...",
      ".##..",
      ".##..",
      ".##..",
      "..###",
    ],
  };

  // Draw each run of "#" as one rect, so a row of pixels stays one shape.
  function pixelSvg(rows, size, color) {
    const width = rows[0].length;
    const height = rows.length;
    let rects = "";
    rows.forEach((row, y) => {
      let x = 0;
      while (x < width) {
        if (row[x] !== "#") {
          x++;
          continue;
        }
        let end = x;
        while (end < width && row[end] === "#") end++;
        rects += `<rect x="${x}" y="${y}" width="${end - x}" height="1"/>`;
        x = end;
      }
    });
    const scale = size / Math.max(width, height);
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" ` +
      `width="${Math.round(width * scale)}" height="${Math.round(height * scale)}" ` +
      `fill="${color}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`
    );
  }

  // Fill in the color now, because a captured SVG doesn't inherit currentColor.
  // Runs again whenever the theme changes.
  function paintIcons() {
    for (const el of document.querySelectorAll("[data-px]")) {
      const rows = ICONS[el.dataset.px];
      if (!rows) continue;
      el.classList.add("px");
      const size = Number(el.dataset.size || 14);
      el.innerHTML = pixelSvg(rows, size, getComputedStyle(el).color);
    }
  }

  // Theme: the head script applies a saved or forced choice before first
  // paint. Without one, the page follows the system setting.
  const root = document.documentElement;
  const systemDark = matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = () =>
    root.dataset.theme || (systemDark.matches ? "dark" : "light");

  function syncThemeToggle() {
    const dark = currentTheme() === "dark";
    for (const button of document.querySelectorAll("[data-theme-toggle]")) {
      button.setAttribute(
        "aria-label",
        dark ? button.dataset.labelLight : button.dataset.labelDark,
      );
      button.querySelector("[data-px]").dataset.px = dark ? "sun" : "moon";
    }
    paintIcons();
  }

  for (const button of document.querySelectorAll("[data-theme-toggle]")) {
    button.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem("theme", next);
      } catch {}
      syncThemeToggle();
    });
  }
  systemDark.addEventListener("change", syncThemeToggle);
  syncThemeToggle();

  const isStatic =
    new URLSearchParams(location.search).has("static") ||
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The one load animation: the portrait resolves from noise into the face.
  function decode(pre, text) {
    const noise = ".:-=+*#%@";
    const chars = [...text];
    const reveal = chars.map((c) =>
      c === " " || c === "\n" ? -1 : Math.random(),
    );
    const start = performance.now();
    const duration = 1300;
    function frame(now) {
      const progress = (now - start) / duration;
      let out = "";
      for (let i = 0; i < chars.length; i++) {
        if (reveal[i] < 0 || reveal[i] < progress) out += chars[i];
        else out += noise[Math.floor(Math.random() * noise.length)];
      }
      pre.textContent = out;
      if (progress < 1) requestAnimationFrame(frame);
      else pre.textContent = text;
    }
    requestAnimationFrame(frame);
  }

  for (const pre of document.querySelectorAll("[data-ascii]")) {
    const name = pre.dataset.ascii;
    const text = window.ASCII?.[name] ?? "";
    const [cols, rows] = window.ASCII_SIZES?.[name] ?? [72, 30];
    pre.style.setProperty("--cols", cols);
    // Keep the box its full height even where the last rows are blank.
    pre.style.minHeight = `${rows}em`;
    if (pre.hasAttribute("data-decode") && !isStatic) decode(pre, text);
    else pre.textContent = text;
  }

  for (const el of document.querySelectorAll("[data-ascii-count]")) {
    el.textContent = window.ASCII_TREE_CHARACTERS.toLocaleString("en-US");
  }

  for (const head of document.querySelectorAll(".role__head")) {
    head.addEventListener("click", () => {
      const role = head.closest(".role");
      const open = role.classList.toggle("is-open");
      head.setAttribute("aria-expanded", String(open));
      const toggle = head.querySelector(".role__toggle");
      toggle.innerHTML = pixelSvg(
        ICONS[open ? "minus" : "plus"],
        12,
        getComputedStyle(toggle).color,
      );
    });
  }

  for (const button of document.querySelectorAll("[data-copy]")) {
    button.addEventListener("click", async () => {
      const label = button.querySelector("[data-label]");
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        label.textContent = button.dataset.done;
      } catch {
        label.textContent = button.dataset.copy;
      }
    });
  }

  // The AI twin's room: lines from the stage corners to the window's corners,
  // a center line, and a horizon line out to the panels behind it.
  function drawStage(stage) {
    const svg = stage.querySelector(".stage__lines");
    const twin = stage.querySelector(".twin");
    const box = stage.getBoundingClientRect();
    const win = twin.getBoundingClientRect();
    const w = box.width;
    const h = box.height;
    const l = win.left - box.left;
    const r = win.right - box.left;
    const t = win.top - box.top;
    const horizon = t + (h - t) * 0.42;
    const backs = [...stage.querySelectorAll(".stage__back")].map((b) =>
      b.getBoundingClientRect(),
    );
    const panelLeft = backs[0] ? backs[0].left - box.left : l;
    const signalRight = backs[1] ? backs[1].right - box.left : r;
    const lines = [
      [0, 0, l, t],
      [w, 0, r, t],
      [w / 2, 0, w / 2, t],
      [0, horizon, panelLeft, horizon],
      [signalRight, horizon, w, horizon],
      [0, h, panelLeft, h - (h - horizon) * 0.35],
      [w, h, signalRight, h - (h - horizon) * 0.35],
    ];
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.innerHTML = lines
      .map(
        ([x1, y1, x2, y2]) =>
          `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${getComputedStyle(svg).stroke}" />`,
      )
      .join("");
  }

  for (const stage of document.querySelectorAll(".hero__stage")) {
    new ResizeObserver(() => drawStage(stage)).observe(stage);
  }

  // Chat panel. The prototype shows a sample conversation.
  const chat = document.getElementById("chat");
  const scrim = document.querySelector(".chat-scrim");
  let lastFocus = null;
  function openChat(event) {
    event.preventDefault();
    if (!chat) return;
    lastFocus = document.activeElement;
    chat.hidden = false;
    scrim.hidden = false;
    paintIcons();
    chat.querySelector(".chat__close").focus();
  }
  function closeChat() {
    if (!chat || chat.hidden) return;
    chat.hidden = true;
    scrim.hidden = true;
    lastFocus?.focus();
  }
  for (const el of document.querySelectorAll("[data-chat]")) {
    el.addEventListener("click", openChat);
  }
  for (const el of document.querySelectorAll("[data-chat-close]")) {
    el.addEventListener("click", closeChat);
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeChat();
  });

  // Phone menu.
  for (const button of document.querySelectorAll("[data-menu]")) {
    button.addEventListener("click", () => {
      const nav = button.closest(".nav");
      const open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
    });
  }

  // Repaint baked colors when the theme changes after load.
  new MutationObserver(() => {
    paintIcons();
    for (const stage of document.querySelectorAll(".hero__stage"))
      drawStage(stage);
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  if (location.hash.includes("figmacapture=")) {
    const capture = document.createElement("script");
    capture.src = "https://mcp.figma.com/mcp/html-to-design/capture.js";
    capture.async = true;
    document.head.append(capture);
  }
})();
