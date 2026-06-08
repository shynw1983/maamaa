"use client";

import { useI18n } from "@/components/i18n-provider";
import { MalatangOrderBuilder, type MalatangMenu } from "@/components/malatang-order-builder";
import { SiteHeader } from "@/components/site-header";
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
  const hero = findSection(siteSections, "menu-hero");
  const reservationSummary = findSection(siteSections, "reservation-summary");

  return (
    <main>
      <SiteHeader menu />

      <section className="menuPageHero">
        <p className="kicker">{t(hero?.subtitle || "Shimizu shop / pickup reservation")}</p>
        <h1>{t(hero?.title || "清水店の出来立て麻辣湯を、自由にカスタム。")}</h1>
        <p>
          {t(
            hero?.body || "まぁ麻 清水店の店頭受け取り用カスタムメニューを作成できます。辛さ、痺れ、麺、トッピングを選んで、受け取り時間を指定してください。",
          )}
        </p>
      </section>

      <MalatangOrderBuilder initialMenu={initialMenu} siteContent={{ reservationSummary }} />
    </main>
  );
}
