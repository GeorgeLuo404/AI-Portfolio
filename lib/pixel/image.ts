import "server-only";
import path from "node:path";
import sharp from "sharp";

// A project screenshot as pixel art, made while the site builds. Visitors get
// two small PNGs in the page, one per theme, and never download the
// converter. The page scales them up with `image-rendering: pixelated`.

export type PixelArt = {
  cols: number;
  rows: number;
  light: string;
  dark: string;
};

// The art and signal colors from `app/globals.css`, per theme.
const THEMES = {
  light: { art: [0, 0, 0], signal: [0x1b, 0x2b, 0xff] },
  dark: { art: [255, 255, 255], signal: [0x43, 0x52, 0xff] },
} as const;

// Each pixel is pooled from a block this many source pixels wide, so thin
// lines, such as a wireframe, survive the shrink.
const POOL = 4;

// Ink comes in this many steps, blank included, mixed by ordered dithering.
const STEPS = 3;

// A 4×4 Bayer matrix, as thresholds between 0 and 1.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
  (v) => (v + 0.5) / 16,
);

const cache = new Map<string, Promise<PixelArt>>();

/** An image in `public/` as pixel art `cols` pixels wide. */
export function imageToPixels(src: string, cols: number) {
  const key = `${src}@${cols}`;
  let result = cache.get(key);
  if (!result) {
    result = convert(src, cols);
    cache.set(key, result);
  }
  return result;
}

const clamp = (x: number) => Math.min(1, Math.max(0, x));

async function convert(src: string, cols: number): Promise<PixelArt> {
  const file = path.join(process.cwd(), "public", src);
  const image = sharp(file).rotate().flatten({ background: "#fff" });
  const { width = 1, height = 1 } = await image.metadata();
  const rows = Math.max(1, Math.round((cols * height) / width));
  const w = cols * POOL;
  const h = rows * POOL;
  const rgb = await image
    .resize(w, h, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer();

  const luma = new Float32Array(w * h);
  const chroma = new Float32Array(w * h);
  for (let k = 0; k < w * h; k++) {
    const r = rgb[3 * k] / 255;
    const g = rgb[3 * k + 1] / 255;
    const b = rgb[3 * k + 2] / 255;
    luma[k] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    chroma[k] = Math.max(r, g, b) - Math.min(r, g, b);
  }

  // A screenshot is mostly background, so the median is the background. Ink
  // is how far a pixel is from it, which keeps the background blank: a dark
  // page draws its light parts, and a light page its dark ones.
  const background = Float32Array.from(luma).sort()[(w * h) >> 1];
  const dark = background < 0.5;

  // Pool each block: half its average and half its strongest, so a line
  // one source pixel wide still shows.
  const n = cols * rows;
  const ink = new Float32Array(n);
  const color = new Float32Array(n);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let sum = 0;
      let max = 0;
      let colorSum = 0;
      let colorMax = 0;
      for (let b = 0; b < POOL; b++) {
        for (let a = 0; a < POOL; a++) {
          const k = (j * POOL + b) * w + i * POOL + a;
          const t = Math.max(
            0,
            dark ? luma[k] - background : background - luma[k],
          );
          sum += t;
          max = Math.max(max, t);
          colorSum += chroma[k];
          colorMax = Math.max(colorMax, chroma[k]);
        }
      }
      ink[j * cols + i] = (0.5 * sum) / POOL ** 2 + 0.5 * max;
      color[j * cols + i] = (0.3 * colorSum) / POOL ** 2 + 0.7 * colorMax;
    }
  }

  // Stretch the ink so the strongest parts are solid.
  const top = Float32Array.from(ink).sort()[Math.floor(n * 0.995)] || 1;

  // 0 blank, 1 to STEPS - 1 ink, -1 signal for colored parts.
  const cells = new Int8Array(n);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      const threshold = BAYER[(j % 4) * 4 + (i % 4)];
      const t = clamp((ink[k] / top - 0.08) / 0.92) ** 0.75;
      if (color[k] > 0.16 && t > 0.03) {
        cells[k] = color[k] * 2.2 > threshold * 0.8 + 0.3 ? -1 : 0;
      } else {
        cells[k] = Math.min(STEPS - 1, Math.floor(t * (STEPS - 1) + threshold));
      }
    }
  }

  const png = async (theme: keyof typeof THEMES) => {
    const { art, signal } = THEMES[theme];
    const rgba = Buffer.alloc(n * 4);
    for (let k = 0; k < n; k++) {
      const cell = cells[k];
      if (cell < 0) rgba.set([...signal, 255], 4 * k);
      else rgba.set([...art, Math.round((255 * cell) / (STEPS - 1))], 4 * k);
    }
    const out = await sharp(rgba, {
      raw: { width: cols, height: rows, channels: 4 },
    })
      .png({ palette: true, compressionLevel: 9 })
      .toBuffer();
    return `data:image/png;base64,${out.toString("base64")}`;
  };

  return { cols, rows, light: await png("light"), dark: await png("dark") };
}
