import { clamp, RAMP, smooth } from "@/lib/ascii/tones";

// The hero's koi, drawn in characters: one fish in solid ink and one in
// outline, circling each other clockwise like a yin-yang, inside a brushed
// ring that turns with them. Ported from the T3 prototype, design/koi.js.
// This file holds no DOM code, so the server can draw the footer's still
// pair while the site builds, and `components/koi-figure.tsx` animates the
// hero's pair in the browser.
//
// The koi are drawn from scratch. George's reference images set the mood
// only, and nothing is traced from them.

const NOISE = ".:-=+*#%@";
export const COLS = 180;
// JetBrains Mono advances 0.6em, and the art sets line-height to 1.
const CELL_W = 0.6;

// Lengths are in units of the ring's radius.
const RING = 0.915;
const TAU = 2 * Math.PI;
// Each head circles at ORBIT, and the body spirals out behind it to OUTER,
// so each tail sweeps around outside the other fish's head.
const ORBIT = 0.25;
const OUTER = 0.64;
const BODY = 1.05;
// The tail reaches this far past the end of the body.
const TAIL = 0.66;
const LENGTH = BODY + TAIL;
const WIDTH = 0.165;
const SPINE = 84;
// One lap every 26 seconds, and the ring turns with the fish.
const SPEED = (TAU * ORBIT) / 26;
const TURN = SPEED / ORBIT;
// The solid fish's head starts near the top, as in a yin-yang.
const START = (80 * Math.PI) / 180;
// The eye, in the other fish's color, doubles as the yin-yang's dot. It sits
// a little toward the back, `EYE_UP` from the middle of the body.
const EYE_AT = 0.12;
const EYE_UP = 0.035;
const EYE_R = 0.052;

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = smooth(0, 1, x - xi);
  const v = smooth(0, 1, y - yi);
  const top = mix(hash(xi, yi), hash(xi + 1, yi), u);
  const bottom = mix(hash(xi, yi + 1), hash(xi + 1, yi + 1), u);
  return mix(top, bottom, v);
}

// The same noise, but repeating every `period` along x, for going around the
// ring without a seam.
function loopNoise(x: number, y: number, period: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = smooth(0, 1, x - xi);
  const v = smooth(0, 1, y - yi);
  const a = ((xi % period) + period) % period;
  const b = (a + 1) % period;
  const top = mix(hash(a, yi), hash(b, yi), u);
  const bottom = mix(hash(a, yi + 1), hash(b, yi + 1), u);
  return mix(top, bottom, v);
}

// Half the body's width from the snout (0) to the base of the tail (1): a
// blunt, round nose, the widest point a third of the way back, then a long
// taper.
function bodyWidth(s: number) {
  if (s < 0.14) {
    return WIDTH * 0.72 * Math.sqrt(Math.max(0, 1 - ((0.14 - s) / 0.14) ** 2));
  }
  if (s < 0.32) return WIDTH * mix(0.72, 1, smooth(0.14, 0.32, s));
  return WIDTH * (1 - 0.75 * smooth(0.32, 1, s) ** 1.15);
}

// Rows of overlapping scales from behind the head, each drawn as the arc of
// its back edge.
function scales(l: number, lat: number) {
  const s = l / BODY;
  if (s < 0.3 || s > 0.95) return 0;
  const size = 0.085;
  const row = (l - 0.3 * BODY) / (size * 0.75);
  const r = Math.floor(row);
  const along = (row - r) * size * 0.75;
  const col = lat / size + (r % 2) * 0.5;
  const across = (col - Math.round(col)) * size;
  const d = Math.abs(Math.hypot(along, across) - size * 0.55);
  return along > size * 0.12 ? clamp(1 - d / 0.022, 0, 1) : 0;
}

const widthAt = (l: number) => bodyWidth(clamp(l / BODY, 0, 1));

// The fish are drawn side on, bent into the yin-yang with their bellies to
// the ring and their backs facing each other across the S-curve, so the
// paired fins hang outward. The belly is fuller than the back is high. A
// positive offset is toward the belly, on the fish's left as it swims
// clockwise.
const bellyAt = (l: number) => widthAt(l) * 1.06;
const backAt = (l: number) => widthAt(l) * 0.88;

