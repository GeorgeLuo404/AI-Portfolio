import "server-only";
import path from "node:path";
import sharp from "sharp";
import { brightnessToTones, CELL_ASPECT, tonesToText } from "./tones";

export type AsciiImage = { cols: number; rows: number; text: string };

const cache = new Map<string, Promise<AsciiImage>>();

/**
 * An image in `public/`, such as a project screenshot, in characters `cols`
 * wide. Runs while the site builds, so visitors get the characters in the
 * page and never download the converter. The rows follow the image's shape.
 */
export function imageToAscii(src: string, cols: number) {
  const key = `${src}@${cols}`;
  let result = cache.get(key);
  if (!result) {
    result = convert(src, cols);
    cache.set(key, result);
  }
  return result;
}

async function convert(src: string, cols: number): Promise<AsciiImage> {
  const file = path.join(process.cwd(), "public", src);
  // `rotate()` with no angle applies the photo's own orientation first.
  const image = sharp(file).rotate().flatten({ background: "#fff" });
  const meta = await image.metadata();
  // Orientations 5 to 8 turn the picture on its side.
  const turned = (meta.orientation ?? 1) >= 5;
  const width = turned ? meta.height : meta.width;
  const height = turned ? meta.width : meta.height;
  const rows = Math.max(1, Math.round((cols * CELL_ASPECT * height) / width));
  const pixels = await image
    .greyscale()
    .resize(cols, rows, { fit: "fill" })
    .raw()
    .toBuffer();
  const brightness = Float32Array.from(pixels, (value) => value / 255);
  // Keep the background blank: draw the dark parts of a light picture, or
  // the light parts of a dark one. Like the rest of the fixed art, the
  // characters take the ink color, so they turn light in the dark theme.
  let edge = 0;
  for (let i = 0; i < cols; i++) {
    edge += brightness[i] + brightness[(rows - 1) * cols + i];
  }
  const dark = edge / (2 * cols) < 0.5;
  return {
    cols,
    rows,
    text: tonesToText(brightnessToTones(brightness, cols, rows, dark), cols),
  };
}
