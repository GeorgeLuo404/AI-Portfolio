"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { useTwin } from "./chat-provider";

// "Ask my AI twin": a link to the chat page. While the chat is off, it goes
// to the hero's twin window, which says so.
export function AskLink({
  className,
  onOpen,
  children,
}: {
  className?: string;
  /** Called on the way to the chat, such as to close the phone menu. */
  onOpen?: () => void;
  children: ReactNode;
}) {
  const { enabled } = useTwin();
  return (
    <Link
      href={enabled ? "/chat" : "/#twin"}
      onClick={onOpen}
      className={className}
    >
      {children}
    </Link>
  );
}