// For each point on the spine: how far the body sits outside the head's
// circle, and how far back along that circle it is, so that the body keeps
// its length as it spirals out.
const SPIRAL_OUT = new Float32Array(SPINE + 1);
const SPIRAL_BACK = new Float32Array(SPINE + 1);
for (let k = 1; k <= SPINE; k++) {
  const r = ORBIT + (OUTER - ORBIT) * (k / SPINE) ** 1.3;
  SPIRAL_OUT[k] = r - ORBIT;
  SPIRAL_BACK[k] = SPIRAL_BACK[k - 1] + (LENGTH / SPINE) * (ORBIT / r);
}

/** Maps a distance along a fish's path to a point. */
type Track = (d: number) => [number, number];

type Fish = {
  kind: "ink" | "paper";
  track: Track;
  d: number;
  speed: number;
  phase: number;
  fin: number;
  amp: number;
  /** 1 while circling, so the body spirals out; 0 while swimming straight. */
  spiral: number;
  gone: boolean;
  arrive: { start: number; span: number; run: number } | null;
};

type Point = { x: number; y: number; l: number; tx: number; ty: number };

// Every fish circles clockwise, and `angle` is where its head is at
// distance 0.
function orbit(angle: number): Track {
  return (d) => {
    const a = angle - d / ORBIT;
    return [ORBIT * Math.cos(a), ORBIT * Math.sin(a)];
  };
}

// Straight on from the head, the way it was heading, with the body following
// its own shape from the moment it turned away.
function leaving(fish: Fish): Track {
  const pts = baseSpine(fish);
  const at = fish.d;
  const head = pts[0];
  const path = [{ x: head.x, y: head.y, s: 0 }];
  for (let k = 1; k < pts.length; k++) {
    const q = path[k - 1];
    const { x, y } = pts[k];
    path.push({ x, y, s: q.s + Math.hypot(x - q.x, y - q.y) });
  }
  const end = path[path.length - 1];
  const before = path[path.length - 2];
  const len = Math.hypot(end.x - before.x, end.y - before.y) || 1;
  const ex = (end.x - before.x) / len;
  const ey = (end.y - before.y) / len;
  return (d) => {
    if (d >= at) {
      return [head.x + head.tx * (d - at), head.y + head.ty * (d - at)];
    }
    const behind = at - d;
    if (behind >= end.s) {
      return [end.x + ex * (behind - end.s), end.y + ey * (behind - end.s)];
    }
    let k = 1;
    while (path[k].s < behind) k++;
    const a = path[k - 1];
    const b = path[k];
    const t = (behind - a.s) / (b.s - a.s || 1);
    return [mix(a.x, b.x, t), mix(a.y, b.y, t)];
  };
}

// A straight run `run` units long that meets the orbit at `angle`, then the
// orbit.
function arriving(angle: number, run: number): Track {
  const around = orbit(angle);
  const [x0, y0] = around(0);
  const tx = Math.sin(angle);
  const ty = -Math.cos(angle);
  return (d) =>
    d >= run ? around(d - run) : [x0 - tx * (run - d), y0 - ty * (run - d)];
}

function makeFish(kind: Fish["kind"], angle: number): Fish {
  return {
    kind,
    track: orbit(angle),
    d: 0,
    speed: SPEED,
    phase: kind === "ink" ? 0 : 2.1,
    fin: kind === "ink" ? 0 : 1.4,
    amp: 0.035,
    spiral: 1,
    gone: false,
    arrive: null,
  };
}

const swimmingPair = () => [
  makeFish("ink", START),
  makeFish("paper", START + Math.PI),
];

/** A still pair, for the footer and for reduced motion. */
function stillPair() {
  const pair = swimmingPair();
  pair[0].phase = 1.2;
  pair[1].phase = 3.6;
  return pair;
}

// Unit tangents pointing toward the head.
function tangents(pts: Point[]) {
  for (let k = 0; k < pts.length; k++) {
    const a = pts[Math.max(0, k - 1)];
    const b = pts[Math.min(pts.length - 1, k + 1)];
    const tx = a.x - b.x;
    const ty = a.y - b.y;
    const len = Math.hypot(tx, ty) || 1;
    pts[k].tx = tx / len;
    pts[k].ty = ty / len;
  }
}

