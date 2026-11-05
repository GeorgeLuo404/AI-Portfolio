import { type DeepSeekChatOptions, deepSeek } from "@ai-sdk/deepseek";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  type ToolSet,
  toUIMessageStream,
} from "ai";
import { z } from "zod";
import { routing } from "@/i18n/routing";
import { chatEnabled, chatModel } from "@/lib/chat/config";
import { stripDeclineMarker } from "@/lib/chat/decline";
import { chatInstructions } from "@/lib/chat/instructions";
import { MAX_HISTORY, MAX_QUESTION, type TwinMessage } from "@/lib/chat/shared";

// The AI twin. See docs/CHAT.md for the request and response format, which
// stays stable so another backend can replace this one.

const MAX_BODY = 64_000;

const body = z.object({
  locale: z.enum(routing.locales),
  messages: z
    .array(
      z.object({
        id: z.string().max(200),
        role: z.enum(["user", "assistant"]),
        parts: z
          .array(
            z.object({
              type: z.string(),
              text: z.string().max(4000).optional(),
            }),
          )
          .max(20),
      }),
    )
    .min(1)
    .max(200),
});

const fail = (status: number, error: string) =>
  Response.json({ error }, { status });

export async function POST(request: Request) {
  if (!chatEnabled()) return fail(503, "off");

  const raw = await request.text();
  if (raw.length > MAX_BODY) return fail(413, "too_large");
  let parsed: z.infer<typeof body>;
  try {
    parsed = body.parse(JSON.parse(raw));
  } catch {
    return fail(400, "invalid");
  }

  // Keep the recent text only. Nothing a visitor sends is stored or logged.
  const recent = parsed.messages
    .slice(-MAX_HISTORY)
    .map((message) => ({
      id: message.id,
      role: message.role,
      text: message.parts
        .flatMap((part) =>
          part.type === "text" && part.text ? [part.text] : [],
        )
        .join("\n"),
    }))
    .filter((message) => message.text.length > 0);
  const question = recent.at(-1);
  if (question?.role !== "user" || question.text.length > MAX_QUESTION) {
    return fail(400, "invalid");
  }
  const messages: TwinMessage[] = recent.map(({ id, role, text }) => ({
    id,
    role,
    parts: [{ type: "text", text }],
  }));

  const state = { declined: false };
  const result = streamText({
    model: deepSeek(chatModel()),
    instructions: chatInstructions(parsed.locale),
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 400,
    temperature: 0.3,
    // Thinking mode is on by default for V4 models. Short answers from a
    // short profile don't need it, and without it replies start sooner.
    providerOptions: {
      deepseek: {
        thinking: { type: "disabled" },
      } satisfies DeepSeekChatOptions,
    },
    experimental_transform: stripDeclineMarker(state),
    abortSignal: request.signal,
    onError: ({ error }) => {
      console.error(
        "chat: the model call failed:",
        error instanceof Error ? error.name : "unknown",
      );
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream<ToolSet, TwinMessage>({
      stream: result.stream,
      sendReasoning: false,
      messageMetadata: ({ part }) =>
        part.type === "finish" ? { declined: state.declined } : undefined,
      onError: () => "unavailable",
    }),
  });
}
