"use client";

import Image from "next/image";
import { useI18n } from "@/components/i18n-provider";
import { localizedPath } from "@/components/localized-path";
import { SiteHeader } from "@/components/site-header";

const stores = [
  {
    label: "1st store",
    title: "まぁ麻 テイクアウト店",
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

export function HomeContent() {
  const { language, t } = useI18n();

  return (
    <main>
      <SiteHeader />

      <section id="top" className="hero" aria-labelledby="heroTitle">
        <div className="heroContent">
          <p className="kicker">{t("出来立て麻辣湯")}</p>
          <h1 id="heroTitle" className="heroTitle">まぁ麻</h1>
          <p className="heroLead">
            {t(
              "ご注文を受けてから、一杯ずつ仕上げる麻辣湯。まぁ麻は、熱さ、香り、具材の食感まで、出来立てのおいしさを届けます。",
            )}
          </p>
          <div className="heroActions">
            <a className="button primary" href={localizedPath(language, "/menu")}>
              {t("メニューを見る")}
            </a>
          </div>
        </div>
        <div className="heroVisual" aria-hidden="true">
          <Image
            className="heroImage"
            src="/images/maamaa-hero-bowl.jpg"
            alt=""
            width={990}
            height={1152}
            priority
            sizes="(max-width: 920px) 90vw, 46vw"
          />
        </div>
      </section>

      <section id="concept" className="section split">
        <div>
          <p className="kicker">Brand concept</p>
          <h2>{t("作り置きではなく、注文ごとに仕上げる。")}</h2>
        </div>
        <div className="copyStack">
          <p>
            {t(
              "まぁ麻の麻辣湯は、大きな鍋でまとめて煮込むスタイルではありません。注文を受けてから具材とスープを合わせ、一杯ずつ出来立てでお渡しします。",
            )}
          </p>
          <p>
            {t(
              "目指すのは、強い装飾に頼らない、日常に寄り添う麻辣湯ブランド。デリバリーからピックアップ、そしてイートインへ、体験を段階的に広げていきます。",
            )}
          </p>
        </div>
      </section>

      <section className="section bowlSection" aria-labelledby="bowlTitle">
        <div className="sectionIntro">
          <p className="kicker">Build a bowl</p>
          <h2 id="bowlTitle">{t("選べる楽しさと、出来立ての安心感。")}</h2>
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
          <p className="kicker">Shop information</p>
          <h2 id="storesTitle">{t("出来立てを受け取る店から、店内で味わう店へ。")}</h2>
        </div>
        <div className="storeIntroGrid">
          {stores.map((item) => (
            <article className="storeIntroItem" key={item.title}>
              <p className="pill">{t(item.label)}</p>
              <h3>{t(item.title)}</h3>
              <p>{t(item.body)}</p>
            </article>
          ))}
        </div>
      </section>

      <footer id="contact" className="footer">
        <div>
          <p className="footerLogo">まぁ麻</p>
          <p>{t("出来立て麻辣湯 for delivery, pickup, and dine-in.")}</p>
        </div>
        <a className="button footerButton" href="mailto:hello@maamaa.example">
          Contact
        </a>
      </footer>
    </main>
  );
}
