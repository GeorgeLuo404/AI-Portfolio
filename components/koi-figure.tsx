"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  type CSSProperties,
  type SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { CELL_ASPECT } from "@/lib/ascii/tones";
import { type Art, COLS, createKoi, type Koi } from "@/lib/koi/engine";
import { PixelIcon } from "./pixel-icon";

const FPS = 24;

type Controls = {
  still: boolean;
  play: () => void;
  draw: () => void;
  /** Count the characters again once the koi are back. */
  recount: () => void;
};

// The hero's art: two koi circling in characters over a dot grid, and a
// button that sends them away and fades in George's photo. The koi pause off screen and in a hidden tab, and
// hold still with reduced motion. The box's size comes from CSS alone, so
// nothing shifts as the art draws.
export function KoiFigure({
  photo,
  intro = true,
  className = "",
}: {
  photo: { src: string; alt: string };
  /** Settle the characters out of noise on load. */
  intro?: boolean;
  className?: string;
}) {
  const t = useTranslations("koi");
  const figureRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const koiRef = useRef<Koi | null>(null);
  const controlsRef = useRef<Controls | null>(null);
  // Reduced motion swaps to the photo only once it has loaded.
  const pendingRef = useRef(false);

  // What the button will switch to, and what the caption names.
  const [state, setState] = useState<Art>("koi");
  const [art, setArt] = useState<Art>("koi");
  const [photoShown, setPhotoShown] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [tried, setTried] = useState(false);
  // The photo loads just after the page has, or as soon as someone reaches
  // for the button, so it doesn't slow the first screen.
  const [wantPhoto, setWantPhoto] = useState(false);

  useEffect(() => {
    let timer = 0;
    const later = () => {
      timer = window.setTimeout(() => setWantPhoto(true), 300);
    };
    if (document.readyState === "complete") later();
    else addEventListener("load", later, { once: true });
    return () => {
      removeEventListener("load", later);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const figure = figureRef.current;
    const box = boxRef.current;
    const pre = preRef.current;
    const probe = probeRef.current;
    const canvas = canvasRef.current;
    if (!figure || !box || !pre || !probe || !canvas) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const koi = createKoi({ still, intro });
    koiRef.current = koi;
    let width = 0;
    let height = 0;
    let font = 0;
    let top = 0;
    let counted = false;

    const background = () =>
      getComputedStyle(figure).getPropertyValue("--bg").trim();

    // Clear the dot grid behind the fish, outside the returning ripple, and
    // behind any noise.
    function paintMask(mask: Uint8Array) {
      const field = koi.field;
      const ctx = canvas?.getContext("2d");
      if (!field || !canvas || !ctx) return;
      ctx.setTransform(canvas.width / width, 0, 0, canvas.width / width, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = background();
      const radius = koi.front;
      if (radius >= 0) {
        const r = radius * field.s * font;
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.arc(
          width / 2,
          height / 2,
          Math.max(0, r - 0.16 * field.s * font),
          0,
          2 * Math.PI,
          true,
        );
        ctx.fill();
      }
      const cw = font * CELL_ASPECT;
      for (let j = 0; j < field.rows; j++) {
        let i = 0;
        while (i < field.cols) {
          if (!mask[j * field.cols + i]) {
            i++;
            continue;
          }
          let end = i;
          while (end < field.cols && mask[j * field.cols + end]) end++;
          ctx.fillRect(
            i * cw,
            top + j * font,
            (end - i) * cw + 0.5,
            font + 0.5,
          );
          i = end;
        }
      }
    }

    function draw() {
      const frame = koi.frame();
      if (!frame || !pre) return;
      // Change the one text node in place: cheaper than a new node each
      // frame, and the browser doesn't take every frame for new content.
      const text = pre.firstChild;
      if (text instanceof Text) text.data = frame.text;
      else pre.textContent = frame.text;
      paintMask(frame.mask);
      setArt(koi.art);
      setPhotoShown(koi.photo);
      // The load animation's noise stands in for characters one for one, so
      // the count is right from the first frame.
      if (koi.settled && !counted) {
        counted = true;
        setCount(frame.count);
      }
    }

    function measure() {
      if (!box || !pre || !probe || !canvas) return;
      width = box.clientWidth;
      height = box.clientHeight;
      if (!width || !height) return;
      // About 3px a column: on phones that's fewer, larger characters than
      // COLS, and far less to draw each frame.
      const cols = Math.min(COLS, Math.max(96, Math.round(width / 3)));
      font = width / cols / CELL_ASPECT;
      const rows = Math.max(12, Math.floor(height / font));
      top = (height - rows * font) / 2;
      pre.style.top = `${top}px`;
      pre.style.setProperty("--cols", String(cols));
      koi.resize(rows, cols);
      const dpr = devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      fit(cols);
      draw();
    }

    // The art assumes cells exactly 0.6 by 1 of the font size. At a few
    // pixels per character some browsers round the line height or advance,
    // which squashes the ring, so measure two lines and stretch to fit.
    function fit(cols: number) {
      if (!pre || !probe) return;
      probe.style.setProperty("--cols", String(cols));
      probe.textContent = `${"0".repeat(cols)}\n0`;
      const drawn = probe.getBoundingClientRect();
      const sx = (cols * font * CELL_ASPECT) / drawn.width;
      const sy = (2 * font) / drawn.height;
      const off = (k: number) => !Number.isFinite(k) || Math.abs(k - 1) < 0.003;
      pre.style.transform =
        off(sx) && off(sy) ? "" : `scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
    }

    let raf = 0;
    let last: number | null = null;
    let visible = true;
    function tick(now: number) {
      raf = 0;
      if (last === null) last = now;
      if (now - last >= 1000 / FPS) {
        koi.update(Math.min(now - last, 100) / 1000);
        last = now;
        draw();
      }
      play();
    }
    function play() {
      if (raf || !visible || document.hidden || !koi.moving) return;
      raf = requestAnimationFrame(tick);
    }
    function pause() {
      cancelAnimationFrame(raf);
      raf = 0;
      last = null;
    }

    controlsRef.current = {
      still,
      play,
      draw,
      recount: () => {
        counted = false;
      },
    };

    const resize = new ResizeObserver(measure);
    resize.observe(box);
    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else pause();
    });
    onScreen.observe(box);
    const onVisibility = () => (document.hidden ? pause() : play());
    document.addEventListener("visibilitychange", onVisibility);
    // Some embedded browsers show a page without a visibilitychange event,
    // so check once a second whether the koi should be moving.
    const poll = window.setInterval(play, 1000);
    // The portrait's tones and the mask's color follow the theme.
    const retheme = () => draw();
    const themeAttr = new MutationObserver(retheme);
    themeAttr.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const scheme = matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", retheme);

    // In development, `KOI.step(seconds)` in the console moves the koi on by
    // hand, for checking frames where the browser runs no animation frames.
    if (process.env.NODE_ENV === "development") {
      Object.assign(window, {
        KOI: {
          step(seconds: number, fps = FPS) {
            for (let t = 0; t < seconds; t += 1 / fps) koi.update(1 / fps);
            draw();
            return { art: koi.art, photo: koi.photo, settled: koi.settled };
          },
        },
      });
    }

    measure();
    play();
    // Measure again once the art's font has loaded.
    document.fonts?.ready.then(measure);
    return () => {
      pause();
      resize.disconnect();
      onScreen.disconnect();
      themeAttr.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      scheme.removeEventListener("change", retheme);
      clearInterval(poll);
      koiRef.current = null;
      controlsRef.current = null;
    };
  }, [intro]);

  function swap(toFace: boolean) {
    koiRef.current?.toggle(toFace);
    controlsRef.current?.recount();
    controlsRef.current?.draw();
    controlsRef.current?.play();
  }

  function onPhotoLoad(event: SyntheticEvent<HTMLImageElement>) {
    imgRef.current = event.currentTarget;
    if (pendingRef.current) {
      pendingRef.current = false;
      swap(true);
    }
  }

  function onPhotoError() {
    // Without the photo, the koi stay.
    pendingRef.current = false;
    if (state === "face") {
      setState("koi");
      swap(false);
    }
  }

  function onClick() {
    setTried(true);
    setWantPhoto(true);
    const toFace = state !== "face";
    setState(toFace ? "face" : "koi");
    // Still, there's no animation to cover the wait, so swap once it loads.
    if (toFace && controlsRef.current?.still && !imgRef.current) {
      pendingRef.current = true;
      return;
    }
    pendingRef.current = false;
    swap(toFace);
  }

  const reach = () => setWantPhoto(true);

  return (
    <figure
      ref={figureRef}
      data-state={state}
      data-tried={tried ? "" : undefined}
      className={`koi-figure dot-grid relative flex flex-col justify-end px-3 pt-7 sm:px-5 sm:pt-5 lg:px-7 lg:pt-6 ${className}`}
    >
      <div
        ref={boxRef}
        className="ascii-box relative aspect-5/4 sm:aspect-4/3 lg:aspect-auto lg:min-h-[360px] lg:flex-1"
      >
        <div aria-hidden="true" className="absolute inset-0">
          <canvas ref={canvasRef} className="absolute inset-0 size-full" />
          <pre
            ref={preRef}
            className="ascii absolute top-0 left-0 w-full origin-top-left font-extrabold"
            style={{ "--cols": COLS } as CSSProperties}
          />
          <span
            ref={probeRef}
            className="ascii invisible absolute top-0 left-0 w-max font-extrabold"
          />
        </div>
        {wantPhoto && (
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 1024px) 50vw, calc(100vw - 72px)"
            onLoad={onPhotoLoad}
            onError={onPhotoError}
            data-shown={photoShown ? "" : undefined}
            className="koi-photo object-cover object-[60%_20%] motion-reduce:transition-none"
          />
        )}
      </div>
      {/* On phones the button sits in the art's bottom corner, just above
          the caption, which gets the full width. */}
      <button
        type="button"
        onClick={onClick}
        onPointerEnter={reach}
        onPointerDown={reach}
        onFocus={reach}
        className="koi-toggle absolute right-5 bottom-[51px] z-1 inline-flex h-[30px] items-center gap-2 bg-signal px-3 text-[12px] font-semibold tracking-[0.05em] whitespace-nowrap text-white uppercase hover:brightness-[0.82] sm:top-3 sm:right-5 sm:bottom-auto lg:right-7 [&:lang(zh)]:tracking-[0.04em]"
      >
        {state === "koi" ? (
          <>
            <PixelIcon name="face" size={16} />
            {t("show")}
          </>
        ) : (
          <>
            <PixelIcon name="fish" size={14} />
            {t("hide")}
          </>
        )}
      </button>
      <figcaption className="bg-bg py-3 text-[12px] text-muted sm:absolute sm:top-3.5 sm:left-5 sm:py-1 sm:pr-2 lg:left-7">
        <span className="flex gap-2.5">
          <b className="font-semibold text-fg">
            {art === "koi" ? t("koiFigure") : t("faceFigure")}
          </b>
          <span>
            {art === "face"
              ? t("faceCaption")
              : count === null
                ? t("koiCaptionShort")
                : t("koiCaption", { count })}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
