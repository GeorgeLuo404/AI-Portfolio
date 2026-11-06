import "server-only";
import type { TextStreamPart, ToolSet } from "ai";
import { DECLINE_MARKER } from "./instructions";

type Part = TextStreamPart<ToolSet>;
type TextDelta = Extract<Part, { type: "text-delta" }>;

/** Every marker in a stretch of text, with the spaces after it. */
const MARKERS = new RegExp(
  `${DECLINE_MARKER.replace(/[[\]]/g, "\\$&")}[ \\t]*`,
  "g",
);

/** How many characters at the end of `text` could still grow into the marker. */
function partial(text: string) {
  for (let n = Math.min(text.length, DECLINE_MARKER.length - 1); n > 0; n--) {
    if (DECLINE_MARKER.startsWith(text.slice(-n))) return n;
  }
  return 0;
}

/**
 * Takes the decline marker out of a reply wherever it appears, and notes on
 * `state` that the twin declined when the reply starts with it. A reply to
 * several questions at once can decline one of them partway through, and the
 * visitor should never see the marker. Text streams on as it arrives, except
 * for a few characters held back while they could still be the start of a
 * marker.
 */
export function stripDeclineMarker(state: { declined: boolean }) {
  return () => {
    let held = "";
    let atStart = true;
    // After a marker, the spaces that follow it can arrive in a later part.
    let trimNext = false;
    let last: TextDelta | null = null;

    function flush(controller: TransformStreamDefaultController<Part>) {
      if (held && last) controller.enqueue({ ...last, text: held });
      held = "";
    }

    return new TransformStream<Part, Part>({
      transform(part, controller) {
        if (part.type !== "text-delta") {
          // Whatever was held back is real text once the text has ended.
          flush(controller);
          controller.enqueue(part);
          return;
        }
        last = part;
        let text = held + part.text;
        held = "";
        if (atStart) {
          const start = text.trimStart();
          if (
            start.length < DECLINE_MARKER.length &&
            DECLINE_MARKER.startsWith(start)
          ) {
            held = text;
            return;
          }
          atStart = false;
          if (start.startsWith(DECLINE_MARKER)) state.declined = true;
          text = start;
        }
        if (trimNext) {
          text = text.replace(/^[ \t]+/, "");
          if (!text) return;
          trimNext = false;
        }
        trimNext = new RegExp(`${MARKERS.source}$`).test(text);
        text = text.replace(MARKERS, "");
        const n = partial(text);
        held = text.slice(text.length - n);
        const out = text.slice(0, text.length - n);
        if (out) controller.enqueue({ ...part, text: out });
      },
      flush(controller) {
        flush(controller);
      },
    });
  };
}
