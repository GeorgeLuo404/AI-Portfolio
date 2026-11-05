import { useTranslations } from "next-intl";
import { PixelIcon } from "./pixel-icon";

// The AI twin's window in the hero: a title and status, a prompt with a
// blinking caret, three suggested questions, a note that answers can be
// wrong, and an Ask button. It's a picture of the chat until T9 wires it up.
export function TwinWindow({ className = "" }: { className?: string }) {
  const t = useTranslations("twin");
  const header = useTranslations("header");
  return (
    <div
      id="twin"
      className={`flex flex-col border border-b-0 border-fg bg-bg ${className}`}
    >
      <div className="flex h-9 items-center justify-between gap-3 border-b border-rule px-3 text-xs font-semibold tracking-[0.04em] uppercase">
        <span className="flex items-center gap-2">
          <PixelIcon name="chat" />
          {header("ask")}
        </span>
        <span className="flex items-center gap-1.5 font-medium text-muted before:size-1.5 before:bg-signal">
          {t("online")}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-3 pt-3.5 pb-3">
        <div className="flex items-center gap-2 font-mono text-sm leading-[1.4] font-medium">
          <span className="text-signal-text">&gt;</span>
          <span className="text-muted [&:lang(zh)]:font-sans">
            {t("placeholder")}
          </span>
          <span
            aria-hidden="true"
            className="h-4 w-2 bg-signal motion-safe:animate-[blink_1.1s_steps(1)_infinite]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["projects", "stack", "start"] as const).map((key) => (
            <button
              key={key}
              type="button"
              className="h-[26px] bg-panel px-[9px] text-xs font-medium hover:text-signal-text"
            >
              {t(`suggest.${key}`)}
            </button>
          ))}
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 text-[11.5px] leading-[1.4] text-muted">
          <span>{t("note")}</span>
          <button type="button" className="btn btn-signal flex-none">
            {t("ask")}
            <PixelIcon name="send" size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

type Room = { win: number; top: number; panel: number; signal: number };

// The room's lines in percent of the stage: from its corners to the
// window's, a center line, a horizon out to the panels behind the window,
// and the floor's edges.
function roomLines({ win, top, panel, signal }: Room) {
  const horizon = top + (100 - top) * 0.42;
  const floor = 100 - (100 - horizon) * 0.35;
  return [
    [0, 0, win, top],
    [100, 0, 100 - win, top],
    [50, 0, 50, top],
    [0, horizon, panel, horizon],
    [signal, horizon, 100, horizon],
    [0, 100, panel, floor],
    [100, 100, signal, floor],
  ].filter(([x1, y1, x2, y2]) => x1 !== x2 || y1 !== y2);
}

function RoomLines({ room, className }: { room: Room; className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`absolute inset-0 size-full stroke-rule ${className}`}
    >
      {roomLines(room).map(([x1, y1, x2, y2]) => (
        <line
          key={`${x1}-${y1}-${x2}-${y2}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

// The window stands in a small room drawn in one-point perspective, with a
// grey panel and a signal panel behind it. The geometry is in percent, so
// the lines need no script.
export function TwinStage({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative min-h-[360px] overflow-hidden sm:min-h-[330px] lg:min-h-[310px] ${className}`}
    >
      <RoomLines
        room={{ win: 6, top: 12, panel: 0, signal: 100 }}
        className="sm:hidden"
      />
      <RoomLines
        room={{ win: 21, top: 15, panel: 12, signal: 89 }}
        className="hidden sm:block lg:hidden"
      />
      <RoomLines
        room={{ win: 20, top: 15, panel: 12, signal: 89 }}
        className="hidden lg:block"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-[52%] w-[13%] bg-well sm:left-[12%]"
      />
      <div
        aria-hidden="true"
        className="absolute right-0 bottom-0 h-[40%] w-[13%] bg-signal text-white sm:right-[11%]"
      >
        <PixelIcon name="chat" size={16} className="absolute top-3 right-3" />
      </div>
      <TwinWindow className="absolute inset-x-[6%] top-[12%] bottom-0 sm:inset-x-[21%] sm:top-[15%] lg:inset-x-[20%]" />
    </div>
  );
}
