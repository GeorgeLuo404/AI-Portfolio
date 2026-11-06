"use client";

import { createContext, type ReactNode, useContext } from "react";
import { useRouter } from "@/i18n/navigation";
import { MAX_QUESTION } from "@/lib/chat/shared";

// What every page needs to know about the AI twin: whether it's switched on,
// the email to offer while it's off, and a way to ask it something. The
// conversation itself lives on the chat page, so the chat's code only loads
// there.

/** A question asked from another page, waiting for the chat page. */
export const PENDING_KEY = "twin-ask";

type TwinContext = {
  /** Whether the chat is switched on. Off, the Ask links go to the window. */
  enabled: boolean;
  email: string;
  /** Go to the chat page and ask a question there. */
  ask: (question: string) => void;
};

const Context = createContext<TwinContext | null>(null);

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
  const router = useRouter();
  const value: TwinContext = {
    enabled,
    email,
    ask: (question) => {
      // The question travels in this tab's storage, not the address, so it
      // never reaches the server's request logs.
      const text = question.trim().slice(0, MAX_QUESTION);
      try {
        if (text) sessionStorage.setItem(PENDING_KEY, text);
      } catch {}
      router.push("/chat");
    },
  };
  return <Context value={value}>{children}</Context>;
}
