import { Fragment, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { ExternalLink } from "../external-link";

// A reply's text with its links made clickable. The twin writes links in
// Markdown, [label](href), and may also write a bare URL or the email
// address. Only links George published become links: the home page's
// sections, the URLs in `content/`, and his email. Anything else, such as a
// URL the model made up, stays plain text, so the chat can't send visitors
// somewhere George didn't choose.

/** The home page's sections, by their ids. */
const SECTIONS = new Set(["top", "work", "skills", "experience", "contact"]);

const PATTERN = new RegExp(
  [
    // [label](href)
    String.raw`\[([^\]\n]+)\]\(([^)\s]+)\)`,
    // A bare URL, without the punctuation that ends a sentence after it.
    String.raw`(https?:\/\/[^\s<>()[\]"'，。、；：！？）」]*[^\s<>()[\]"'，。、；：！？）」.,;:!?])`,
    // An email address.
    String.raw`([\w.+-]+@[\w-]+(?:\.[\w-]+)+)`,
  ].join("|"),
  "g",
);

// While a reply streams in, a link's Markdown arrives in pieces. Hold back
// an unfinished one at the end, so "[Selected work](#wo" never flashes up.
const UNFINISHED = /\[[^\]\n]*(?:\]\([^)\s]*)?$/;

const trim = (url: string) => url.replace(/\/+$/, "");

const linkClass =
  "text-signal-text underline decoration-1 underline-offset-2 hover:decoration-2";

export function ReplyText({
  text,
  streaming,
  links,
  email,
}: {
  text: string;
  /** True while the reply is still arriving. */
  streaming: boolean;
  /** The URLs George published, from `content/`. */
  links: readonly string[];
  /** George's email, if it's published. */
  email?: string;
}) {
  const shown = streaming ? text.replace(UNFINISHED, "") : text;
  const allowed = links.map(trim);

  // A link to one of George's URLs, or to a page under one of them, such as
  // a repository under his GitHub profile.
  function publishedUrl(href: string) {
    if (!/^https?:\/\//.test(href)) return;
    let url: string;
    try {
      // Compare the destination the browser will actually open.
      url = new URL(href).href;
    } catch {
      return;
    }
    if (
      allowed.some(
        (link) => trim(url) === link || trim(url).startsWith(`${link}/`),
      )
    )
      return url;
  }

  function link(label: string, href: string, key: number): ReactNode {
    const section = href.match(/^(?:\/(?:en|zh))?\/?#([\w-]+)$/)?.[1];
    if (section && SECTIONS.has(section)) {
      return (
        <Link key={key} href={`/#${section}`} className={linkClass}>
          {label}
        </Link>
      );
    }
    const address = href.replace(/^mailto:/, "");
    if (email && address.toLowerCase() === email.toLowerCase()) {
      return (
        <a key={key} href={`mailto:${email}`} className={linkClass}>
          {label}
        </a>
      );
    }
    const url = publishedUrl(href);
    if (url) {
      return (
        <ExternalLink key={key} href={url} className={linkClass}>
          {label}
        </ExternalLink>
      );
    }
    return <Fragment key={key}>{label}</Fragment>;
  }

  const parts: ReactNode[] = [];
  let at = 0;
  for (const match of shown.matchAll(PATTERN)) {
    const [whole, label, href, url, address] = match;
    const start = match.index ?? 0;
    if (start > at) parts.push(shown.slice(at, start));
    if (label && href) parts.push(link(label, href, start));
    else if (url) parts.push(link(url, url, start));
    else if (address) parts.push(link(address, address, start));
    else parts.push(whole);
    at = start + whole.length;
  }
  if (at < shown.length) parts.push(shown.slice(at));
  return <>{parts}</>;
}
