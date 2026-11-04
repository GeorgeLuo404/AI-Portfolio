// Renders the ASCII art for the T3 design prototype: a procedural tree for the
// hero and footer, bare branches for the call to action, and small
// signed-distance-field objects, ray-marched with an orthographic camera and
// shaded into characters, for the project images.
//
// Usage: node design/scripts/render-ascii.mjs > design/ascii.js

// Light to dark. Every surface cell gets at least a "." so silhouettes stay
// readable where the light is brightest.
const RAMP = " .:-=+*#%@";
// JetBrains Mono advances 0.6em, and the prototype sets line-height to 1.
const CELL_ASPECT = 0.6;

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => mul(a, 1 / len(a));
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

function rotX(p, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [p[0], c * p[1] - s * p[2], s * p[1] + c * p[2]];
}
function rotY(p, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [c * p[0] + s * p[2], p[1], -s * p[0] + c * p[2]];
}
function rotZ(p, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [c * p[0] - s * p[1], s * p[0] + c * p[1], p[2]];
}

const sphere = (p, r) => len(p) - r;
function roundBox(p, b, r) {
  const q = [
    Math.abs(p[0]) - b[0],
    Math.abs(p[1]) - b[1],
    Math.abs(p[2]) - b[2],
  ];
  const outside = len([
    Math.max(q[0], 0),
    Math.max(q[1], 0),
    Math.max(q[2], 0),
  ]);
  return outside + Math.min(Math.max(q[0], Math.max(q[1], q[2])), 0) - r;
}
function torus(p, major, minor) {
  return Math.hypot(Math.hypot(p[0], p[2]) - major, p[1]) - minor;
}

// A sphere with a thin ring, standing in for the AI twin project.
function orbit(p) {
  const ring = torus(rotZ(rotX(p, 1.2), 0.32), 0.78, 0.06);
  return Math.min(sphere(p, 0.48), ring);
}

const cube = (p) =>
  roundBox(rotX(rotY(p, 0.62), 0.48), [0.42, 0.42, 0.42], 0.05);

function slabs(p) {
  const q = rotX(rotY(p, 0.7), 0.5);
  let d = Infinity;
  for (const y of [-0.34, 0, 0.34]) {
    d = Math.min(d, roundBox(sub(q, [0, y, 0]), [0.55, 0.07, 0.4], 0.04));
  }
  return d;
}

const ring = (p) => torus(rotZ(rotX(p, 1.05), 0.35), 0.66, 0.27);

const KEY = norm([-0.55, 0.6, 0.65]);
const FILL = norm([0.65, -0.1, 0.5]);
const VIEW = [0, 0, 1];

function normalAt(sdf, p) {
  const e = 0.0015;
  return norm([
    sdf(add(p, [e, 0, 0])) - sdf(sub(p, [e, 0, 0])),
    sdf(add(p, [0, e, 0])) - sdf(sub(p, [0, e, 0])),
    sdf(add(p, [0, 0, e])) - sdf(sub(p, [0, 0, e])),
  ]);
}

// Ray-march one character cell per sample, looking down the -z axis.
function render(sdf, { cols, rows, height, centerY = 0 }) {
  const dy = height / rows;
  const dx = dy * CELL_ASPECT;
  const lines = [];
  for (let j = 0; j < rows; j++) {
    let line = "";
    for (let i = 0; i < cols; i++) {
      const x = (i - cols / 2 + 0.5) * dx;
      const y = centerY + (rows / 2 - j - 0.5) * dy;
      let t = 0;
      let hit = null;
      for (let step = 0; step < 96 && t < 5; step++) {
        const p = [x, y, 2.5 - t];
        const d = sdf(p);
        if (d < 0.001) {
          hit = p;
          break;
        }
        t += d;
      }
      if (!hit) {
        line += " ";
        continue;
      }
      const n = normalAt(sdf, hit);
      const rim = (1 - Math.max(0, dot(n, VIEW))) ** 3;
      const light =
        0.1 +
        0.78 * Math.max(0, dot(n, KEY)) +
        0.22 * Math.max(0, dot(n, FILL)) +
        0.25 * rim;
      const density = 1 - clamp(light, 0, 1);
      const index = clamp(
        Math.round(density * (RAMP.length - 1)),
        1,
        RAMP.length - 1,
      );
      line += RAMP[index];
    }
    lines.push(line.replace(/\s+$/, ""));
  }
  return lines.join("\n");
}

// Deterministic value noise, so the output only changes when the code does.
function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function valueNoise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const top = hash(xi, yi) * (1 - u) + hash(xi + 1, yi) * u;
  const bottom = hash(xi, yi + 1) * (1 - u) + hash(xi + 1, yi + 1) * u;
  return top * (1 - v) + bottom * v;
}

// Seeded random numbers, so the tree only changes when the code does.
function mulberry32(seed) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fbm = (x, y) =>
  0.5 * valueNoise(x, y) +
  0.3 * valueNoise(x * 2.07, y * 2.07) +
  0.2 * valueNoise(x * 4.3, y * 4.3);