// Points from snout to tail tip along the fish's track, spiralling out while
// it circles.
function baseSpine(fish: Fish) {
  const pts: Point[] = [];
  for (let k = 0; k <= SPINE; k++) {
    const l = (k / SPINE) * LENGTH;
    let [x, y] = fish.track(fish.d - mix(l, SPIRAL_BACK[k], fish.spiral));
    const out = SPIRAL_OUT[k] * fish.spiral;
    if (out > 0) {
      const r = Math.hypot(x, y) || 1;
      x += (x / r) * out;
      y += (y / r) * out;
    }
    pts.push({ x, y, l, tx: 1, ty: 0 });
  }
  tangents(pts);
  return pts;
}

// The spine, bent by a wave that travels toward the tail and grows along the
// body.
function spine(fish: Fish) {
  const pts = baseSpine(fish);
  for (const p of pts) {
    const r = p.l / LENGTH;
    const off =
      fish.amp *
      (0.1 + 0.9 * r ** 1.7) *
      Math.sin((2 * Math.PI * p.l) / 1.35 - fish.phase);
    p.x -= p.ty * off;
    p.y += p.tx * off;
  }
  tangents(pts);
  return pts;
}

function pointAt(pts: Point[], l: number) {
  const k = clamp(Math.floor((l / LENGTH) * SPINE), 0, SPINE - 1);
  const a = pts[k];
  const b = pts[k + 1];
  const t = clamp((l - a.l) / (b.l - a.l), 0, 1);
  return {
    x: mix(a.x, b.x, t),
    y: mix(a.y, b.y, t),
    tx: mix(a.tx, b.tx, t),
    ty: mix(a.ty, b.ty, t),
  };
}

/**
 * A grid of character cells. Positions are in units with y up and the
 * ring's center in the middle of the grid; `s` is one unit in em.
 */
export type Field = ReturnType<typeof makeField>;

export function makeField(cols: number, rows: number) {
  const w = cols * CELL_W;
  const s = 0.47 * Math.min(w, rows);
  const n = cols * rows;
  const f = {
    cols,
    rows,
    n,
    s,
    w,
    cu: CELL_W / s,
    cv: 1 / s,
    aa: 0,
    halfW: w / 2 / s,
    halfH: rows / 2 / s,
    x: new Float32Array(n),
    y: new Float32Array(n),
    r: new Float32Array(n),
    a: new Float32Array(n),
    // Water and ring under the fish.
    bg: new Float32Array(n),
    // The fish, premultiplied by their coverage.
    ink: new Float32Array(n),
    cov: new Float32Array(n),
    // Scratch space for the body's distance field.
    sd: new Float32Array(n),
    bl: new Float32Array(n),
    lat: new Float32Array(n),
    // When each cell settles during the load animation, from 0 to 1.
    reveal: new Float32Array(n),
    ringCells: [] as number[],
  };
  f.aa = 0.7 * Math.sqrt(f.cu * f.cv);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      const x = ((i + 0.5) * CELL_W - w / 2) / s;
      const y = (rows / 2 - (j + 0.5)) / s;
      f.x[k] = x;
      f.y[k] = y;
      f.r[k] = Math.hypot(x, y);
      f.a[k] = Math.atan2(y, x);
      f.reveal[k] = Math.random();
      if (Math.abs(f.r[k] - RING) < 0.17) f.ringCells.push(k);
    }
  }
  return f;
}

// Call fn(k, x, y) for each cell whose center lies in a box, in units.
function eachCell(
  f: Field,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  fn: (k: number, x: number, y: number) => void,
) {
  const i0 = Math.max(0, Math.floor((x0 * f.s + f.w / 2) / CELL_W - 0.5));
  const i1 = Math.min(
    f.cols - 1,
    Math.ceil((x1 * f.s + f.w / 2) / CELL_W - 0.5),
  );
  const j0 = Math.max(0, Math.floor(f.rows / 2 - y1 * f.s - 0.5));
  const j1 = Math.min(f.rows - 1, Math.ceil(f.rows / 2 - y0 * f.s - 0.5));
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) {
      const k = j * f.cols + i;
      fn(k, f.x[k], f.y[k]);
    }
  }
}

// Paint over what is already there, so a fish covers whatever is under it.
function over(f: Field, k: number, cov: number, value: number) {
  f.ink[k] = value * cov + f.ink[k] * (1 - cov);
  f.cov[k] = cov + f.cov[k] * (1 - cov);
}

// A line just inside an outline, for the fish drawn in outline.
const outline = (f: Field, sd: number) =>
  clamp(1 - Math.abs(sd + 1.2 * f.aa) / (1.5 * f.aa), 0, 1);

type Tail = { angle: number; weight: number };

