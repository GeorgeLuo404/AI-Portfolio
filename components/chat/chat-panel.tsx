"use client";

import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { MAX_QUESTION, type TwinMessage } from "@/lib/chat/shared";
import { PixelIcon } from "../pixel-icon";
import { useTwin } from "./chat-provider";

const textOf = (message: TwinMessage) =>
  message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");

// The chat panel: a 440px side panel on desktop and a full-width sheet on
// phones. Visitor messages are signal blocks, the twin's replies have an ink
// rule, and declined questions a grey rule and grey text. It's a modal
// dialog, so focus stays inside it and Esc closes it.
export function ChatPanel() {
  const t = useTranslations("chat");
  const twin = useTranslations("twin");
  const { chat, busy, isOpen, close, ask } = useTwin();
  const { messages, status, error, stop, regenerate } = chat;
  const dialog = useRef<HTMLDialogElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (isOpen && !element.open) {
      element.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!isOpen && element.open) {
      element.close();
    }
  }, [isOpen]);

  // Keep the newest message in view as it streams in.
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever the messages change.
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
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
    // biome-ignore lint/a11y/useKeyWithClickEvents: the click closes from the backdrop; keyboards close with Esc, which the dialog handles itself.
    <dialog
      ref={dialog}
      aria-labelledby="chat-title"
      onClose={() => {
        document.documentElement.style.overflow = "";
        close();
      }}
      // A click outside the panel lands on the dialog's backdrop.
      onClick={(event) => {
        if (event.target === dialog.current) close();
      }}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-[min(440px,100vw)] max-w-none flex-col border-l border-fg bg-bg p-0 text-fg backdrop:bg-black/35 open:flex"
    >
      <div className="flex h-12 flex-none items-center justify-between border-b border-rule pl-4">
        <h2
          id="chat-title"
          className="flex items-center gap-2.5 text-[13px] font-semibold tracking-[0.04em] uppercase"
        >
          <PixelIcon name="chat" />
          {t("title")}
          <span className="flex items-center gap-1.5 font-medium text-muted before:size-1.5 before:bg-signal">
            {twin("online")}
          </span>
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label={t("close")}
          className="grid size-12 place-items-center border-l border-rule"
        >
          <PixelIcon name="close" size={12} />
        </button>
      </div>

      <div
        ref={log}
        role="log"
        aria-busy={busy}
        className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 text-[15px] leading-[1.5]"
      >
        <p className="max-w-[88%] border-l-2 border-fg pl-3">{t("welcome")}</p>
        {messages.map((message) => {
          const text = textOf(message);
          if (message.role === "user") {
            return (
              <p
                key={message.id}
                className="max-w-[88%] self-end bg-signal px-3 py-2.5 whitespace-pre-wrap text-white"
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
              className={`max-w-[88%] border-l-2 pl-3 whitespace-pre-wrap ${declined ? "border-rule text-muted" : "border-fg"}`}
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

      <div className="flex flex-none flex-wrap gap-1.5 px-4 pb-3">
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
        className="flex min-h-[52px] flex-none items-center gap-2.5 border-t border-fg pl-4 font-mono text-[14px] leading-[1.4] font-medium"
      >
        <span aria-hidden="true" className="text-signal-text">
          &gt;
        </span>
        <input
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={MAX_QUESTION}
          aria-label={t("question")}
          placeholder={t("placeholder")}
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted [&:lang(zh)]:font-sans"
        />
        <button type="submit" className="btn btn-signal h-[52px] flex-none">
          {busy ? t("stop") : t("send")}
          <PixelIcon name={busy ? "close" : "send"} size={11} />
        </button>
      </form>
      <p className="flex-none px-4 pt-2.5 pb-3.5 text-[12px] text-muted">
        {t("note")}
      </p>
    </dialog>
  );
}
