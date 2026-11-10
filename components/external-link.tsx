import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

/**
 * A link that opens another site in a new tab, so visitors keep their place
 * here. Screen readers hear that it opens a new tab. Links within the site,
 * and placeholders such as `#top`, open in place.
 */
export function ExternalLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const t = useTranslations("common");
  if (!/^https?:\/\//.test(href)) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      <span className="sr-only"> {t("newTab")}</span>
    </a>
  );
}
