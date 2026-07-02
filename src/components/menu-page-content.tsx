"use client";

import { useI18n } from "@/components/i18n-provider";
import { MalatangOrderBuilder, type MalatangMenu } from "@/components/malatang-order-builder";
import { SiteHeader } from "@/components/site-header";
import { formatStoreNameTemplate, resolveMenuStoreDisplayName } from "@/components/store-display-name";
import type { BrandSiteSection } from "@/server/brand-site-source";

const findSection = (sections: BrandSiteSection[], key: string) =>
  sections.find((section) => section.sectionKey === key);

export function MenuPageContent({
  initialMenu,
  siteSections = [],
}: {
  initialMenu: MalatangMenu;
  siteSections?: BrandSiteSection[];
}) {
  const { t } = useI18n();
  const storeDisplayName = resolveMenuStoreDisplayName(initialMenu);
  const reservationSummary = findSection(siteSections, "reservation-summary");

  return (
    <main>
      <SiteHeader menu />

      <section className="menuPageHero">
        <p className="kicker">{formatStoreNameTemplate(t("{storeName} / Web予約"), storeDisplayName)}</p>
        <h1>{t("一杯ずつ、鍋を分けて仕上げる麻辣湯。")}</h1>
        <p>
          {formatStoreNameTemplate(
            t("{storeName}では、辛さ、痺れ、麺、具材を選んで、ご注文ごとに鍋を分けて仕上げる一杯をご予約いただけます。受付時間と受け取り方法は店舗の営業状況により異なります。"),
            storeDisplayName,
          )}
        </p>
      </section>

      <MalatangOrderBuilder initialMenu={initialMenu} siteContent={{ reservationSummary }} />
    </main>
  );
}
