import type { UIMessage } from "ai";

// What the chat's client and server agree on. The request and response
// format of /api/chat is documented in docs/CHAT.md, so another backend can
// replace this one.

/** Set on the twin's reply when it declined an off-topic question. */
export type TwinMetadata = { declined?: boolean };

export type TwinMessage = UIMessage<TwinMetadata>;

/** The longest question a visitor can send, in characters. */
export const MAX_QUESTION = 500;

/** How many recent messages go to the model, the new question included. */
export const MAX_HISTORY = 12;
