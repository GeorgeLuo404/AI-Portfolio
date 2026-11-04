// Renders the placeholder ASCII art for the T3 design prototype.
// Each scene is a small signed-distance-field model, ray-marched with an
// orthographic camera and shaded into characters. T7 replaces the portrait
// with one converted from a real photo.
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
function ellipsoid(p, r) {
  const k0 = len([p[0] / r[0], p[1] / r[1], p[2] / r[2]]);
  const k1 = len([p[0] / r[0] ** 2, p[1] / r[1] ** 2, p[2] / r[2] ** 2]);
  return (k0 * (k0 - 1)) / k1;
}
function capsule(p, a, b, r) {
  const pa = sub(p, a);
  const ba = sub(b, a);
  const h = clamp(dot(pa, ba) / dot(ba, ba), 0, 1);
  return len(sub(pa, mul(ba, h))) - r;
}
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
function smin(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}
const smax = (a, b, k) => -smin(-a, -b, k);

// A head-and-shoulders bust, turned slightly to the viewer's left.
function bust(p) {
  const h = rotY(sub(p, [0, 0.52, 0]), 0.38);
  let head = ellipsoid(h, [0.26, 0.34, 0.29]);
  head = smin(
    head,
    ellipsoid(sub(h, [0, -0.17, 0.05]), [0.19, 0.17, 0.21]),
    0.12,
  );
  head = smin(
    head,
    ellipsoid(sub(h, [0, -0.03, 0.29]), [0.045, 0.08, 0.06]),
    0.04,
  );
  for (const side of [-1, 1]) {
    const ear = ellipsoid(
      sub(h, [side * 0.26, -0.03, -0.02]),
      [0.04, 0.08, 0.05],
    );
    head = smin(head, ear, 0.03);
    head = smax(head, -sphere(sub(h, [side * 0.09, 0.05, 0.25]), 0.05), 0.03);
  }
  head = smin(
    head,
    ellipsoid(sub(h, [0, 0.09, -0.05]), [0.28, 0.3, 0.31]),
    0.05,
  );
  const neck = capsule(p, [0, 0.24, -0.02], [0, -0.08, 0], 0.125);
  const torso = ellipsoid(sub(p, [0, -0.6, -0.02]), [0.74, 0.44, 0.3]);
  return smin(smin(head, neck, 0.08), torso, 0.14);
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

// A drifting field of characters for the dark call-to-action band.
function field({ cols, rows }) {
  const ramp = " .:-=+*";
  const lines = [];
  for (let j = 0; j < rows; j++) {
    let line = "";
    for (let i = 0; i < cols; i++) {
      const x = i * 0.06;
      const y = j * 0.1;
      const n =
        0.6 * valueNoise(x, y) +
        0.3 * valueNoise(x * 2.1, y * 2.1) +
        0.1 * hash(i, j);
      const fade = Math.sin((Math.PI * j) / (rows - 1)) ** 0.6;
      const level = clamp((n - 0.35) * 2.2 * fade, 0, 0.999);
      line += ramp[Math.floor(level * ramp.length)];
    }
    lines.push(line.replace(/\s+$/, ""));
  }
  return lines.join("\n");
}

const art = {
  bust: render(bust, { cols: 112, rows: 70, height: 1.8, centerY: 0.05 }),
  orbit: render(orbit, { cols: 72, rows: 30, height: 2.15 }),
  cube: render(cube, { cols: 72, rows: 30, height: 2.15 }),
  slabs: render(slabs, { cols: 72, rows: 30, height: 2.15 }),
  ring: render(ring, { cols: 96, rows: 40, height: 2.1 }),
  field: field({ cols: 240, rows: 34 }),
};

const characters = art.bust.replace(/\s/g, "").length;

process.stdout.write(
  `// Generated by design/scripts/render-ascii.mjs. Don't edit by hand.\n` +
    `window.ASCII = ${JSON.stringify(art, null, 2)};\n` +
    `window.ASCII_PORTRAIT_CHARACTERS = ${characters};\n`,
);
