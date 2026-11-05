// Renders the fixed ASCII art for the T3 design prototype: ripples for the
// call to action, and small signed-distance-field objects, ray-marched with an
// orthographic camera and shaded into characters, for the project images. The
// hero's koi move, so design/koi.js draws them in the browser.
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

// Ripples on a pond seen at a low angle, spreading from near both ends of
// the call-to-action panel and broken here and there as on moving water.
function ripplesScene({ cols, rows }) {
  const canvas = makeCanvas(cols, rows);
  const { width, height } = canvas;
  const squash = 0.42;
  const sources = [
    [0.11 * width, 0.62 * height, 3],
    [0.89 * width, 0.4 * height, 8],
  ];
  const radii = Array.from({ length: 7 }, (_, n) => 26 * (n + 1) ** 1.18);
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      for (const [cx, cy, seed] of sources) {
        const dx = i - cx;
        const dy = (j - cy) / squash;
        const r = Math.hypot(dx, dy);
        const a = Math.atan2(dy, dx);
        radii.forEach((ring, n) => {
          // Thicker toward the viewer, at the bottom of each ring.
          const thick = 1.1 + 0.9 * Math.max(0, Math.sin(a));
          // Measured on screen, where the ring is squashed top to bottom.
          const d =
            Math.abs(r - ring) * Math.hypot(Math.cos(a), squash * Math.sin(a));
          if (d > thick) return;
          if (valueNoise(a * (3 + n * 1.4) + seed, n * 1.7 + seed) < 0.36)
            return;
          canvas.plot(i, j, (1 - d / thick) * (0.95 - n * 0.09));
        });
      }
    }
  }
  return canvas.toText(0.05);
}

const SIZES = {
  ripples: [240, 40],
  orbit: [72, 30],
  cube: [72, 30],
  slabs: [72, 30],
  ring: [96, 40],
};

const art = {
  ripples: ripplesScene({ cols: 240, rows: 40 }),
  orbit: render(orbit, { cols: 72, rows: 30, height: 2.15 }),
  cube: render(cube, { cols: 72, rows: 30, height: 2.15 }),
  slabs: render(slabs, { cols: 72, rows: 30, height: 2.15 }),
  ring: render(ring, { cols: 96, rows: 40, height: 2.1 }),
};

process.stdout.write(
  `// Generated by design/scripts/render-ascii.mjs. Don't edit by hand.\n` +
    `window.ASCII = ${JSON.stringify(art, null, 2)};\n` +
    `window.ASCII_SIZES = ${JSON.stringify(SIZES)};\n`,
);