// A wide, rounded tree in unit space: the trunk base sits at (0, 0) and the
// crown is about one unit tall. Wood is a list of tapered segments
// [x0, y0, x1, y1, r0, r1]; leaves are round clumps.
function growTree(seed, { depth = 7, leaves = true } = {}) {
  const rand = mulberry32(seed);
  const wood = [];
  const clumps = [];
  function grow(x, y, angle, length, radius, level) {
    // Two halves with a slight bend read less mechanical than one segment.
    const mx = x + Math.sin(angle) * length * 0.5;
    const my = y + Math.cos(angle) * length * 0.5;
    const bent = angle + (rand() - 0.5) * 0.3;
    const ex = mx + Math.sin(bent) * length * 0.5;
    const ey = my + Math.cos(bent) * length * 0.5;
    wood.push([x, y, mx, my, radius, radius * 0.86]);
    wood.push([mx, my, ex, ey, radius * 0.86, radius * 0.72]);
    if (leaves && level >= 4) {
      // Clumps hang along the outer branches as well as at the tips.
      for (let k = 0; k < (level >= depth ? 3 : 1); k++) {
        clumps.push({
          x: ex + (rand() - 0.5) * length * 0.9,
          y: ey + (rand() - 0.35) * length * 0.7,
          r: 0.05 + rand() * 0.045,
        });
      }
    }
    if (level >= depth) return;
    const kids = rand() < (level < 3 ? 0.5 : 0.18) ? 3 : 2;
    for (let k = 0; k < kids; k++) {
      const side = kids === 2 ? (k === 0 ? -1 : 1) : k - 1;
      const fan = 0.36 + rand() * 0.22;
      // Outer branches lean further out, so the crown spreads wide.
      const outward = Math.sign(bent) * Math.min(Math.abs(bent), 1.1) * 0.18;
      const child = clamp(
        bent * 0.9 + side * fan + outward + (rand() - 0.5) * 0.2,
        -1.5,
        1.5,
      );
      grow(
        ex,
        ey,
        child,
        length * (0.7 + rand() * 0.14),
        radius * 0.7,
        level + 1,
      );
    }
  }
  wood.push([0, 0, 0.01, 0.2, 0.045, 0.034]);
  for (const angle of [-0.78, -0.12, 0.62]) {
    grow(
      0.01,
      0.2,
      angle + (rand() - 0.5) * 0.15,
      0.2 + rand() * 0.05,
      0.026,
      1,
    );
  }
  return { wood, clumps };
}

function treeBounds({ wood, clumps }) {
  let left = Infinity;
  let right = -Infinity;
  let top = -Infinity;
  for (const [ax, ay, bx, by] of wood) {
    left = Math.min(left, ax, bx);
    right = Math.max(right, ax, bx);
    top = Math.max(top, ay, by);
  }
  for (const c of clumps) {
    left = Math.min(left, c.x - c.r);
    right = Math.max(right, c.x + c.r);
    top = Math.max(top, c.y + c.r);
  }
  return { left, right, top };
}

// A canvas of square subpixels, three across and five down per character
// cell, which is 0.6 wide by 1 tall. Each subpixel holds a darkness from 0 to 1.
function makeCanvas(cols, rows) {
  const sx = 3;
  const sy = 5;
  const width = cols * sx;
  const height = rows * sy;
  const data = new Float32Array(width * height);
  function plot(i, j, value) {
    if (i < 0 || j < 0 || i >= width || j >= height) return;
    const k = j * width + i;
    if (value > data[k]) data[k] = value;
  }
  function toText(cutoff = 0.07) {
    const lines = [];
    for (let j = 0; j < rows; j++) {
      let line = "";
      for (let i = 0; i < cols; i++) {
        let sum = 0;
        for (let b = 0; b < sy; b++) {
          for (let a = 0; a < sx; a++)
            sum += data[(j * sy + b) * width + i * sx + a];
        }
        const v = sum / (sx * sy);
        line +=
          v < cutoff
            ? " "
            : RAMP[
                clamp(
                  Math.round(v * (RAMP.length - 1) + 0.35),
                  1,
                  RAMP.length - 1,
                )
              ];
      }
      lines.push(line.replace(/\s+$/, ""));
    }
    return lines.join("\n");
  }
  return { width, height, sy, plot, toText };
}

