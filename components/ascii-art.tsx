import type { CSSProperties } from "react";
import { imageToAscii } from "@/lib/ascii/image";
import { getScene, type SceneName } from "@/lib/ascii/scenes";
import { COLS, stillKoi } from "@/lib/koi/engine";

// Fixed ASCII art, rendered while the site builds. The characters fill their
// box's width: the font size is the box width over the number of columns,
// so the art's height is set before any font loads and nothing shifts.

function AsciiText({
  cols,
  rows,
  text,
  className = "",
}: {
  cols: number;
  rows: number;
  text: string;
  className?: string;
}) {
  // A `pre` drops a trailing blank line, so hold the box at its full rows.
  return (
    <pre
      aria-hidden="true"
      className={`ascii ${className}`}
      style={{ "--cols": cols, minHeight: `${rows}em` } as CSSProperties}
    >
      {text}
    </pre>
  );
}

/** A scene from `lib/ascii/scenes.ts`, such as the pond ripples. Decorative. */
export function AsciiScene({
  scene,
  faint = false,
  className = "",
}: {
  scene: SceneName;
  faint?: boolean;
  className?: string;
}) {
  const { cols, rows, text } = getScene(scene);
  return (
    <div aria-hidden="true" className={`ascii-box ${className}`}>
      <AsciiText
        cols={cols}
        rows={rows}
        text={text}
        className={faint ? "ascii-faint" : ""}
      />
    </div>
  );
}

/** An image from `public/` in characters. Screen readers get the alt text. */
export async function AsciiImage({
  src,
  alt,
  cols = 72,
  className = "",
}: {
  src: string;
  alt: string;
  cols?: number;
  className?: string;
}) {
  const art = await imageToAscii(src, cols);
  return (
    <div role="img" aria-label={alt} className={`ascii-box ${className}`}>
      <AsciiText cols={cols} rows={art.rows} text={art.text} />
    </div>
  );
}

/** The koi pair, still and faint, as in the footer. Decorative. */
export function StillKoi({
  rows = 58,
  className = "",
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={`ascii-box ${className}`}>
      <AsciiText
        cols={COLS}
        rows={rows}
        text={stillKoi(rows)}
        className="ascii-faint"
      />
    </div>
  );
}
