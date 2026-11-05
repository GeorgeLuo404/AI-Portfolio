// The hero's koi for the T3 design prototype, drawn in characters every
// frame: one fish in solid ink and one in outline, circling each other
// clockwise like a yin-yang, inside a brushed ring that turns with them. The
// button beside the caption sends them away and shows George's photo, first
// in characters, then the photo itself. The footer gets a still, faint pair.
//
// The koi are drawn from scratch here. George's reference images set the mood
// only, and nothing is traced from them.
//
// URL options: ?static draws one still frame, as does a system setting for
// reduced motion, and ?face starts on the photo.

(() => {
  const RAMP = " .:-=+*#%@";
  const NOISE = ".:-=+*#%@";
  const COLS = 150;
  // JetBrains Mono advances 0.6em, and the art sets line-height to 1.
  const CELL_W = 0.6;

  // Lengths are in units of the ring's radius.
  const RING = 0.915;
  const TAU = 2 * Math.PI;
  // Each head circles at ORBIT, and the body spirals out behind it to OUTER,
  // so each tail sweeps around outside the other fish's head.
  const ORBIT = 0.27;
  const OUTER = 0.7;
  const BODY = 1.0;
  // The tail's two lobes reach this far past the end of the body.
  const TAIL = 0.4;
  const LENGTH = BODY + TAIL;
  const WIDTH = 0.22;
  const SPINE = 84;
  // One lap every 26 seconds, and the ring turns with the fish.
  const SPEED = (TAU * ORBIT) / 26;
  const TURN = SPEED / ORBIT;
  // The solid fish's head starts near the top, as in a yin-yang.
  const START = (80 * Math.PI) / 180;
  // The tancho spot: a round mark on the head, in the other fish's color.
  const SPOT_AT = 0.17;
  const SPOT_R = 0.06;
  // The pelvic, then the pectoral fins: where each pair sits, its length and
  // width, and how far it turns out from the body.
  const FINS = [
    [0.58 * BODY, 0.12, 0.035, 0.5],
    [0.24 * BODY, 0.27, 0.062, 0.55],
  ];

  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
  const mix = (a, b, t) => a + (b - a) * t;
  function smooth(a, b, x) {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function hash(x, y) {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  }
  function noise(x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const u = smooth(0, 1, x - xi);
    const v = smooth(0, 1, y - yi);
    const top = mix(hash(xi, yi), hash(xi + 1, yi), u);
    const bottom = mix(hash(xi, yi + 1), hash(xi + 1, yi + 1), u);
    return mix(top, bottom, v);
  }

  // The same noise, but repeating every `period` along x, for going around
  // the ring without a seam.
  function loopNoise(x, y, period) {
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
  function bodyWidth(s) {
    if (s < 0.13) {
      return (
        WIDTH * 0.58 * Math.sqrt(Math.max(0, 1 - ((0.13 - s) / 0.13) ** 2))
      );
    }
    if (s < 0.32) return WIDTH * mix(0.58, 1, smooth(0.13, 0.32, s));
    return WIDTH * (1 - 0.75 * smooth(0.32, 1, s) ** 1.15);
  }

  // Rows of overlapping scales from behind the head, each drawn as the arc of
  // its back edge.
  function scales(l, lat) {
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

  const widthAt = (l) => bodyWidth(clamp(l / BODY, 0, 1));

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

  // A track maps a distance along a fish's path to a point. Every fish
  // circles clockwise, and `angle` is where its head is at distance 0.
  function orbit(angle) {
    return (d) => {
      const a = angle - d / ORBIT;
      return [ORBIT * Math.cos(a), ORBIT * Math.sin(a)];
    };
  }

  // Straight on from the head, the way it was heading, with the body
  // following its own shape from the moment it turned away.
  function leaving(fish) {
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
  function arriving(angle, run) {
    const around = orbit(angle);
    const [x0, y0] = around(0);
    const tx = Math.sin(angle);
    const ty = -Math.cos(angle);
    return (d) =>
      d >= run ? around(d - run) : [x0 - tx * (run - d), y0 - ty * (run - d)];
  }

  function makeFish(kind, angle) {
    return {
      kind,
      track: orbit(angle),
      d: 0,
      speed: SPEED,
      phase: kind === "ink" ? 0 : 2.1,
      fin: kind === "ink" ? 0 : 1.4,
      amp: 0.035,
      // 1 while circling, so the body spirals out; 0 while swimming straight.
      spiral: 1,
      gone: false,
      arrive: null,
    };
  }

  // Unit tangents pointing toward the head.
  function tangents(pts) {
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

  // Points from snout to tail tip along the fish's track, spiralling out
  // while it circles.
  function baseSpine(fish) {
    const pts = [];
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

  // The spine, bent by a wave that travels toward the tail and grows along
  // the body.
  function spine(fish) {
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

  function pointAt(pts, l) {
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

  // A grid of character cells. Positions are in units with y up and the
  // ring's center in the middle of the grid; `s` is one unit in em.
  function makeField(cols, rows) {
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
      halfW: w / 2 / s,
      halfH: rows / 2 / s,
      x: new Float32Array(n),
      y: new Float32Array(n),
      r: new Float32Array(n),
      a: new Float32Array(n),
      // Water, ring and portrait under the fish.
      bg: new Float32Array(n),
      // The fish, premultiplied by their coverage.
      ink: new Float32Array(n),
      cov: new Float32Array(n),
      // Scratch space for the body's distance field.
      sd: new Float32Array(n),
      bl: new Float32Array(n),
      lat: new Float32Array(n),
      reveal: new Float32Array(n),
      ringCells: [],
      portrait: null,
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
  function eachCell(f, x0, y0, x1, y1, fn) {
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
  function over(f, k, cov, value) {
    f.ink[k] = value * cov + f.ink[k] * (1 - cov);
    f.cov[k] = cov + f.cov[k] * (1 - cov);
  }

  // A line just inside an outline, for the fish drawn in outline.
  const outline = (f, sd) =>
    clamp(1 - Math.abs(sd + 1.2 * f.aa) / (1.5 * f.aa), 0, 1);

  // The ring: one brush stroke that turns clockwise with the koi. It swells
  // just behind each tail, as if the fish were stirring it, runs dry between
  // them, and its edge drifts as it turns. `turn` is how far it has turned,
  // and `drawn` how much of it is painted, from 0 to 1, clockwise from the top
  // of its own turning frame.
  function drawRing(f, turn, time, tails, drawn) {
    for (const k of f.ringCells) {
      const a = f.a[k];
      const own = (((a + turn) % TAU) + TAU) % TAU;
      if (
        drawn < 1 &&
        (((Math.PI / 2 - own) % TAU) + TAU) % TAU > drawn * TAU
      ) {
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
  function drawRipples(f, t) {
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
        ink = Math.max(
          ink,
          line * 0.36 * (1 - ph) ** 1.4 * smooth(0, 0.08, ph),
        );
      }
      if (ink > f.bg[k]) f.bg[k] = ink;
    }
  }

  function drawFin(f, fish, pts, at, length, width, spread, side) {
    const solid = fish.kind === "ink";
    const p = pointAt(pts, at);
    const nx = -p.ty * side;
    const ny = p.tx * side;
    const w = widthAt(at);
    const rx = p.x + nx * w * 0.7;
    const ry = p.y + ny * w * 0.7;
    const turn = spread + 0.16 * Math.sin(fish.fin + side * 0.6);
    const c = Math.cos(turn);
    const s = Math.sin(turn);
    // Backward along the body, turned outward.
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
        const rays =
          (0.5 + 0.5 * Math.cos(Math.atan2(v, u * length) * 24)) ** 4;
        const value = solid
          ? 0.56 - 0.12 * uc + 0.12 * rays
          : Math.max(0.74 * outline(f, sd), 0.1, 0.2 * rays * uc);
        over(f, k, solid ? cov * 0.92 : cov, value);
      },
    );
  }

  // Rasterize a strip into the scratch arrays: the union of tapered capsules
  // along the spine from `from` to `to`, `width(l)` wide and pushed sideways
  // by `offset(l)`. Then shade(k, sd, l, lat) paints each cell it covers.
  function strip(f, pts, from, to, width, offset, shade) {
    const line = [];
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
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
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

  function drawBody(f, fish, pts) {
    const solid = fish.kind === "ink";
    strip(
      f,
      pts,
      0,
      BODY,
      widthAt,
      () => 0,
      (k, sd, l, lat) => {
        const spot = Math.hypot(l - SPOT_AT, lat) - SPOT_R;
        const inSpot = clamp(0.5 - spot / f.aa, 0, 1);
        const scale = scales(l, lat);
        // A line down the back, where the dorsal fin runs.
        const back =
          clamp(1 - Math.abs(lat) / (1.2 * f.aa), 0, 1) *
          smooth(0.32, 0.4, l / BODY) *
          (1 - smooth(0.72, 0.8, l / BODY));
        const value = solid
          ? (0.96 - 0.16 * scale - 0.3 * back) * (1 - inSpot)
          : Math.max(
              0.88 * outline(f, sd),
              0.1 + 0.2 * scale,
              0.45 * back,
              inSpot,
            );
        over(f, k, clamp(0.5 - sd / f.aa, 0, 1), value);
      },
    );
  }

  // The tail: two long lobes that part from the end of the body and trail
  // behind it, fluttering a little out of step with each other.
  function drawTail(f, fish, pts) {
    const solid = fish.kind === "ink";
    for (const side of [-1, 1]) {
      const at = (l) => (l - BODY) / TAIL;
      const width = (l) =>
        0.062 * Math.sin(Math.PI * clamp((at(l) + 0.15) / 1.15, 0, 1)) ** 0.6;
      const offset = (l) =>
        side *
        smooth(-0.15, 1, at(l)) ** 1.2 *
        (0.1 + 0.02 * Math.sin(fish.fin * 0.8 + side * 1.3));
      strip(f, pts, BODY - 0.07, LENGTH, width, offset, (k, sd, l, lat) => {
        const x = clamp(at(l), 0, 1);
        const rays = (0.5 + 0.5 * Math.cos((lat / 0.07) * Math.PI * 2.5)) ** 3;
        const value = solid
          ? 0.6 - 0.2 * x + 0.12 * rays
          : Math.max(0.74 * outline(f, sd), 0.1, 0.2 * rays * x);
        over(f, k, clamp(0.5 - sd / f.aa, 0, 1) * (solid ? 0.92 : 1), value);
      });
    }
  }

  function drawFish(f, fish, pts) {
    drawTail(f, fish, pts);
    for (const [at, length, width, spread] of FINS) {
      drawFin(f, fish, pts, at, length, width, spread, -1);
      drawFin(f, fish, pts, at, length, width, spread, 1);
    }
    drawBody(f, fish, pts);
  }

  // Whether a fish is entirely outside the grid.
  function offGrid(f, fish) {
    const [x, y] = fish.track(fish.d - LENGTH);
    const [hx, hy] = fish.track(fish.d);
    const margin = 0.35;
    const out = (px, py) =>
      Math.abs(px) > f.halfW + margin || Math.abs(py) > f.halfH + margin;
    return out(x, y) && out(hx, hy);
  }

  const toChar = (d) =>
    d < 0.06 ? " " : RAMP[clamp(Math.round(d * 9 + 0.2), 1, 9)];

  // A scene: the field, the fish, and how far the ring and any ripple front
  // have got. `front` is a radius in units, and inside it the portrait shows
  // when `inside` is "portrait", or the water when it is "water".
  function render(f, scene) {
    const {
      fish,
      time,
      ringDrawn = 1,
      front = -1,
      inside = "portrait",
    } = scene;
    f.bg.fill(0);
    f.ink.fill(0);
    f.cov.fill(0);
    if (scene.ripples !== false) drawRipples(f, time);
    const spines = fish.map((one) => (one.gone ? null : spine(one)));
    // Where each tail is, so the ring can swell behind it. The fish swim
    // clockwise, so "behind" is a little counter-clockwise.
    const tails = [];
    fish.forEach((one, n) => {
      const pts = spines[n];
      if (!pts) return;
      const end = pts[SPINE];
      const r = Math.hypot(end.x, end.y);
      tails.push({
        angle: Math.atan2(end.y, end.x) + 0.35,
        weight:
          (one.kind === "ink" ? 1 : 0.6) *
          Math.exp(-(((r - RING) / 0.45) ** 2)),
      });
    });
    if (ringDrawn > 0) drawRing(f, scene.turn ?? 0, time, tails, ringDrawn);
    if (front >= 0 && f.portrait) {
      const band = 0.16;
      for (let k = 0; k < f.n; k++) {
        const r = f.r[k];
        const within = r < front - band;
        const showPortrait = (inside === "portrait") === within;
        if (r >= front - band && r < front) {
          f.bg[k] = -1;
        } else if (showPortrait) {
          f.bg[k] = f.portrait[k];
        }
      }
    }
    fish.forEach((one, n) => {
      if (spines[n]) drawFish(f, one, spines[n]);
    });
    const mask = new Uint8Array(f.n);
    const lines = [];
    let count = 0;
    for (let j = 0; j < f.rows; j++) {
      let line = "";
      for (let i = 0; i < f.cols; i++) {
        const k = j * f.cols + i;
        const bg = f.bg[k];
        let c;
        if (bg < 0 && f.cov[k] < 0.5) {
          c = NOISE[Math.floor(Math.random() * NOISE.length)];
          mask[k] = 1;
        } else {
          c = toChar(f.ink[k] + Math.max(bg, 0) * (1 - f.cov[k]));
        }
        if (
          scene.decode !== undefined &&
          c !== " " &&
          f.reveal[k] > scene.decode
        ) {
          c = NOISE[Math.floor(Math.random() * NOISE.length)];
        }
        if (f.cov[k] > 0.05) mask[k] = 1;
        if (c !== " ") count++;
        line += c;
      }
      lines.push(line.replace(/\s+$/, ""));
    }
    return { text: lines.join("\n"), mask, count };
  }

  // A still pair, for the footer and for ?static.
  function stillFish() {
    const pair = [makeFish("ink", START), makeFish("paper", START + Math.PI)];
    pair[0].phase = 1.2;
    pair[1].phase = 3.6;
    return pair;
  }

  const Koi = { makeField, render, stillFish };

  if (typeof document === "undefined") {
    globalThis.Koi = Koi;
    return;
  }

  const params = new URLSearchParams(location.search);
  const still =
    params.has("static") ||
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  for (const pre of document.querySelectorAll("[data-koi-still]")) {
    const rows = Number(pre.dataset.koiStill) || 58;
    pre.style.setProperty("--cols", COLS);
    pre.style.minHeight = `${rows}em`;
    const f = makeField(COLS, rows);
    pre.textContent = render(f, {
      fish: stillFish(),
      time: 0,
      ripples: false,
    }).text;
  }

  const figure = document.querySelector("[data-koi]");
  if (!figure) return;
  const box = figure.querySelector(".koi");
  const pre = box.querySelector("pre");
  const canvas = box.querySelector("canvas");
  const img = box.querySelector("img");
  const button = figure.querySelector("[data-koi-toggle]");
  const counter = figure.querySelector("[data-koi-count]");
  const root = document.documentElement;
  pre.style.setProperty("--cols", COLS);

  let field = null;
  let width = 0;
  let height = 0;
  let font = 0;
  let top = 0;
  let mode = params.has("face") ? "face" : "koi";
  let since = 0;
  let time = 0;
  let fish = still
    ? stillFish()
    : [makeFish("ink", START), makeFish("paper", START + Math.PI)];
  let ringDrawn = 1;
  let front = -1;
  let inside = "portrait";
  let frontFrom = -1;
  let decode = still || mode === "face" ? undefined : 0;
  let last = null;
  figure.dataset.state = mode === "face" ? "face" : "koi";
  figure.dataset.art = figure.dataset.state;

  // Photo: loaded once the page has settled, or as soon as someone reaches
  // for the button, so it doesn't slow the first screen.
  let photoReady = null;
  function loadPhoto() {
    if (!photoReady) {
      photoReady = new Promise((resolve) => {
        img.addEventListener("load", () => resolve(true), { once: true });
        img.addEventListener("error", () => resolve(false), { once: true });
        img.src = img.dataset.src;
      }).then((ok) => {
        if (ok) buildPortrait();
        return ok;
      });
    }
    return photoReady;
  }
  if (mode === "face") loadPhoto();
  else {
    addEventListener("load", () => setTimeout(loadPhoto, 1200), { once: true });
    button.addEventListener("pointerenter", loadPhoto, { once: true });
    button.addEventListener("focus", loadPhoto, { once: true });
  }

  const darkTheme = () =>
    getComputedStyle(figure).getPropertyValue("--bg").trim().toLowerCase() ===
    "#000";

  // The photo in characters, with the same crop as the photo itself.
  function buildPortrait() {
    if (!field || !img.complete || !img.naturalWidth) return;
    const { cols, rows } = field;
    const sx = 2;
    const sy = 3;
    const c = document.createElement("canvas");
    c.width = cols * sx;
    c.height = rows * sy;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    const scale = Math.max(
      width / img.naturalWidth,
      height / img.naturalHeight,
    );
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    // object-position in styles.css: 60% 20%.
    const ox = (width - dw) * 0.6;
    const oy = (height - dh) * 0.2;
    const kx = c.width / (cols * font * CELL_W);
    const ky = c.height / (rows * font);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, ox * kx, (oy - top) * ky, dw * kx, dh * ky);
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    const lum = new Float32Array(cols * rows);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        let sum = 0;
        for (let b = 0; b < sy; b++) {
          for (let a = 0; a < sx; a++) {
            sum += data[((j * sy + b) * c.width + i * sx + a) * 4];
          }
        }
        lum[j * cols + i] = sum / (sx * sy * 255);
      }
    }
    // Sharpen a little against a blur of the neighbors, so edges read.
    const dark = darkTheme();
    const out = new Float32Array(cols * rows);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        let sum = 0;
        let n = 0;
        for (let b = -1; b <= 1; b++) {
          for (let a = -2; a <= 2; a++) {
            const ii = i + a;
            const jj = j + b;
            if (ii < 0 || jj < 0 || ii >= cols || jj >= rows) continue;
            sum += lum[jj * cols + ii];
            n++;
          }
        }
        const k = j * cols + i;
        const l = clamp(lum[k] + 0.8 * (lum[k] - sum / n), 0, 1);
        out[k] = smooth(0.04, 0.96, dark ? l : 1 - l);
      }
    }
    field.portrait = out;
  }

  function measure() {
    width = box.clientWidth;
    height = box.clientHeight;
    if (!width || !height) return;
    font = width / COLS / CELL_W;
    const rows = Math.max(12, Math.floor(height / font));
    top = (height - rows * font) / 2;
    pre.style.top = `${top}px`;
    if (!field || field.rows !== rows) {
      const reveal = decode;
      field = makeField(COLS, rows);
      decode = reveal;
    }
    const dpr = devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    buildPortrait();
    draw();
  }

  function paintMask(mask) {
    const ctx = canvas.getContext("2d");
    const dpr = canvas.width / width;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = getComputedStyle(figure).getPropertyValue("--bg").trim();
    const cw = font * CELL_W;
    if (front >= 0) {
      ctx.beginPath();
      const r = front * field.s * font;
      if (inside === "portrait")
        ctx.arc(width / 2, height / 2, r, 0, 2 * Math.PI);
      else {
        ctx.rect(0, 0, width, height);
        ctx.arc(
          width / 2,
          height / 2,
          Math.max(0, r - 0.16 * field.s * font),
          0,
          2 * Math.PI,
          true,
        );
      }
      ctx.fill();
    }
    for (let j = 0; j < field.rows; j++) {
      let i = 0;
      while (i < field.cols) {
        if (!mask[j * field.cols + i]) {
          i++;
          continue;
        }
        let end = i;
        while (end < field.cols && mask[j * field.cols + end]) end++;
        ctx.fillRect(i * cw, top + j * font, (end - i) * cw + 0.5, font + 0.5);
        i = end;
      }
    }
  }

  function draw() {
    if (!field) return;
    const frame = render(field, {
      fish,
      time,
      turn: time * TURN,
      ringDrawn,
      front,
      inside,
      decode,
    });
    pre.textContent = frame.text;
    paintMask(frame.mask);
    // The noise of the load animation stands in for characters one for one,
    // so the count is right from the first frame.
    if (mode === "koi" && counter && !counter.textContent) {
      counter.textContent = frame.count.toLocaleString("en-US");
    }
  }

  function startLeaving() {
    mode = "leaving";
    since = 0;
    frontFrom = -1;
    for (const one of fish) {
      one.track = leaving(one);
      one.spiral = 0;
      one.arrive = null;
    }
  }

  function startReturning() {
    mode = "returning";
    since = 0;
    img.classList.remove("is-shown");
    inside = "water";
    front = 0;
    ringDrawn = 0;
    for (const one of fish) one.gone = true;
  }

  // Jump to the end of whatever is under way.
  function finish() {
    if (mode === "leaving") {
      for (const one of fish) one.gone = true;
      front = 9;
      inside = "portrait";
      img.classList.add("is-shown");
      figure.dataset.art = "face";
      mode = "face";
    } else if (mode === "returning") {
      fish = [makeFish("ink", START), makeFish("paper", START + Math.PI)];
      front = -1;
      ringDrawn = 1;
      figure.dataset.art = "koi";
      mode = "koi";
    }
  }

  function update(dt) {
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
      if (frontFrom < 0 && since > 0.75 && field.portrait) {
        frontFrom = since;
        figure.dataset.art = "face";
      }
      if (frontFrom >= 0) {
        const p = clamp((since - frontFrom) / 1.5, 0, 1);
        front = (rMax + 0.16) * (1 - (1 - p) ** 2);
        if (
          p >= 1 &&
          since - frontFrom > 1.85 &&
          !img.classList.contains("is-shown")
        ) {
          img.classList.add("is-shown");
        }
        if (since - frontFrom > 2.7) mode = "face";
      }
    } else if (mode === "returning") {
      const p = clamp((since - 0.35) / 1.4, 0, 1);
      front = (rMax + 0.16) * (1 - (1 - p) ** 2);
      if (p > 0) figure.dataset.art = "koi";
      ringDrawn = smooth(0.55, 1.9, since);
      if (since > 1.0 && fish.every((one) => one.gone && !one.arrive)) {
        // In from the left along the top and from the right along the
        // bottom, on lines that meet the orbit.
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
        if (counter) counter.textContent = "";
      }
    }
  }

  let raf = 0;
  let visible = true;
  function tick(now) {
    raf = 0;
    if (last === null) last = now;
    if (now - last >= 1000 / 24) {
      update(Math.min(now - last, 100) / 1000);
      last = now;
      draw();
    }
    if (mode !== "face") play();
  }
  function play() {
    if (still || raf || !visible || document.hidden) return;
    raf = requestAnimationFrame(tick);
  }
  function pause() {
    cancelAnimationFrame(raf);
    raf = 0;
    last = null;
  }

  button.addEventListener("click", async () => {
    // The button stops calling for attention once someone has tried it.
    figure.dataset.tried = "";
    const toFace = figure.dataset.state !== "face";
    figure.dataset.state = toFace ? "face" : "koi";
    if (still) {
      if (toFace && !(await loadPhoto())) {
        figure.dataset.state = "koi";
        return;
      }
      img.classList.toggle("is-shown", toFace);
      figure.dataset.art = figure.dataset.state;
      return;
    }
    loadPhoto();
    finish();
    if (toFace) startLeaving();
    else startReturning();
    play();
  });

  new ResizeObserver(measure).observe(box);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) play();
    else pause();
  }).observe(box);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
    else play();
  });
  // The portrait's tones and the mask's color follow the theme.
  new MutationObserver(() => {
    buildPortrait();
    draw();
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    buildPortrait();
    draw();
  });

  if (mode === "face") {
    loadPhoto().then(() => {
      front = 9;
      img.classList.add("is-shown");
      draw();
    });
  }

  // For checking frames by hand: KOI.step(seconds) advances the scene.
  window.KOI = {
    step(seconds, fps = 24) {
      if (!field) measure();
      for (let t = 0; t < seconds; t += 1 / fps) update(1 / fps);
      draw();
      return { mode, since, front, ringDrawn };
    },
  };

  play();
})();
