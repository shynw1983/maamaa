"use client";

import Image from "next/image";
import { useI18n } from "@/components/i18n-provider";
import { localizedPath } from "@/components/localized-path";
import { SiteHeader } from "@/components/site-header";
import { formatStoreNameTemplate, resolveMenuStoreDisplayName, type StoreDisplayMenu } from "@/components/store-display-name";
import type { BrandSiteSection } from "@/server/brand-site-source";

const stores = [
  {
    label: "1st store",
    title: "pickup-store",
    address: "福岡市南区清水 1-2-8-103",
    body: "福岡南店では、Web予約、デリバリー、テイクアウトを店舗の受付状況に合わせて承ります。ご注文ごとに鍋を分け、出来立てで仕上げます。",
  },
  {
    label: "2nd store",
    title: "店内でも楽しめる店舗",
    body: "店内でゆっくり麻辣湯を楽しめる店舗も展開しています。営業情報、受付方法、開始時期は各店舗の案内をご確認ください。",
  },
];

const bowls = [
  ["Cook", "ご注文ごとに鍋を分け、スープと具材を一杯ずつ合わせて仕上げます。"],
  ["Select", "野菜、きのこ、肉、海鮮、麺を組み合わせ、自分好みの一杯に。"],
  ["Balance", "辛さ、しびれ、香りのバランスを整え、出来立てでお渡しします。"],
];

const findSection = (sections: BrandSiteSection[], key: string) =>
  sections.find((section) => section.sectionKey === key);

export function HomeContent({ siteSections = [], initialMenu }: { siteSections?: BrandSiteSection[]; initialMenu?: StoreDisplayMenu }) {
  const { language, t } = useI18n();
  const storeDisplayName = resolveMenuStoreDisplayName(initialMenu);
  const hero = findSection(siteSections, "hero");
  const concept = findSection(siteSections, "concept");
  const buildBowl = findSection(siteSections, "build-a-bowl");
  const shops = findSection(siteSections, "shops");
  const footer = findSection(siteSections, "footer");
  const heroSubtitle = t(hero?.subtitle || "出来立て麻辣湯");
  const heroTitle = t(hero?.title || "まぁ麻");
  const useHeroWordmark = language === "ja";

  return (
    <main className="homePage">
      <SiteHeader />

      <section id="top" className="hero" aria-labelledby="heroTitle">
        <div className="heroContent">
          {useHeroWordmark ? (
            <div className="heroBrandLockup">
              <Image
                className="heroWordmark"
                src="/images/maamaa-hero-wordmark.png"
                alt=""
                width={1180}
                height={470}
                priority
                sizes="(max-width: 920px) 78vw, 430px"
              />
              <h1 id="heroTitle" className="visuallyHidden">{`${heroSubtitle} ${heroTitle}`}</h1>
            </div>
          ) : (
            <>
              <p className="kicker">{heroSubtitle}</p>
              <h1 id="heroTitle" className="heroTitle">{heroTitle}</h1>
            </>
          )}
          <p className="heroLead">
            {t(
              hero?.body || "まぁ麻は、具材、麺、辛さ、しびれを自分好みに選べる麻辣湯専門店です。ご注文ごとに鍋を分け、スープと具材を一杯ずつ合わせて仕上げます。店舗ごとの受付状況に合わせて、店頭受け取り、店内飲食、デリバリーでお楽しみいただけます。",
            )}
          </p>
          <div className="heroActions">
            <a className="button primary" href={localizedPath(language, hero?.actionUrl || "/stores/shimizu/menu")}>
              {t(hero?.actionLabel || "メニューを見る")}
            </a>
          </div>
        </div>
        <div className="heroVisual" aria-hidden="true">
          <Image
            className="heroImage"
            src="/images/maamaa-hero-bowl-2026.jpg"
            alt={hero?.imageAlt || ""}
            width={1930}
            height={2304}
            priority
            sizes="(max-width: 920px) 90vw, 46vw"
          />
        </div>
        <a className="heroScrollCue" href="#concept" aria-label="Scroll to concept">
          <span>scroll</span>
        </a>
      </section>

      <section id="concept" className="section split">
        <div>
          <p className="kicker">{concept?.subtitle || "Brand concept"}</p>
          <h2>{t(concept?.title || "一杯ごとに、鍋を分けて仕上げる。")}</h2>
        </div>
        <div className="copyStack">
          <div className="editorialVisual conceptVisual" aria-hidden="true" />
          <p>
            {t(
              concept?.body || "ご注文ごとに鍋を分け、選んだ具材とスープを一杯ずつ合わせます。辛さ、しびれ、具材の組み合わせをその一杯に合わせて整え、香りと温度感のある麻辣湯としてお渡しします。",
            )}
          </p>
        </div>
      </section>

      <section className="section bowlSection" aria-labelledby="bowlTitle">
        <div className="sectionIntro">
          <p className="kicker">{buildBowl?.subtitle || "Build a bowl"}</p>
          <h2 id="bowlTitle">{t(buildBowl?.title || "選べる自由と、一杯ごとの仕上げ。")}</h2>
        </div>
        <div className="bowlGrid">
          {bowls.map(([title, body]) => (
            <article className="bowlCard" key={title}>
              <span>{t(title)}</span>
              <div className="editorialVisual bowlVisual" aria-hidden="true" />
              <p>{t(body)}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="stores" className="section storeIntroSection" aria-labelledby="storesTitle">
        <div className="sectionIntro">
          <p className="kicker">{shops?.subtitle || "Shop information"}</p>
          <h2 id="storesTitle">{t(shops?.title || "店舗ごとの楽しみ方を。")}</h2>
        </div>
        <div className="storeIntroGrid">
          {stores.map((item, index) => {
            const isPickupStore = index === 0;
            const title = isPickupStore ? storeDisplayName : t(item.title);
            return (
            <article className="storeIntroItem" key={item.title}>
              <p className="pill">{t(item.label)}</p>
              <div className="editorialVisual storeVisual" aria-hidden="true" />
              <h3>{title}</h3>
              {item.address ? <p className="storeAddress">{t(item.address)}</p> : null}
              <p className="storeCopy">{t(item.body)}</p>
              {isPickupStore ? (
                <a className="textLink" href={localizedPath(language, "/stores/shimizu/menu")}>
                  {formatStoreNameTemplate(t("{storeName}の受け取り予約"), storeDisplayName)}
                </a>
              ) : null}
            </article>
          );})}
        </div>
      </section>

      <footer id="contact" className="footer">
        <div>
          <p className="footerLogo">{footer?.title || "まぁ麻"}</p>
          <p>{t(footer?.body || "鍋を分けて一杯ずつ仕上げる、出来立て麻辣湯の専門店。")}</p>
          <div className="footerLegalLinks">
            <a className="footerLegalLink" href={localizedPath(language, "/stores/shimizu/legal/tokusho")}>
              {t("特定商取引法に基づく表記")}
            </a>
            <a className="footerLegalLink" href={localizedPath(language, "/stores/shimizu/legal/terms")}>
              {t("利用規約")}
            </a>
            <a className="footerLegalLink" href={localizedPath(language, "/stores/shimizu/legal/privacy")}>
              {t("プライバシーポリシー")}
            </a>
          </div>
        </div>
        <a className="button footerButton" href={footer?.actionUrl || "mailto:hello@maamaa.example"}>
          {footer?.actionLabel || "Contact"}
        </a>
      </footer>
    </main>
  );
}
