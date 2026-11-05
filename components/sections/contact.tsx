import { useLocale, useTranslations } from "next-intl";
import { getContent } from "@/content";
import { AsciiScene } from "../ascii-art";
import { CopyButton } from "../copy-button";
import { PixelIcon } from "../pixel-icon";

// Contact, a dark panel: the question in braces over faint pond ripples, a
// line on how to get in touch, and buttons to email, copy the WeChat ID, or
// ask the AI twin. The English question is a graphic on the Chinese page.
export function Contact() {
  const t = useTranslations("contact");
  const header = useTranslations("header");
  const locale = useLocale();
  const { contact } = getContent(locale);
  const en = locale === "en";
  const brace =
    "-translate-y-[0.06em] text-[64px] leading-none font-extralight sm:text-[96px] lg:text-[128px]";
  const title =
    "text-[26px] leading-none font-semibold tracking-[-0.035em] uppercase sm:text-[40px] lg:text-[52px]";
  const words = (
    <>
      <span className="block">
        {t("display.first")}
        <PixelIcon
          name="spark"
          size={28}
          className="ml-1 inline-block -translate-y-1.5 align-top sm:-translate-y-3.5"
        />
      </span>
      <span className="block">{t("display.second")}</span>
    </>
  );
  return (
    <section id="contact" aria-labelledby="cta-title" className="ink bg-panel">
      <div className="frame grid justify-items-center overflow-hidden pt-20 pb-[72px] text-center sm:pt-28 sm:pb-[104px]">
        <AsciiScene
          scene="ripples"
          faint
          className="pointer-events-none absolute inset-x-0 top-0"
        />
        <div
          aria-hidden={en ? undefined : true}
          lang="en"
          className="relative flex items-center gap-2.5 sm:gap-7"
        >
          <span aria-hidden="true" className={brace}>
            {"{"}
          </span>
          {en ? (
            <h2 id="cta-title" className={title}>
              {words}
            </h2>
          ) : (
            <p className={title}>{words}</p>
          )}
          <span aria-hidden="true" className={brace}>
            {"}"}
          </span>
        </div>
        {!en && (
          <h2 id="cta-title" className="zh-heading relative mt-5">
            {t("heading")}
          </h2>
        )}
        <p className="relative mt-6 max-w-[32em] text-[16px] text-muted">
          {t("text")}
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-2.5">
          <a
            href={`mailto:${contact.email}`}
            className="btn btn-light max-sm:h-11"
          >
            <PixelIcon name="mail" size={13} />
            {t("email")}
          </a>
          <CopyButton
            value={contact.wechat}
            label={t("copy")}
            done={t("copied")}
            className="btn btn-line max-sm:h-11"
          />
          {/* Opens the chat once T9 adds it. Until then, it goes to the AI
              twin's window in the hero. */}
          <a href="#twin" className="btn btn-signal max-sm:h-11">
            <PixelIcon name="chat" size={13} />
            {header("ask")}
          </a>
        </div>
      </div>
    </section>
  );
}
