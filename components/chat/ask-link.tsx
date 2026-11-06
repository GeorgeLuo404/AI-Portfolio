"use client";

import type { ReactNode } from "react";
import { useTwin } from "./chat-provider";

// "Ask my AI twin": a button that opens the chat panel. While the chat is
// off, it's a link to the hero's twin window, which says so.
export function AskLink({
  className,
  onOpen,
  children,
}: {
  className?: string;
  /** Called as the panel opens, such as to close the phone menu. */
  onOpen?: () => void;
  children: ReactNode;
}) {
  const { enabled, open } = useTwin();
  if (!enabled) {
    return (
      <a href="#twin" className={className}>
        {children}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        onOpen?.();
        open();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