// Draw a tree with its trunk base at subpixel (ox, oy), `scale` subpixels per unit.
function drawTree(canvas, tree, { ox, oy, scale, tone = 1, seed = 1 }) {
  const { plot } = canvas;
  const toX = (x) => ox + x * scale;
  const toY = (y) => oy - y * scale;
  const fromX = (i) => (i + 0.5 - ox) / scale;
  const fromY = (j) => (oy - j - 0.5) / scale;
  for (const [ax, ay, bx, by, r0, r1] of tree.wood) {
    const pad = Math.max(r0, r1, 0.0045);
    const dx = bx - ax;
    const dy = by - ay;
    const dd = dx * dx + dy * dy || 1;
    for (
      let j = Math.floor(toY(Math.max(ay, by) + pad));
      j <= toY(Math.min(ay, by) - pad);
      j++
    ) {
      for (
        let i = Math.floor(toX(Math.min(ax, bx) - pad));
        i <= toX(Math.max(ax, bx) + pad);
        i++
      ) {
        const wx = fromX(i);
        const wy = fromY(j);
        const t = clamp(((wx - ax) * dx + (wy - ay) * dy) / dd, 0, 1);
        const d = Math.hypot(wx - ax - dx * t, wy - ay - dy * t);
        if (d < Math.max(r0 + (r1 - r0) * t, 0.0045)) {
          plot(i, j, tone * (0.84 + 0.16 * hash(i * 0.37, j * 0.61)));
        }
      }
    }
  }
  for (const c of tree.clumps) {
    for (let j = Math.floor(toY(c.y + c.r)); j <= toY(c.y - c.r); j++) {
      for (let i = Math.floor(toX(c.x - c.r)); i <= toX(c.x + c.r); i++) {
        const wx = fromX(i);
        const wy = fromY(j);
        const q = ((wx - c.x) ** 2 + (wy - c.y) ** 2) / (c.r * c.r);
        if (q >= 1) continue;
        // Gaps where the sky shows through, and a darker underside on each
        // clump, so the crown reads as stacked masses.
        const n = fbm(wx * 38 + seed * 7, wy * 38);
        if (n < 0.33) continue;
        const under = clamp(0.66 - ((wy - c.y) / c.r) * 0.42, 0.18, 1);
        plot(
          i,
          j,
          tone *
            clamp(
              under * (0.5 + 1.15 * (n - 0.33)) * (0.72 + 0.28 * (1 - q)),
              0,
              1,
            ),
        );
      }
    }
  }
}

// The hero tree, with two small trees far behind it and a strip of ground.
function treeScene({ cols, rows, seed }) {
  const canvas = makeCanvas(cols, rows);
  const ground = canvas.height - canvas.sy * 3.2;
  const tree = growTree(seed);
  const b = treeBounds(tree);
  const scale = Math.min(
    (ground - canvas.sy * 2) / b.top,
    (canvas.width * 0.72) / (b.right - b.left),
  );
  const ox = canvas.width / 2 - ((b.left + b.right) / 2) * scale;
  for (const [x, size, s] of [
    [0.12, 0.32, seed + 5],
    [0.87, 0.27, seed + 9],
  ]) {
    const far = growTree(s, { depth: 6 });
    const fb = treeBounds(far);
    const fs = scale * size;
    drawTree(canvas, far, {
      ox: canvas.width * x - ((fb.left + fb.right) / 2) * fs,
      oy: ground - canvas.sy * 0.6,
      scale: fs,
      tone: 0.3,
      seed: s,
    });
  }
  for (let i = 0; i < canvas.width; i++) {
    const fall = 1 - Math.abs(i - ox) / (canvas.width * 0.16);
    if (fall <= 0) continue;
    for (let j = Math.floor(ground - 1); j < ground + 3; j++) {
      if (hash(i, j) < 0.5 * fall) canvas.plot(i, j, 0.35 + 0.4 * fall);
    }
  }
  drawTree(canvas, tree, { ox, oy: ground, scale, seed });
  return canvas.toText();
}

// Bare branches reaching in from both sides, for the call-to-action panel.
function branchesScene({ cols, rows, seed }) {
  const canvas = makeCanvas(cols, rows);
  const scale = canvas.height * 2.4;
  for (const [x, s] of [
    [0.04, seed],
    [0.96, seed + 3],
  ]) {
    const tree = growTree(s, { leaves: false, depth: 6 });
    drawTree(canvas, tree, {
      ox: canvas.width * x,
      oy: canvas.height * 1.55,
      scale,
      tone: 0.8,
      seed: s,
    });
  }
  return canvas.toText(0.05);
}

const SIZES = {
  tree: [150, 58],
  branches: [240, 40],
  orbit: [72, 30],
  cube: [72, 30],
  slabs: [72, 30],
  ring: [96, 40],
};

const art = {
  tree: treeScene({ cols: 150, rows: 58, seed: 4 }),
  branches: branchesScene({ cols: 240, rows: 40, seed: 12 }),
  orbit: render(orbit, { cols: 72, rows: 30, height: 2.15 }),
  cube: render(cube, { cols: 72, rows: 30, height: 2.15 }),
  slabs: render(slabs, { cols: 72, rows: 30, height: 2.15 }),
  ring: render(ring, { cols: 96, rows: 40, height: 2.1 }),
};

const treeCharacters = art.tree.replace(/\s/g, "").length;

process.stdout.write(
  `// Generated by design/scripts/render-ascii.mjs. Don't edit by hand.\n` +
    `window.ASCII = ${JSON.stringify(art, null, 2)};\n` +
    `window.ASCII_SIZES = ${JSON.stringify(SIZES)};\n` +
    `window.ASCII_TREE_CHARACTERS = ${treeCharacters};\n`,
);
