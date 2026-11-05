"use client";

import { useId, useState } from "react";
import { PixelIcon } from "./pixel-icon";

export type RoleRow = {
  dates: string;
  title: string;
  org: string;
  /** One line per result. */
  results: readonly string[];
  stack: readonly string[];
};

// Roles and education as an accordion: dates, title, and organization in one
// line, and a button that opens the results and the stack. The first row
// starts open.
export function RoleList({
  rows,
  usedLabel,
}: {
  rows: readonly RoleRow[];
  usedLabel: string;
}) {
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set([0]));
  const id = useId();
  const toggle = (n: number) =>
    setOpen((current) => {
      const next = new Set(current);
      if (!next.delete(n)) next.add(n);
      return next;
    });
  return (
    <ol className="border-t border-rule">
      {rows.map((row, n) => {
        const isOpen = open.has(n);
        const body = `${id}-${n}`;
        return (
          <li
            key={`${row.dates}-${row.title}`}
            className="border-b border-rule"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={body}
              onClick={() => toggle(n)}
              className="grid min-h-[60px] w-full grid-cols-[1fr_20px] items-center gap-x-3 gap-y-0.5 p-3 text-left sm:grid-cols-[120px_1fr_auto_20px] sm:gap-4 lg:pl-7"
            >
              <span className="text-[14px] text-muted">{row.dates}</span>
              <span className="row-start-2 text-[17px] font-medium sm:row-start-auto">
                {row.title}
              </span>
              <span className="row-start-3 text-[14px] text-muted sm:row-start-auto">
                {row.org}
              </span>
              <PixelIcon
                name={isOpen ? "minus" : "plus"}
                size={12}
                className="col-start-2 row-[1/4] justify-self-end sm:col-start-auto sm:row-auto"
              />
            </button>
            <div
              id={body}
              hidden={!isOpen}
              className="grid gap-4 pr-4 pb-5 pl-3 sm:pr-8 sm:pb-6 sm:pl-[148px] lg:pl-[164px]"
            >
              {row.results.length > 0 && (
                <ul className="grid gap-1.5 text-[15px] leading-[1.5] text-muted">
                  {row.results.map((result) => (
                    <li
                      key={result}
                      className="before:text-signal-text before:content-['+_']"
                    >
                      {result}
                    </li>
                  ))}
                </ul>
              )}
              {row.stack.length > 0 && (
                <ul aria-label={usedLabel} className="flex flex-wrap gap-1.5">
                  {row.stack.map((tool) => (
                    <li key={tool} className="chip chip-muted">
                      {tool}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
