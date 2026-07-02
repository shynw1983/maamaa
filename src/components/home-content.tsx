"use client";

import Image from "next/image";
import { useI18n } from "@/components/i18n-provider";
import { localizedPath } from "@/components/localized-path";
import { SiteHeader } from "@/components/site-header";
import { formatStoreNameTemplate, resolveMenuStoreDisplayName, type StoreDisplayMenu } from "@/components/store-display-name";
import type { BrandSiteSection } from "@/server/brand-site-source";

type StorePreview = {
  label: string;
  title: string;
  address?: string;
  body: string;
  actionLabel?: string;
  actionUrl?: string;
};

const stores: StorePreview[] = [
  {
    label: "受付中",
    title: "pickup-store",
    address: "福岡市南区清水 1-2-8-103",
    body: "Web予約、デリバリー、テイクアウトを受付状況に合わせてご利用いただけます。気軽な一食にも、しっかり食べたい日にも。",
    actionLabel: "{storeName}の受け取り予約",
    actionUrl: "/stores/shimizu/menu",
  },
  {
    label: "Eat in",
    title: "桜並木店",
    body: "店内でも、好きな具材を選ぶ楽しさと出来立ての香りをそのままに。ゆっくり味わえるまぁ麻を広げていきます。",
  },
  {
    label: "Next",
    title: "次の街にも、まぁ麻を。",
    body: "新しい店舗情報は、公開準備が整い次第お知らせします。トップページでは代表的な受付店舗を中心にご案内します。",
  },
];

const bowls = [
  {
    title: "Cook",
    body: "一杯ずつ鍋を分けて、スープの香りと具材の食感を引き出します。",
    imageSrc: "/images/maamaa-cook-commercial-range.png",
    imageAlt: "商用厨房のガスレンジで一杯ずつ仕上げる麻辣湯",
  },
  {
    title: "Select",
    body: "野菜、きのこ、肉、海鮮、麺まで。その日の気分で自由に選べます。",
    imageSrc: "/images/maamaa-select-ingredients.png",
    imageAlt: "麻辣湯に選べる野菜、きのこ、海鮮、麺の具材",
  },
  {
    title: "Balance",
    body: "辛さ、しびれ、香りを重ねて、自分にちょうどいい一杯へ。",
    imageSrc: "/images/maamaa-balance-chili-oil-swirl.png",
    imageAlt: "麻辣湯のスープに広がる赤い辣油と香りのバランス",
  },
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

  return (
    <main className="homePage">
      <SiteHeader />

      <section id="top" className="hero" aria-labelledby="heroTitle">
        <div className="heroContent">
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
          <p className="heroLead">
            {t(
              hero?.body || "その日の気分に合わせて、具材も、辛さも、しびれも自由に。まぁ麻は、選ぶ楽しさと出来立ての香りを大切にする麻辣湯専門店です。一杯ずつ鍋を分けて仕上げる、熱々の一杯をお楽しみください。",
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
          <h2>{t(concept?.title || "選ぶたのしさを、出来立てで。")}</h2>
        </div>
        <div className="copyStack">
          <div className="conceptImageFrame">
            <Image
              className="conceptImage"
              src="/images/maamaa-concept-choice-to-bowl.png"
              alt={t("好きな具材を選んで出来立ての一杯に仕上げる麻辣湯")}
              fill
              sizes="(max-width: 920px) 88vw, 42vw"
            />
          </div>
          <p>
            {t(
              concept?.body || "野菜、きのこ、肉、海鮮、麺。好きな具材を選んだら、辛さとしびれを好みに合わせて。一杯ずつ鍋を分け、スープの香りと具材の食感が立つ麻辣湯に仕上げます。",
            )}
          </p>
        </div>
      </section>

      <section className="section bowlSection" aria-labelledby="bowlTitle">
        <div className="sectionIntro">
          <p className="kicker">{buildBowl?.subtitle || "Build a bowl"}</p>
          <h2 id="bowlTitle">{t(buildBowl?.title || "一杯の中に、好きなものを少しずつ。")}</h2>
        </div>
        <div className="bowlGrid">
          {bowls.map((item) => (
            <article className="bowlCard" key={item.title}>
              <span>{t(item.title)}</span>
              {item.imageSrc ? (
                <div className="bowlImageFrame">
                  <Image
                    className="bowlImage"
                    src={item.imageSrc}
                    alt={t(item.imageAlt || "")}
                    fill
                    sizes="(max-width: 920px) 88vw, 28vw"
                  />
                </div>
              ) : (
                <div className="editorialVisual bowlVisual" aria-hidden="true" />
              )}
              <p>{t(item.body)}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="stores" className="section storeIntroSection" aria-labelledby="storesTitle">
        <div className="sectionIntro">
          <p className="kicker">{shops?.subtitle || "Shop information"}</p>
          <h2 id="storesTitle">{t(shops?.title || "お近くのまぁ麻へ。")}</h2>
          <p>{t(shops?.body || "Web予約、デリバリー、店内飲食は、店舗ごとの受付状況に合わせてご利用いただけます。")}</p>
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
                {item.actionUrl ? (
                  <a className="textLink" href={localizedPath(language, item.actionUrl)}>
                    {formatStoreNameTemplate(t(item.actionLabel || "店舗情報を見る"), storeDisplayName)}
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <footer id="contact" className="footer">
        <div>
          <p className="footerLogo">{footer?.title || "まぁ麻"}</p>
          <p>{t(footer?.body || "選ぶ楽しさと出来立ての香りを届ける、麻辣湯専門店。")}</p>
          <p className="footerAffiliation">A Foundr1 Brand</p>
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
