import "server-only";
import type { TextStreamPart, ToolSet } from "ai";
import { DECLINE_MARKER } from "./instructions";

/**
 * Takes the decline marker off the start of a reply, and notes on `state`
 * that the twin declined. The reply streams on as soon as it's clear whether
 * it starts with the marker, which takes the first few characters.
 */
export function stripDeclineMarker(state: { declined: boolean }) {
  return () => {
    let buffer = "";
    let decided = false;
    // After the marker, the reply's leading space can arrive in a later part.
    let trim = false;
    let last: Extract<TextStreamPart<ToolSet>, { type: "text-delta" }> | null =
      null;
    return new TransformStream<
      TextStreamPart<ToolSet>,
      TextStreamPart<ToolSet>
    >({
      transform(part, controller) {
        if (decided) {
          if (trim && part.type === "text-delta") {
            const text = part.text.trimStart();
            if (!text) return;
            trim = false;
            controller.enqueue({ ...part, text });
            return;
          }
          controller.enqueue(part);
          return;
        }
        if (part.type !== "text-delta") {
          // The text ended before it could be told apart: send what's held.
          if (part.type === "text-end" && last && buffer) {
            controller.enqueue({ ...last, text: buffer });
            buffer = "";
            decided = true;
          }
          controller.enqueue(part);
          return;
        }
        last = part;
        buffer += part.text;
        const start = buffer.trimStart();
        if (start.startsWith(DECLINE_MARKER)) {
          decided = true;
          state.declined = true;
          const rest = start.slice(DECLINE_MARKER.length).trimStart();
          if (rest) controller.enqueue({ ...part, text: rest });
          else trim = true;
        } else if (!DECLINE_MARKER.startsWith(start)) {
          decided = true;
          controller.enqueue({ ...part, text: buffer });
        }
      },
    });
  };
}
