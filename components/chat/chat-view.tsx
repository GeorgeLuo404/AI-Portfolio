"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useLocale, useTranslations } from "next-intl";
import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "@/i18n/navigation";
import { MAX_QUESTION, type TwinMessage } from "@/lib/chat/shared";
import { PixelIcon } from "../pixel-icon";
import { PENDING_KEY } from "./chat-provider";

// The chat page's conversation. It lasts for the browser tab, in that tab's
// own storage, and nothing is kept on the server. The page scrolls like any
// other, with the title bar pinned under the header and the composer pinned
// to the bottom of the screen, so phones need no scroll locking and the back
// button leaves the chat. Both bars draw the frame's side lines themselves,
// since their background would hide them.

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
  // Waiting for the first words of a reply, which can take a moment.
  const last = messages.at(-1);
  const waiting = busy && !(last?.role === "assistant" && textOf(last));
  const loaded = useRef(false);
  /** A question asked on another page, until it's sent here. */
  const pending = useRef<string | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
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
    if (pending.current === null) {
      try {
        pending.current = sessionStorage.getItem(PENDING_KEY) ?? "";
        sessionStorage.removeItem(PENDING_KEY);
      } catch {
        pending.current = "";
      }
    }
    const text = pending.current;
    if (!text) {
      if (matchMedia("(pointer: fine)").matches) input.current?.focus();
      return;
    }
    // Send once the page has settled. In development React mounts every
    // component twice, and the chat stops whatever started before the
    // second mount, which used to drop the question.
    const timer = setTimeout(() => {
      pending.current = "";
      sendMessage({ text });
    });
    return () => clearTimeout(timer);
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

  // Follow a reply as it streams in, unless the visitor has scrolled up to
  // read: then stay put until they come back down or ask something new.
  const following = useRef(true);
  useEffect(() => {
    const onScroll = () => {
      following.current =
        innerHeight + scrollY >= document.documentElement.scrollHeight - 120;
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever the messages change.
  useEffect(() => {
    if (!messages.length) return;
    if (last?.role === "user") following.current = true;
    if (!following.current) return;
    const frame = requestAnimationFrame(() =>
      scrollTo({ top: document.documentElement.scrollHeight }),
    );
    return () => cancelAnimationFrame(frame);
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

  // Enter sends and Shift+Enter starts a new line, but not mid-way through
  // an input method's composition, such as picking Chinese characters. On
  // touch screens Return starts a new line, and the Send button sends.
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (matchMedia("(pointer: coarse)").matches) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  // The box grows with its text, up to a third of the screen, then scrolls.
  // biome-ignore lint/correctness/useExhaustiveDependencies: resize whenever the text changes.
  useEffect(() => {
    const box = input.current;
    if (!box) return;
    box.style.height = "auto";
    box.style.height = `${box.scrollHeight}px`;
  }, [draft]);

  return (
    <>
      <div className="sticky top-[49px] z-10 flex h-[49px] flex-none items-center justify-between border-x border-b border-rule bg-bg pl-4 lg:border-x-0">
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
          className="-mr-px grid size-12 place-items-center border-l border-rule lg:mr-0"
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
        {waiting && (
          <p className="flex h-6 items-center gap-2.5 border-l-2 border-fg pl-3 text-[14px] text-muted">
            {t("thinking")}
            <span aria-hidden="true" className="flex items-center gap-1">
              {[0, 1, 2].map((n) => (
                <span
                  key={n}
                  style={{ animationDelay: `${n * 0.15}s` }}
                  className="size-1.5 bg-signal motion-safe:animate-[wave_1.1s_ease-in-out_infinite]"
                />
              ))}
            </span>
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

      <div className="sticky bottom-0 z-10 flex-none border-x border-rule bg-bg pb-[env(safe-area-inset-bottom)] lg:border-x-0">
        {/* The question on top, growing with its text; the suggestions and
            Send share the row under it, so a long question never squeezes
            them. */}
        <form onSubmit={submit} className="-mx-px border-y border-fg lg:mx-0">
          <label className="flex cursor-text gap-2.5 px-4 font-mono text-[14px] leading-[1.4] font-medium">
            <span aria-hidden="true" className="pt-3.5 text-signal-text">
              &gt;
            </span>
            <textarea
              ref={input}
              rows={1}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
              maxLength={MAX_QUESTION}
              aria-label={t("question")}
              placeholder={t("placeholder")}
              className="max-h-[33svh] min-w-0 flex-1 resize-none bg-transparent pt-3.5 pb-2 outline-none placeholder:text-muted [&:lang(zh)]:font-sans"
            />
          </label>
          <div className="flex items-center gap-3">
            {/* Very narrow screens scroll the suggestions sideways rather
                than wrap them. */}
            <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pl-4 [scrollbar-width:none]">
              {(["stack", "start", "contact"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  disabled={busy}
                  onClick={() => ask(twin(`questions.${key}`))}
                  className="h-[26px] flex-none border border-rule bg-panel px-2 text-xs font-medium whitespace-nowrap text-signal-text hover:border-signal disabled:opacity-50"
                >
                  {twin(`suggest.${key}`)}
                </button>
              ))}
            </div>
            {/* On phones Send is a square with its arrow alone, so the
                suggestions keep their room. */}
            <button
              type="submit"
              className="btn btn-signal h-11 flex-none max-sm:w-11 max-sm:px-0"
            >
              <span className="max-sm:sr-only">
                {busy ? t("stop") : t("send")}
              </span>
              <PixelIcon name={busy ? "close" : "up"} size={11} />
            </button>
          </div>
        </form>
        <p className="px-4 pt-2.5 pb-3.5 text-[12px] text-muted">{t("note")}</p>
      </div>
    </>
  );
}