// The ring: one brush stroke that turns clockwise with the koi. It swells
// just behind each tail, as if the fish were stirring it, runs dry between
// them, and its edge drifts as it turns. `turn` is how far it has turned,
// and `drawn` how much of it is painted, from 0 to 1, clockwise from the top
// of its own turning frame.
function drawRing(
  f: Field,
  turn: number,
  time: number,
  tails: Tail[],
  drawn: number,
) {
  for (const k of f.ringCells) {
    const a = f.a[k];
    const own = (((a + turn) % TAU) + TAU) % TAU;
    if (drawn < 1 && (((Math.PI / 2 - own) % TAU) + TAU) % TAU > drawn * TAU) {
      continue;
    }
    let swell = 0;
    for (const tail of tails) {
      let gap = Math.abs(a - tail.angle) % TAU;
      if (gap > Math.PI) gap = TAU - gap;
      swell = Math.max(swell, tail.weight * Math.exp(-((gap / 0.95) ** 2)));
    }
    const drift = loopNoise((own / TAU) * 6, time * 0.08, 6);
    const radius =
      RING *
      (1 + 0.03 * (drift - 0.5) + 0.012 * Math.sin(2 * own + time * 0.3));
    const hw =
      0.032 *
      (0.45 + 1.15 * swell) *
      (0.85 + 0.3 * loopNoise((own / TAU) * 10, time * 0.12 + 7, 10));
    const dr = f.r[k] - radius;
    const cov = clamp(0.5 - (Math.abs(dr) - hw) / f.aa, 0, 1);
    if (cov <= 0) continue;
    const streak = loopNoise((own / TAU) * 64, (dr / hw) * 1.5 + 4.3, 64);
    let ink = 0.5 + 0.4 * streak;
    if (streak < (1 - swell) * 0.6) ink *= 0.22;
    if (cov * ink > f.bg[k]) f.bg[k] = cov * ink;
  }
}

// Faint ripples spreading out from the ring.
function drawRipples(f: Field, t: number) {
  for (let k = 0; k < f.n; k++) {
    const r = f.r[k];
    if (r < RING + 0.1) continue;
    let ink = 0;
    for (let m = 0; m < 3; m++) {
      const ph = (t / 12 + m / 3) % 1;
      const d = Math.abs(r - (RING + 0.15 + ph * 1.25));
      if (d > f.aa * 1.4) continue;
      if (noise(f.a[k] * 3.2 + m * 17.3, ph * 2.4) < 0.42) continue;
      const line = clamp(1 - d / (f.aa * 1.2), 0, 1);
      ink = Math.max(ink, line * 0.36 * (1 - ph) ** 1.4 * smooth(0, 0.08, ph));
    }
    if (ink > f.bg[k]) f.bg[k] = ink;
  }
}

// A fin on the belly, rooted `root` below the middle of the body and swept
// back along it. It paddles a little as the fish swims.
function drawFin(
  f: Field,
  fish: Fish,
  pts: Point[],
  at: number,
  length: number,
  width: number,
  spread: number,
  root: number,
) {
  const solid = fish.kind === "ink";
  const p = pointAt(pts, at);
  // Toward the belly, on the fish's left.
  const nx = -p.ty;
  const ny = p.tx;
  const rx = p.x + nx * root;
  const ry = p.y + ny * root;
  const turn = spread + 0.14 * Math.sin(fish.fin + at * 5);
  const c = Math.cos(turn);
  const s = Math.sin(turn);
  const dx = -p.tx * c + nx * s;
  const dy = -p.ty * c + ny * s;
  const ex = rx + dx * length;
  const ey = ry + dy * length;
  const pad = width + f.aa;
  eachCell(
    f,
    Math.min(rx, ex) - pad,
    Math.min(ry, ey) - pad,
    Math.max(rx, ex) + pad,
    Math.max(ry, ey) + pad,
    (k, x, y) => {
      const qx = x - rx;
      const qy = y - ry;
      const u = (qx * dx + qy * dy) / length;
      if (u < -0.1 || u > 1.1) return;
      const v = -qx * dy + qy * dx;
      const uc = clamp(u, 0, 1);
      const hw = width * uc ** 0.4 * Math.sqrt(Math.max(0, 1 - uc ** 3));
      const sd = Math.max(Math.abs(v) - hw, -u * length, (u - 1) * length);
      const cov = clamp(0.5 - sd / f.aa, 0, 1);
      if (cov <= 0) return;
      const rays = (0.5 + 0.5 * Math.cos(Math.atan2(v, u * length) * 20)) ** 4;
      const value = solid
        ? 0.52 - 0.12 * uc + 0.16 * rays
        : Math.max(0.74 * outline(f, sd), 0.08, 0.26 * rays * uc);
      over(f, k, solid ? cov * 0.92 : cov, value);
    },
  );
}

