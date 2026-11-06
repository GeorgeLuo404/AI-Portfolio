"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { MAX_QUESTION, type TwinMessage } from "@/lib/chat/shared";
import { PixelIcon } from "../pixel-icon";
import { PENDING_KEY } from "./chat-provider";

// The chat page's conversation. It lasts for the browser tab, in that tab's
// own storage, and nothing is kept on the server. The page scrolls like any
// other, with the composer pinned to the bottom of the screen, so phones
// need no scroll locking and the back button leaves the chat.

const STORAGE_KEY = "twin-chat";
const KEEP = 40;

const textOf = (message: TwinMessage) =>
  message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");

export function ChatView() {
  const t = useTranslations("chat");
  const twin = useTranslations("twin");
  const locale = useLocale();
  const [transport] = useState(
    () =>
      new DefaultChatTransport<TwinMessage>({
        api: "/api/chat",
        body: { locale },
      }),
  );
  const {
    messages,
    setMessages,
    status,
    error,
    sendMessage,
    stop,
    regenerate,
  } = useChat<TwinMessage>({ transport });
  const busy = status === "submitted" || status === "streaming";
  const loaded = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");

  function ask(question: string) {
    const text = question.trim().slice(0, MAX_QUESTION);
    if (text && !busy) sendMessage({ text });
  }

  // Pick up this tab's conversation, then any question asked on the way
  // here. Pointer devices get the cursor in the box straight away.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once, when the page opens.
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved) && saved.length) setMessages(saved);
    } catch {}
    loaded.current = true;
    let pending: string | null = null;
    try {
      pending = sessionStorage.getItem(PENDING_KEY);
      sessionStorage.removeItem(PENDING_KEY);
    } catch {}
    if (pending) sendMessage({ text: pending });
    else if (matchMedia("(pointer: fine)").matches) input.current?.focus();
  }, []);

  useEffect(() => {
    if (!loaded.current || busy) return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.slice(-KEEP)),
      );
    } catch {}
  }, [messages, busy]);

  // Keep the newest message in view as it streams in.
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever the messages change.
  useEffect(() => {
    if (messages.length) {
      scrollTo({ top: document.documentElement.scrollHeight });
    }
  }, [messages, status]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) {
      stop();
      return;
    }
    if (!draft.trim()) return;
    ask(draft);
    setDraft("");
  }

  return (
    <>
      <div className="flex h-12 flex-none items-center justify-between border-b border-rule pl-4">
        <h1 className="flex items-center gap-2.5 text-[13px] font-semibold tracking-[0.04em] uppercase">
          <PixelIcon name="chat" />
          {t("title")}
          <span className="flex items-center gap-1.5 font-medium text-muted before:size-1.5 before:bg-signal">
            {twin("online")}
          </span>
        </h1>
        <Link
          href="/"
          aria-label={t("back")}
          className="grid size-12 place-items-center border-l border-rule"
        >
          <PixelIcon name="close" size={12} />
        </Link>
      </div>

      <div
        role="log"
        aria-busy={busy}
        className="flex flex-1 flex-col gap-4 px-4 py-5 text-[15px] leading-[1.5]"
      >
        <p className="max-w-[88%] border-l-2 border-fg pl-3">{t("welcome")}</p>
        {messages.map((message) => {
          const text = textOf(message);
          if (message.role === "user") {
            return (
              <p
                key={message.id}
                className="max-w-[88%] self-end bg-signal px-3 py-2.5 break-words whitespace-pre-wrap text-white"
              >
                {text}
              </p>
            );
          }
          if (!text) return null;
          const declined = message.metadata?.declined;
          return (
            <p
              key={message.id}
              className={`max-w-[88%] border-l-2 pl-3 break-words whitespace-pre-wrap ${declined ? "border-rule text-muted" : "border-fg"}`}
            >
              {text}
            </p>
          );
        })}
        {status === "submitted" && (
          <p className="flex h-6 items-center border-l-2 border-fg pl-3">
            <span className="sr-only">{t("thinking")}</span>
            <span
              aria-hidden="true"
              className="h-4 w-2 bg-signal motion-safe:animate-[blink_1.1s_steps(1)_infinite]"
            />
          </p>
        )}
        {error && (
          <div className="max-w-[88%] border-l-2 border-rule pl-3 text-muted">
            <p>{t("error")}</p>
            <button
              type="button"
              onClick={() => regenerate()}
              className="mt-1 text-signal-text underline underline-offset-2"
            >
              {t("retry")}
            </button>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-10 flex-none bg-bg pb-[env(safe-area-inset-bottom)]">
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {(["stack", "start", "contact"] as const).map((key) => (
            <button
              key={key}
              type="button"
              disabled={busy}
              onClick={() => ask(twin(`questions.${key}`))}
              className="h-[26px] bg-panel px-[9px] text-xs font-medium hover:text-signal-text disabled:opacity-50"
            >
              {twin(`suggest.${key}`)}
            </button>
          ))}
        </div>
        <form
          onSubmit={submit}
          className="flex min-h-[52px] items-center gap-2.5 border-y border-fg pl-4 font-mono text-[14px] leading-[1.4] font-medium"
        >
          <span aria-hidden="true" className="text-signal-text">
            &gt;
          </span>
          <input
            ref={input}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={MAX_QUESTION}
            enterKeyHint="send"
            aria-label={t("question")}
            placeholder={t("placeholder")}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted [&:lang(zh)]:font-sans"
          />
          <button type="submit" className="btn btn-signal h-[52px] flex-none">
            {busy ? t("stop") : t("send")}
            <PixelIcon name={busy ? "close" : "send"} size={11} />
          </button>
        </form>
        <p className="px-4 pt-2.5 pb-3.5 text-[12px] text-muted">{t("note")}</p>
      </div>
    </>
  );
}
