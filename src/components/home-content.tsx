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
    body: "現在営業中の店舗です。Uber Eats などのデリバリーとテイクアウトに対応し、ご注文を受けてから一杯ずつ出来立てで仕上げます。",
  },
  {
    label: "2nd store",
    title: "まぁ麻 イートイン店",
    body: "次に準備している追加店舗です。店内でも出来立ての麻辣湯を楽しめる、イートイン対応の店舗として計画しています。",
  },
];

const bowls = [
  ["Made fresh", "注文を受けてから一杯ずつ調理。作り置きではない、出来立ての温度感。"],
  ["Select", "野菜、きのこ、豆腐、ミートボール、春雨、麺を気分に合わせて。"],
  ["Balance", "辛さ、しびれ、香酢、トッピングを自分らしく調整。"],
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

  return (
    <main>
      <SiteHeader />

      <section id="top" className="hero" aria-labelledby="heroTitle">
        <div className="heroContent">
          <p className="kicker">{t(hero?.subtitle || "出来立て麻辣湯")}</p>
          <h1 id="heroTitle" className="heroTitle">{hero?.title || "まぁ麻"}</h1>
          <p className="heroLead">
            {t(
              hero?.body || "ご注文を受けてから、一杯ずつ仕上げる麻辣湯。まぁ麻は、熱さ、香り、具材の食感まで、出来立てのおいしさを届けます。",
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
            src={hero?.imageUrl || "/images/maamaa-hero-bowl.jpg"}
            alt={hero?.imageAlt || ""}
            width={990}
            height={1152}
            priority
            sizes="(max-width: 920px) 90vw, 46vw"
          />
        </div>
      </section>

      <section id="concept" className="section split">
        <div>
          <p className="kicker">{concept?.subtitle || "Brand concept"}</p>
          <h2>{t(concept?.title || "作り置きではなく、注文ごとに仕上げる。")}</h2>
        </div>
        <div className="copyStack">
          <p>
            {t(
              concept?.body || "まぁ麻の麻辣湯は、大きな鍋でまとめて煮込むスタイルではありません。注文を受けてから具材とスープを合わせ、一杯ずつ出来立てでお渡しします。",
            )}
          </p>
        </div>
      </section>

      <section className="section bowlSection" aria-labelledby="bowlTitle">
        <div className="sectionIntro">
          <p className="kicker">{buildBowl?.subtitle || "Build a bowl"}</p>
          <h2 id="bowlTitle">{t(buildBowl?.title || "選べる楽しさと、出来立ての安心感。")}</h2>
        </div>
        <div className="bowlGrid">
          {bowls.map(([title, body]) => (
            <article className="bowlCard" key={title}>
              <span>{t(title)}</span>
              <p>{t(body)}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="stores" className="section storeIntroSection" aria-labelledby="storesTitle">
        <div className="sectionIntro">
          <p className="kicker">{shops?.subtitle || "Shop information"}</p>
          <h2 id="storesTitle">{t(shops?.title || "出来立てを受け取る店から、店内で味わう店へ。")}</h2>
        </div>
        <div className="storeIntroGrid">
          {stores.map((item, index) => {
            const isPickupStore = index === 0;
            const title = isPickupStore ? storeDisplayName : t(item.title);
            return (
            <article className="storeIntroItem" key={item.title}>
              <p className="pill">{t(item.label)}</p>
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
          <p>{t(footer?.body || "出来立て麻辣湯 for delivery, pickup, and dine-in.")}</p>
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