// Rasterize a strip into the scratch arrays: the union of tapered capsules
// along the spine from `from` to `to`, `width(l)` wide and pushed sideways by
// `offset(l)`. Then shade(k, sd, l, lat) paints each cell it covers.
function strip(
  f: Field,
  pts: Point[],
  from: number,
  to: number,
  width: (l: number) => number,
  offset: (l: number) => number,
  shade: (k: number, sd: number, l: number, lat: number) => void,
) {
  const line: (Point & { w: number })[] = [];
  for (const p of pts) {
    if (p.l < from - 1e-6 || p.l > to + 1e-6) continue;
    const o = offset(p.l);
    line.push({
      x: p.x - p.ty * o,
      y: p.y + p.tx * o,
      l: p.l,
      w: width(p.l),
      tx: p.tx,
      ty: p.ty,
    });
  }
  let x0 = Number.POSITIVE_INFINITY;
  let y0 = Number.POSITIVE_INFINITY;
  let x1 = Number.NEGATIVE_INFINITY;
  let y1 = Number.NEGATIVE_INFINITY;
  for (const p of line) {
    x0 = Math.min(x0, p.x - p.w);
    y0 = Math.min(y0, p.y - p.w);
    x1 = Math.max(x1, p.x + p.w);
    y1 = Math.max(y1, p.y + p.w);
  }
  x0 -= f.aa;
  y0 -= f.aa;
  x1 += f.aa;
  y1 += f.aa;
  eachCell(f, x0, y0, x1, y1, (k) => {
    f.sd[k] = 1e9;
  });
  for (let m = 0; m < line.length - 1; m++) {
    const a = line[m];
    const b = line[m + 1];
    const ex = b.x - a.x;
    const ey = b.y - a.y;
    const len2 = ex * ex + ey * ey || 1e-9;
    const reach = Math.max(a.w, b.w) + f.aa;
    eachCell(
      f,
      Math.min(a.x, b.x) - reach,
      Math.min(a.y, b.y) - reach,
      Math.max(a.x, b.x) + reach,
      Math.max(a.y, b.y) + reach,
      (k, x, y) => {
        const t = clamp(((x - a.x) * ex + (y - a.y) * ey) / len2, 0, 1);
        const cx = a.x + ex * t;
        const cy = a.y + ey * t;
        const sd = Math.hypot(x - cx, y - cy) - mix(a.w, b.w, t);
        if (sd >= f.sd[k]) return;
        f.sd[k] = sd;
        f.bl[k] = mix(a.l, b.l, t);
        f.lat[k] =
          -(x - cx) * mix(a.ty, b.ty, t) + (y - cy) * mix(a.tx, b.tx, t);
      },
    );
  }
  eachCell(f, x0, y0, x1, y1, (k) => {
    if (f.sd[k] <= f.aa) shade(k, f.sd[k], f.bl[k], f.lat[k]);
  });
}

function drawBody(f: Field, fish: Fish, pts: Point[]) {
  const solid = fish.kind === "ink";
  const middle = (l: number) => (bellyAt(l) - backAt(l)) / 2;
  strip(
    f,
    pts,
    0,
    BODY,
    (l) => (bellyAt(l) + backAt(l)) / 2,
    middle,
    (k, sd, l, lat) => {
      // Measured from the middle of the body, positive toward the back.
      const up = -(lat + middle(l));
      const eye = Math.hypot(l - EYE_AT, up - EYE_UP) - EYE_R;
      const inEye = clamp(0.5 - eye / f.aa, 0, 1);
      // The gill cover: an arc behind the eye.
      const w = widthAt(l) || 1;
      const gill =
        clamp(
          1 - Math.abs(l - 0.22 - 0.07 * (up / w) ** 2) / (0.9 * f.aa),
          0,
          1,
        ) * (Math.abs(up) < 0.75 * w ? 1 : 0);
      const scale = scales(l, up);
      const value = solid
        ? (0.96 - 0.18 * scale - 0.34 * gill) * (1 - inEye)
        : Math.max(0.88 * outline(f, sd), 0.1 + 0.2 * scale, 0.6 * gill, inEye);
      over(f, k, clamp(0.5 - sd / f.aa, 0, 1), value);
    },
  );
}

