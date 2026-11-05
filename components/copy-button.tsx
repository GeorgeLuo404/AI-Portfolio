"use client";

import { useState } from "react";
import { PixelIcon } from "./pixel-icon";

// Copies a value, such as the WeChat ID, and says so. Where the clipboard
// isn't available, it shows the value instead, so it can be copied by hand.
export function CopyButton({
  value,
  label,
  done,
  className = "",
}: {
  value: string;
  label: string;
  done: string;
  className?: string;
}) {
  const [text, setText] = useState(label);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setText(done);
    } catch {
      setText(value);
    }
  }
  return (
    <button type="button" onClick={copy} className={className}>
      <PixelIcon name="copy" size={13} />
      <span aria-live="polite">{text}</span>
    </button>
  );
}
