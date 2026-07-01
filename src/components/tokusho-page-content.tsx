"use client";

import { useI18n } from "@/components/i18n-provider";
import { localizedPath } from "@/components/localized-path";
import { SiteHeader } from "@/components/site-header";
import { formatStoreNameTemplate } from "@/components/store-display-name";

const legalRows = [
  ["販売事業者", "ジェー・プラス合同会社"],
  ["運営責任者", "砥上 浩幸"],
  ["所在地", "〒815-0031\n福岡県福岡市南区清水 1-2-8 ディーヴァ清水 103号室"],
  ["対象店舗", "まぁ麻 清水店"],
  ["電話番号", "070-6597-1717"],
  ["受付時間", "営業時間内\n原則 12:00〜翌5:00\n不定休・営業時間が変更となる場合があります。"],
  ["メールアドレス", "info@jskitchen.jp"],
  [
    "販売価格",
    "各商品ページまたは注文確認画面に表示された金額とします。\n表示価格は税込です。",
  ],
  [
    "商品代金以外の必要料金",
    "店頭受け取りの場合、原則として追加料金は発生しません。\nただし、決済手段により手数料が発生する場合は、注文確認画面に表示します。",
  ],
  ["最低注文金額", "1回のご注文につき、最低注文金額は税込1,000円とします。"],
  ["支払方法", "クレジットカード決済\nPayPay\nAlipay+\nWeChat Pay"],
  [
    "支払時期",
    "ご注文確定時にお支払いが確定します。\n決済方法により、実際の引き落とし時期は各決済事業者の定めによります。",
  ],
  [
    "商品の引渡時期",
    "ご注文時に指定された受け取り日時に、まぁ麻 清水店にて商品をお渡しします。\n混雑状況、食材の在庫状況、天候その他やむを得ない事情により、受け取り時間が前後する場合があります。",
  ],
  [
    "注文の変更・キャンセル",
    "ご注文確定後の変更・キャンセルは、原則として受け取り予定時刻の30分前までに店舗へご連絡ください。\n調理開始後または受け取り予定時刻の30分前を過ぎた場合のキャンセルはお受けできない場合があります。",
  ],
  [
    "返品・交換",
    "商品の性質上、お客様都合による返品・交換はお受けできません。\n商品に誤り、品質不良、破損等がある場合は、商品受け取り後すみやかに店舗までご連絡ください。状況を確認のうえ、交換または返金等の対応をいたします。",
  ],
  [
    "販売数量の制限",
    "商品により販売数量に制限がある場合があります。\nまた、食材の在庫状況によりご注文をお受けできない場合があります。",
  ],
  [
    "申込みの有効期限",
    "注文確認画面でご注文内容を確認し、注文確定操作を行った時点でお申込みとなります。\n受け取り日時を過ぎてもご来店がない場合、商品をお渡しできない場合があります。",
  ],
  [
    "サービス提供地域",
    "まぁ麻 清水店\n〒815-0031\n福岡県福岡市南区清水 1-2-8 ディーヴァ清水 103号室",
  ],
  ["配送について", "配送は行っておりません。店頭受け取りのみとなります。"],
] as const;

export function TokushoPageContent({ storeDisplayName = "まぁ麻" }: { storeDisplayName?: string }) {
  const { language, t } = useI18n();
  const rows = legalRows.map(([label, value]) => [label, value.replaceAll("まぁ麻 清水店", storeDisplayName)] as const);

  return (
    <main>
      <SiteHeader menu />

      <section className="legalHero">
        <p className="kicker">{storeDisplayName}</p>
        <h1>{t("特定商取引法に基づく表記")}</h1>
        <p>
          {formatStoreNameTemplate(t("{storeName}の店頭受け取り予約に関する表示事項です。ご注文前に内容をご確認ください。"), storeDisplayName)}
        </p>
      </section>

      <section className="legalSection" aria-label={t("特定商取引法に基づく表記")}>
        <dl className="legalList">
          {rows.map(([label, value]) => (
            <div className="legalRow" key={label}>
              <dt>{label}</dt>
              <dd>
                {value.split("\n").map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
        <div className="legalLinks">
          <a className="textLink" href={localizedPath(language, "/stores/shimizu/legal/terms")}>
            {t("利用規約")}
          </a>
          <a className="textLink" href={localizedPath(language, "/stores/shimizu/legal/privacy")}>
            {t("プライバシーポリシー")}
          </a>
          <a className="textLink" href={localizedPath(language, "/stores/shimizu/menu")}>
            {formatStoreNameTemplate(t("{storeName}の受け取り予約へ戻る"), storeDisplayName)}
          </a>
        </div>
      </section>
    </main>
  );
}