// A fin that stands off the body along a stretch of it, on the belly side
// when `side` is 1 and the back when it is -1, with rays raked toward the
// tail and an edge that ripples.
function drawRidge(
  f: Field,
  fish: Fish,
  pts: Point[],
  from: number,
  to: number,
  height: number,
  side: 1 | -1,
) {
  const solid = fish.kind === "ink";
  const span = to - from;
  const tall = (l: number) => {
    const u = clamp((l - from) / span, 0, 1);
    return (
      height *
      Math.sin(Math.PI * u) ** 0.65 *
      (1 + 0.16 * Math.sin(u * 11 - fish.fin * 1.3))
    );
  };
  const base = side > 0 ? bellyAt : backAt;
  strip(
    f,
    pts,
    from,
    to,
    (l) => tall(l) / 2 + 0.014,
    (l) => side * (base(l) + tall(l) / 2 - 0.014),
    (k, sd, l, lat) => {
      const out = side * lat + tall(l) / 2;
      const rays = (0.5 + 0.5 * Math.cos(((l - 0.7 * out) / 0.034) * TAU)) ** 4;
      const value = solid
        ? 0.2 + 0.46 * rays
        : Math.max(0.7 * outline(f, sd), 0.06, 0.36 * rays);
      over(f, k, clamp(0.5 - sd / f.aa, 0, 1) * (solid ? 0.92 : 1), value);
    },
  );
}

// The tail: one fan that widens from the base of the body, ends in two soft
// points with the middle of its edge cut back, and sways a little behind the
// body. Fine streaks run along it and fade toward the edge.
function drawTail(f: Field, fish: Fish, pts: Point[]) {
  const solid = fish.kind === "ink";
  const at = (l: number) => clamp((l - BODY) / TAIL, 0, 1);
  const base = (bellyAt(BODY) + backAt(BODY)) / 2;
  const width = (l: number) => {
    const x = at(l);
    return (
      mix(base, 0.15, smooth(0, 0.55, x)) * (1 - 0.22 * smooth(0.78, 1, x))
    );
  };
  const sway = (l: number) => {
    const x = at(l);
    return 0.035 * x * x * Math.sin(fish.fin * 1.1 - x * 4);
  };
  strip(f, pts, BODY - 0.05, LENGTH, width, sway, (k, sd, l, lat) => {
    const x = at(l);
    const across = clamp(lat / width(l), -1, 1);
    const fork = (x - (1 - 0.4 * (1 - Math.abs(across)) ** 1.3)) * TAIL;
    const edge = Math.max(sd, fork);
    const cov = clamp(0.5 - edge / f.aa, 0, 1);
    if (cov <= 0) return;
    const streak = (0.5 + 0.5 * Math.cos(across * Math.PI * 4.5)) ** 2;
    const value = solid
      ? // As dark as the body, with faint streaks and a softer edge.
        (0.97 - 0.2 * x ** 2) * (0.84 + 0.16 * streak)
      : Math.max(
          0.7 * (1 - 0.4 * x) * outline(f, edge),
          0.06,
          0.26 * streak * (1 - 0.5 * x),
        );
    over(f, k, cov, value);
  });
}

function drawFish(f: Field, fish: Fish, pts: Point[]) {
  drawTail(f, fish, pts);
  // Several small fins rather than one big one: the pectoral, pelvic and anal
  // fins hang from the belly toward the ring, and a low dorsal fin runs along
  // the back, beside the S-curve.
  drawRidge(f, fish, pts, 0.38 * BODY, 0.6 * BODY, 0.045, -1);
  drawRidge(f, fish, pts, 0.74 * BODY, 0.87 * BODY, 0.05, 1);
  drawFin(
    f,
    fish,
    pts,
    0.2 * BODY,
    0.19,
    0.055,
    0.62,
    bellyAt(0.2 * BODY) * 0.65,
  );
  drawFin(
    f,
    fish,
    pts,
    0.5 * BODY,
    0.13,
    0.036,
    0.5,
    bellyAt(0.5 * BODY) * 0.75,
  );
  drawBody(f, fish, pts);
}

