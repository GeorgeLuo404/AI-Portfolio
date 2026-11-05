"use client";

import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { MAX_QUESTION } from "@/lib/chat/shared";
import { PixelIcon } from "../pixel-icon";
import { useTwin } from "./chat-provider";

// The AI twin's window in the hero: a title and status, a prompt with a
// blinking caret, suggested questions, a note that answers can be wrong, and
// an Ask button. Asking opens the chat panel. While the chat is off, the
// window says so and offers email instead.
export function TwinWindow({ className = "" }: { className?: string }) {
  const t = useTranslations("twin");
  const header = useTranslations("header");
  const { enabled, email, busy, ask } = useTwin();
  const [draft, setDraft] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    // An empty prompt asks the question shown as its placeholder.
    ask(draft.trim() || t("placeholder"));
    setDraft("");
  }

  const body = "flex flex-1 flex-col gap-3 px-3 pt-3.5 pb-3";
  const prompt =
    "flex items-center gap-2 font-mono text-sm leading-[1.4] font-medium";
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
        <span
          className={`flex items-center gap-1.5 font-medium text-muted before:size-1.5 ${enabled ? "before:bg-signal" : "before:bg-muted"}`}
        >
          {enabled ? t("online") : t("offline")}
        </span>
      </div>
      {enabled ? (
        <form onSubmit={submit} className={body}>
          <label className={`${prompt} cursor-text`}>
            <span aria-hidden="true" className="text-signal-text">
              &gt;
            </span>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={MAX_QUESTION}
              aria-label={t("question")}
              placeholder={t("placeholder")}
              className="peer field-sizing-content max-w-full min-w-0 bg-transparent outline-none placeholder:text-muted [&:lang(zh)]:font-sans"
            />
            <span
              aria-hidden="true"
              className="h-4 w-2 flex-none bg-signal peer-focus:hidden motion-safe:animate-[blink_1.1s_steps(1)_infinite]"
            />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(["projects", "stack", "start"] as const).map((key) => (
              <button
                key={key}
                type="button"
                disabled={busy}
                onClick={() => ask(t(`questions.${key}`))}
                className="h-[26px] bg-panel px-[9px] text-xs font-medium hover:text-signal-text disabled:opacity-50"
              >
                {t(`suggest.${key}`)}
              </button>
            ))}
          </div>
          <div className="mt-auto flex items-end justify-between gap-3 text-[11.5px] leading-[1.4] text-muted">
            <span>{t("note")}</span>
            <button type="submit" className="btn btn-signal flex-none">
              {t("ask")}
              <PixelIcon name="send" size={11} />
            </button>
          </div>
        </form>
      ) : (
        <div className={body}>
          <p className={`${prompt} text-muted`}>
            <span aria-hidden="true" className="text-signal-text">
              &gt;
            </span>
            <span className="[&:lang(zh)]:font-sans">{t("resting")}</span>
          </p>
          <p className="mt-auto text-[11.5px] leading-[1.4] text-muted">
            {t("offNote")}{" "}
            <a
              href={`mailto:${email}`}
              className="text-signal-text underline underline-offset-2"
            >
              {email}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
