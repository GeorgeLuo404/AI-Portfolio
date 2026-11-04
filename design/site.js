// Pixel icons, ASCII art, and small interactions for the T3 design prototype.
// Add ?static to the URL to skip the load animation. A #figmacapture hash from
// Figma's generate_figma_design tool loads Figma's capture script, which then
// sends the rendered page to the Figma file.

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
  for (const el of document.querySelectorAll("[data-px]")) {
    const rows = ICONS[el.dataset.px];
    if (!rows) continue;
    el.classList.add("px");
    const size = Number(el.dataset.size || 14);
    el.innerHTML = pixelSvg(rows, size, getComputedStyle(el).color);
  }

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
    const text = window.ASCII?.[pre.dataset.ascii] ?? "";
    if (pre.hasAttribute("data-decode") && !isStatic) decode(pre, text);
    else pre.textContent = text;
  }

  for (const el of document.querySelectorAll("[data-ascii-count]")) {
    el.textContent = window.ASCII_PORTRAIT_CHARACTERS.toLocaleString("en-US");
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

  if (location.hash.includes("figmacapture=")) {
    const capture = document.createElement("script");
    capture.src = "https://mcp.figma.com/mcp/html-to-design/capture.js";
    capture.async = true;
    document.head.append(capture);
  }
})();