// Whether a fish is entirely outside the grid.
function offGrid(f: Field, fish: Fish) {
  const [x, y] = fish.track(fish.d - LENGTH);
  const [hx, hy] = fish.track(fish.d);
  const margin = 0.35;
  const out = (px: number, py: number) =>
    Math.abs(px) > f.halfW + margin || Math.abs(py) > f.halfH + margin;
  return out(x, y) && out(hx, hy);
}

const toChar = (d: number) =>
  d < 0.06 ? " " : RAMP[clamp(Math.round(d * 9 + 0.2), 1, 9)];

const randomNoise = () => NOISE[Math.floor(Math.random() * NOISE.length)];

type Scene = {
  fish: Fish[];
  time: number;
  turn?: number;
  ringDrawn?: number;
  /** How far the load animation has got, from 0 to 1. */
  decode?: number;
  ripples?: boolean;
};

export type Frame = {
  text: string;
  /** Cells to clear behind the characters: the fish, and any noise. */
  mask: Uint8Array;
  /** How many characters aren't blank. */
  count: number;
};

function render(f: Field, scene: Scene): Frame {
  const { fish, time, ringDrawn = 1, decode } = scene;
  f.bg.fill(0);
  f.ink.fill(0);
  f.cov.fill(0);
  if (scene.ripples !== false) drawRipples(f, time);
  const spines = fish.map((one) => (one.gone ? null : spine(one)));
  // Where each tail is, so the ring can swell behind it. The fish swim
  // clockwise, so "behind" is a little counter-clockwise.
  const tails: Tail[] = [];
  fish.forEach((one, n) => {
    const pts = spines[n];
    if (!pts) return;
    const end = pts[SPINE];
    const r = Math.hypot(end.x, end.y);
    tails.push({
      angle: Math.atan2(end.y, end.x) + 0.35,
      weight:
        (one.kind === "ink" ? 1 : 0.6) * Math.exp(-(((r - RING) / 0.45) ** 2)),
    });
  });
  if (ringDrawn > 0) drawRing(f, scene.turn ?? 0, time, tails, ringDrawn);
  fish.forEach((one, n) => {
    const pts = spines[n];
    if (pts) drawFish(f, one, pts);
  });
  const mask = new Uint8Array(f.n);
  const lines: string[] = [];
  let count = 0;
  for (let j = 0; j < f.rows; j++) {
    let line = "";
    for (let i = 0; i < f.cols; i++) {
      const k = j * f.cols + i;
      const bg = f.bg[k];
      let c: string;
      if (bg < 0 && f.cov[k] < 0.5) {
        c = randomNoise();
        mask[k] = 1;
      } else {
        c = toChar(f.ink[k] + Math.max(bg, 0) * (1 - f.cov[k]));
      }
      if (decode !== undefined && c !== " " && f.reveal[k] > decode) {
        c = randomNoise();
      }
      if (f.cov[k] > 0.05) mask[k] = 1;
      if (c !== " ") count++;
      line += c;
    }
    lines.push(line.trimEnd());
  }
  return { text: lines.join("\n"), mask, count };
}

/** The still pair with no ripples, for the footer. */
export function stillKoi(rows: number) {
  return render(makeField(COLS, rows), {
    fish: stillPair(),
    time: 0,
    ripples: false,
  }).text;
}

/** Which picture the figure shows, for its caption. */
export type Art = "koi" | "face";

type Mode = "koi" | "leaving" | "face" | "returning";

/**
 * The hero's koi and photo reveal, as a state machine with no DOM. The
 * component sizes the field, steps it with `update`, and draws each
 * `frame`. The photo itself is the component's: the engine only says when
 * it should show.
 */
