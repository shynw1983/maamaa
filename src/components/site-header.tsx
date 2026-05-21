"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { localizedPath } from "@/components/localized-path";
import { isLocale, type Locale } from "@/data/locales";

export function SiteHeader({ menu = false }: { menu?: boolean }) {
  const [navOpen, setNavOpen] = useState(false);
  const { language, setLanguage, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const homeHref = localizedPath(language, "/");
  const menuHref = localizedPath(language, "/menu");

  const sectionHref = (hash: string) => (menu ? `${homeHref}${hash}` : hash);

  const changeLanguage = (nextLanguage: Locale) => {
    setLanguage(nextLanguage);
    setNavOpen(false);

    const currentLanguagePrefix = ["/en", "/zh", "/ko"].find(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
    const basePath = currentLanguagePrefix ? pathname.slice(currentLanguagePrefix.length) || "/" : pathname;
    router.push(localizedPath(nextLanguage, basePath));
  };

  return (
    <header className="siteHeader" aria-label={t("メインナビゲーション")}>
      <a className="brand" href={menu ? homeHref : "#top"} aria-label={t("まぁ麻 ホーム")}>
        <img className="brandLogo" src="/icon.png" alt="" aria-hidden="true" />
        <span className="brandText">
          <span className="brandName">まぁ麻</span>
          <span className="brandSlogan">出来立て麻辣湯</span>
        </span>
      </a>
      <button
        className="navToggle"
        type="button"
        aria-label={t("ページナビゲーション")}
        aria-expanded={navOpen}
        onClick={() => setNavOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      <div className={`headerActions${navOpen ? " isOpen" : ""}`}>
        <nav className="nav" aria-label={t("ページナビゲーション")}>
          {menu ? (
            <a href={homeHref} onClick={() => setNavOpen(false)}>
              {t("Home")}
            </a>
          ) : (
            <a href="#concept" onClick={() => setNavOpen(false)}>
              {t("Concept")}
            </a>
          )}
          <a href={menuHref} aria-current={menu ? "page" : undefined} onClick={() => setNavOpen(false)}>
            {t("Menu")}
          </a>
          <a href={sectionHref("#stores")} onClick={() => setNavOpen(false)}>
            {t("Stores")}
          </a>
          <a href={sectionHref("#contact")} onClick={() => setNavOpen(false)}>
            {t("Contact")}
          </a>
        </nav>
        <label className="languagePicker">
          <span>Language</span>
          <select
            value={language}
            onChange={(event) => {
              const nextLanguage = event.target.value;
              if (isLocale(nextLanguage)) changeLanguage(nextLanguage);
            }}
            aria-label="Language"
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="ko">한국어</option>
          </select>
        </label>
      </div>
    </header>
  );
}
