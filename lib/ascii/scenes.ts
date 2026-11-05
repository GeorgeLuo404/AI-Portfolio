import "server-only";
import { CELL_ASPECT, clamp, RAMP } from "./tones";

// The fixed ASCII art, rendered while the site builds: pond ripples for the
// contact panel, and small objects for the project wells and the skills
// section. Ported from design/scripts/render-ascii.mjs, which still renders
// the T3 prototype's copy. Everything is deterministic, so the output only
// changes when this code does.

type Vec = [number, number, number];

const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: Vec, s: number): Vec => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: Vec) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: Vec) => mul(a, 1 / len(a));

function rotX(p: Vec, a: number): Vec {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [p[0], c * p[1] - s * p[2], s * p[1] + c * p[2]];
}
function rotY(p: Vec, a: number): Vec {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [c * p[0] + s * p[2], p[1], -s * p[0] + c * p[2]];
}
function rotZ(p: Vec, a: number): Vec {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [c * p[0] - s * p[1], s * p[0] + c * p[1], p[2]];
}

type Sdf = (p: Vec) => number;

const sphere = (p: Vec, r: number) => len(p) - r;
function roundBox(p: Vec, b: Vec, r: number) {
  const q: Vec = [
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
function torus(p: Vec, major: number, minor: number) {
  return Math.hypot(Math.hypot(p[0], p[2]) - major, p[1]) - minor;
}

// A sphere with a thin ring, standing in for the AI twin project.
const orbit: Sdf = (p) =>
  Math.min(sphere(p, 0.48), torus(rotZ(rotX(p, 1.2), 0.32), 0.78, 0.06));

const cube: Sdf = (p) =>
  roundBox(rotX(rotY(p, 0.62), 0.48), [0.42, 0.42, 0.42], 0.05);

const slabs: Sdf = (p) => {
  const q = rotX(rotY(p, 0.7), 0.5);
  let d = Number.POSITIVE_INFINITY;
  for (const y of [-0.34, 0, 0.34]) {
    d = Math.min(d, roundBox(sub(q, [0, y, 0]), [0.55, 0.07, 0.4], 0.04));
  }
  return d;
};

const ring: Sdf = (p) => torus(rotZ(rotX(p, 1.05), 0.35), 0.66, 0.27);

const KEY = norm([-0.55, 0.6, 0.65]);
const FILL = norm([0.65, -0.1, 0.5]);
const VIEW: Vec = [0, 0, 1];

function normalAt(sdf: Sdf, p: Vec) {
  const e = 0.0015;
  return norm([
    sdf(add(p, [e, 0, 0])) - sdf(sub(p, [e, 0, 0])),
    sdf(add(p, [0, e, 0])) - sdf(sub(p, [0, e, 0])),
    sdf(add(p, [0, 0, e])) - sdf(sub(p, [0, 0, e])),
  ]);
}

// Ray-march one character cell per sample, looking down the -z axis.
function renderObject(sdf: Sdf, cols: number, rows: number, height: number) {
  const dy = height / rows;
  const dx = dy * CELL_ASPECT;
  const lines: string[] = [];
  for (let j = 0; j < rows; j++) {
    let line = "";
    for (let i = 0; i < cols; i++) {
      const x = (i - cols / 2 + 0.5) * dx;
      const y = (rows / 2 - j - 0.5) * dy;
      let t = 0;
      let hit: Vec | null = null;
      for (let step = 0; step < 96 && t < 5; step++) {
        const p: Vec = [x, y, 2.5 - t];
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
      // Every surface cell gets at least a ".", so silhouettes stay readable
      // where the light is brightest.
      line += RAMP[clamp(Math.round(density * (RAMP.length - 1)), 1, 9)];
    }
    lines.push(line.trimEnd());
  }
  return lines.join("\n");
}

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function valueNoise(x: number, y: number) {
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

// Ripples on a pond seen at a low angle, spreading from near both ends of the
// panel and broken here and there as on moving water. Drawn on square
// subpixels, three across and five down per character cell.
function renderRipples(cols: number, rows: number) {
  const sx = 3;
  const sy = 5;
  const width = cols * sx;
  const height = rows * sy;
  const ink = new Float32Array(width * height);
  const squash = 0.42;
  const sources: Vec[] = [
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
        radii.forEach((radius, n) => {
          // Thicker toward the viewer, at the bottom of each ring.
          const thick = 1.1 + 0.9 * Math.max(0, Math.sin(a));
          // Measured on screen, where the ring is squashed top to bottom.
          const d =
            Math.abs(r - radius) *
            Math.hypot(Math.cos(a), squash * Math.sin(a));
          if (d > thick) return;
          if (valueNoise(a * (3 + n * 1.4) + seed, n * 1.7 + seed) < 0.36) {
            return;
          }
          const k = j * width + i;
          ink[k] = Math.max(ink[k], (1 - d / thick) * (0.95 - n * 0.09));
        });
      }
    }
  }
  const lines: string[] = [];
  for (let j = 0; j < rows; j++) {
    let line = "";
    for (let i = 0; i < cols; i++) {
      let sum = 0;
      for (let b = 0; b < sy; b++) {
        for (let a = 0; a < sx; a++)
          sum += ink[(j * sy + b) * width + i * sx + a];
      }
      const v = sum / (sx * sy);
      line += v < 0.05 ? " " : RAMP[clamp(Math.round(v * 9 + 0.35), 1, 9)];
    }
    lines.push(line.trimEnd());
  }
  return lines.join("\n");
}

const SCENES = {
  ripples: { cols: 240, rows: 40, draw: () => renderRipples(240, 40) },
  orbit: { cols: 72, rows: 30, draw: () => renderObject(orbit, 72, 30, 2.15) },
  cube: { cols: 72, rows: 30, draw: () => renderObject(cube, 72, 30, 2.15) },
  slabs: { cols: 72, rows: 30, draw: () => renderObject(slabs, 72, 30, 2.15) },
  ring: { cols: 96, rows: 40, draw: () => renderObject(ring, 96, 40, 2.1) },
};

export type SceneName = keyof typeof SCENES;

const cache = new Map<SceneName, string>();

/** A scene's characters and size, rendered once per build. */
export function getScene(name: SceneName) {
  const { cols, rows, draw } = SCENES[name];
  let text = cache.get(name);
  if (text === undefined) {
    text = draw();
    cache.set(name, text);
  }
  return { cols, rows, text };
}