export function createKoi({
  still,
  intro,
}: {
  /** Hold one still frame, for reduced motion. */
  still: boolean;
  /** Settle the characters out of noise on load. */
  intro: boolean;
}) {
  let field: Field | null = null;
  let mode: Mode = "koi";
  let since = 0;
  let time = 0;
  let fish = still ? stillPair() : swimmingPair();
  let ringDrawn = 1;
  let front = -1;
  let decode = still || !intro ? undefined : 0;
  let art: Art = "koi";
  let photo = false;

  function startLeaving() {
    mode = "leaving";
    since = 0;
    for (const one of fish) {
      one.track = leaving(one);
      one.spiral = 0;
      one.arrive = null;
    }
  }

  function startReturning() {
    mode = "returning";
    since = 0;
    photo = false;
    front = 0;
    ringDrawn = 0;
    for (const one of fish) one.gone = true;
  }

  // Jump to the end of whatever is under way.
  function finish() {
    if (mode === "leaving") {
      for (const one of fish) one.gone = true;
      ringDrawn = 0;
      photo = true;
      art = "face";
      mode = "face";
    } else if (mode === "returning") {
      fish = swimmingPair();
      front = -1;
      ringDrawn = 1;
      art = "koi";
      mode = "koi";
    }
  }

  function update(dt: number) {
    if (!field) return;
    time += dt;
    since += dt;
    if (decode !== undefined) {
      decode = since / 1.3;
      if (decode >= 1) decode = undefined;
    }
    for (const one of fish) {
      if (one.gone) continue;
      if (mode === "leaving") one.speed += dt * (0.6 + since * 6);
      if (one.arrive) {
        const { start, span, run } = one.arrive;
        const p = clamp((time - start) / span, 0, 1);
        const a = SPEED * span;
        one.d = run - (run - a) * (1 - p) ** 2 - a * (1 - p);
        one.speed = (2 * (run - a) * (1 - p) + a) / span;
        if (p >= 1) one.arrive = null;
      } else {
        one.d += one.speed * dt;
        // Once back on the circle, the body curls out into its spiral again.
        if (mode !== "leaving") one.spiral = Math.min(1, one.spiral + dt * 0.7);
      }
      one.phase += dt * (5.4 + one.speed * 8);
      one.fin += dt * (4.2 + one.speed * 6);
      one.amp = mix(0.035, 0.065, clamp((one.speed - SPEED) / 2, 0, 1));
      if (mode === "leaving" && offGrid(field, one)) one.gone = true;
    }
    const rMax = Math.hypot(field.halfW, field.halfH) + 0.25;
    if (mode === "leaving") {
      // The ring fades as the fish dart off, and the photo fades in over
      // them, or as soon as it has loaded.
      ringDrawn = 1 - smooth(0, 0.6, since);
      if (since > 0.45) {
        art = "face";
        photo = true;
      }
      if (since > 2.5) for (const one of fish) one.gone = true;
      if (since > 0.6 && fish.every((one) => one.gone)) mode = "face";
    } else if (mode === "returning") {
      const p = clamp((since - 0.35) / 1.4, 0, 1);
      front = (rMax + 0.16) * (1 - (1 - p) ** 2);
      if (p > 0) art = "koi";
      ringDrawn = smooth(0.55, 1.9, since);
      if (since > 1.0 && fish.every((one) => one.gone && !one.arrive)) {
        // In from the left along the top and from the right along the bottom,
        // on lines that meet the orbit.
        const run = field.halfW + LENGTH + 0.4;
        const angles = [Math.PI / 2, -Math.PI / 2];
        fish = [makeFish("ink", angles[0]), makeFish("paper", angles[1])];
        for (const [n, one] of fish.entries()) {
          one.track = arriving(angles[n], run);
          one.arrive = { start: time, span: 1.9, run };
          one.spiral = 0;
          one.d = 0;
        }
      }
      if (since > 3.1) {
        front = -1;
        mode = "koi";
      }
    }
  }

  return {
    get field() {
      return field;
    },
    /** Which picture the caption should name. */
    get art() {
      return art;
    },
    /** Whether the photo itself should show over the characters. */
    get photo() {
      return photo;
    },
    /** The returning ripple front's radius in units, or -1 for none. */
    get front() {
      return front;
    },
    /** Whether the koi are circling, with nothing else under way. */
    get settled() {
      return mode === "koi";
    },
    /** Whether anything still moves, so the component knows to keep going. */
    get moving() {
      return !still && mode !== "face";
    },
    /** Size the grid. Phones use fewer columns than COLS. */
    resize(rows: number, cols = COLS) {
      if (!field || field.rows !== rows || field.cols !== cols) {
        field = makeField(cols, rows);
      }
      return field;
    },
    update,
    frame(): Frame | null {
      if (!field) return null;
      return render(field, {
        fish,
        time,
        turn: time * TURN,
        ringDrawn,
        decode,
      });
    },
    /** Swap between the koi and the photo. Still, the photo just fades. */
    toggle(toFace: boolean) {
      if (still) {
        photo = toFace;
        art = toFace ? "face" : "koi";
        return;
      }
      finish();
      if (toFace) startLeaving();
      else startReturning();
    },
  };
}

export type Koi = ReturnType<typeof createKoi>;
