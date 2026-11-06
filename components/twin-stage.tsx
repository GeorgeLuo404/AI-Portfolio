import { TwinWindow } from "./chat/twin-window";
import { PixelIcon } from "./pixel-icon";

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
