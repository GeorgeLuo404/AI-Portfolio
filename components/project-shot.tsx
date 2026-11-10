import { imageToPixels } from "@/lib/pixel/image";
import { ShotReveal } from "./shot-reveal";

/**
 * A project screenshot from `public/` as pixel art `cols` pixels wide, made
 * while the site builds, with the real screenshot on hover.
 */
export async function ProjectShot({
  src,
  alt,
  title,
  cols,
  sizes,
}: {
  src: string;
  alt: string;
  title: string;
  cols: number;
  sizes: string;
}) {
  const art = await imageToPixels(src, cols);
  return (
    <ShotReveal
      src={src}
      alt={alt}
      title={title}
      ratio={art.cols / art.rows}
      sizes={sizes}
      light={art.light}
      dark={art.dark}
    />
  );
}
