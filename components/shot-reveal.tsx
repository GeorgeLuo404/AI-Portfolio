"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

// A project screenshot drawn as pixel art, with the real screenshot on top,
// hidden until a pointer hovers it. On touch screens, and from the
// keyboard, the button over it shows and hides it instead.
export function ShotReveal({
  src,
  alt,
  title,
  ratio,
  sizes,
  light,
  dark,
}: {
  src: string;
  alt: string;
  title: string;
  ratio: number;
  sizes: string;
  light: string;
  dark: string;
}) {
  const t = useTranslations("work");
  const [shown, setShown] = useState(false);
  const pixels = "object-fill [image-rendering:pixelated]";
  return (
    <div className="group relative w-full" style={{ aspectRatio: ratio }}>
      <Image
        src={light}
        alt=""
        aria-hidden="true"
        fill
        unoptimized
        className={`${pixels} dark:hidden`}
      />
      <Image
        src={dark}
        alt=""
        aria-hidden="true"
        fill
        unoptimized
        className={`${pixels} hidden dark:block`}
      />
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={`object-cover transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`}
      />
      <button
        type="button"
        aria-pressed={shown}
        aria-label={t("showShot", { title })}
        onClick={() => setShown((value) => !value)}
        className="absolute inset-0 cursor-pointer"
      />
    </div>
  );
}
