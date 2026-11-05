// Turning tones into characters, shared by the build-time art and the
// hero's portrait in the browser. A tone is how much ink a character cell
// holds, from 0 (blank) to 1 (solid).

/** Light to dark. */
export const RAMP = " .:-=+*#%@";

/** JetBrains Mono advances 0.6em, and the art sets line-height to 1. */
export const CELL_ASPECT = 0.6;

export const clamp = (x: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, x));

export function smooth(a: number, b: number, x: number) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

export const toChar = (tone: number) =>
  tone < 0.06 ? " " : RAMP[clamp(Math.round(tone * 9 + 0.2), 1, 9)];

/** Rows of characters, with trailing spaces trimmed. */
export function tonesToText(tones: ArrayLike<number>, cols: number) {
  const lines: string[] = [];
  for (let k = 0; k < tones.length; k += cols) {
    let line = "";
    for (let i = 0; i < cols; i++) line += toChar(tones[k + i]);
    lines.push(line.trimEnd());
  }
  return lines.join("\n");
}

/**
 * Tones from a picture's brightness per cell (0 black, 1 white), sharpened a
 * little against a blur of the neighbors so that edges read. On a light
 * page, dark pixels get the dense characters; on a dark page, light ones.
 */
export function brightnessToTones(
  brightness: ArrayLike<number>,
  cols: number,
  rows: number,
  dark: boolean,
) {
  const tones = new Float32Array(cols * rows);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let sum = 0;
      let n = 0;
      for (let b = -1; b <= 1; b++) {
        for (let a = -2; a <= 2; a++) {
          const ii = i + a;
          const jj = j + b;
          if (ii < 0 || jj < 0 || ii >= cols || jj >= rows) continue;
          sum += brightness[jj * cols + ii];
          n++;
        }
      }
      const k = j * cols + i;
      const l = clamp(brightness[k] + 0.8 * (brightness[k] - sum / n), 0, 1);
      tones[k] = smooth(0.04, 0.96, dark ? l : 1 - l);
    }
  }
  return tones;
}
