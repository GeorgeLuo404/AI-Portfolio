"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useLocale } from "next-intl";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { MAX_QUESTION, type TwinMessage } from "@/lib/chat/shared";
import { ChatPanel } from "./chat-panel";

// The AI twin's conversation, shared by everything that can start it: the
// hero's window, the header, the phone menu, and the contact panel. The
// conversation lasts for the browser tab, in that tab's own storage, and
// nothing is kept on the server.

const STORAGE_KEY = "twin-chat";
const KEEP = 40;

type Chat = ReturnType<typeof useChat<TwinMessage>>;

type ChatContext = {
  /** Whether the chat is switched on. Off, the Ask links go to the window. */
  enabled: boolean;
  email: string;
  chat: Chat;
  busy: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  /** Open the panel and ask a question. */
  ask: (question: string) => void;
};

const Context = createContext<ChatContext | null>(null);

export function useTwin() {
  const value = useContext(Context);
  if (!value) throw new Error("useTwin needs a ChatProvider");
  return value;
}

export function ChatProvider({
  enabled,
  email,
  children,
}: {
  enabled: boolean;
  email: string;
  children: ReactNode;
}) {
  const locale = useLocale();
  const [transport] = useState(
    () =>
      new DefaultChatTransport<TwinMessage>({
        api: "/api/chat",
        body: { locale },
      }),
  );
  const chat = useChat<TwinMessage>({ transport });
  const { messages, setMessages, status, sendMessage } = chat;
  const [isOpen, setOpen] = useState(false);
  const loaded = useRef(false);
  const busy = status === "submitted" || status === "streaming";

  // Pick up this tab's conversation after the page loads, then keep saving
  // it whenever a reply settles.
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved) && saved.length) setMessages(saved);
    } catch {}
    loaded.current = true;
  }, [setMessages]);

  useEffect(() => {
    if (!loaded.current || busy) return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.slice(-KEEP)),
      );
    } catch {}
  }, [messages, busy]);

  const value: ChatContext = {
    enabled,
    email,
    chat,
    busy,
    isOpen,
    open: () => setOpen(true),
    close: () => setOpen(false),
    ask: (question) => {
      const text = question.trim().slice(0, MAX_QUESTION);
      setOpen(true);
      if (text && !busy) sendMessage({ text });
    },
  };

  return (
    <Context value={value}>
      {children}
      {enabled && <ChatPanel />}
    </Context>
  );
}
