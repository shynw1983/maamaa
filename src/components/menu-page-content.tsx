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
  const hero = findSection(siteSections, "menu-hero");
  const reservationSummary = findSection(siteSections, "reservation-summary");

  return (
    <main>
      <SiteHeader menu />

      <section className="menuPageHero">
        <p className="kicker">{hero?.subtitle ? t(hero.subtitle) : formatStoreNameTemplate(t("{storeName} / pickup reservation"), storeDisplayName)}</p>
        <h1>{hero?.title ? t(hero.title) : formatStoreNameTemplate(t("{storeName}の出来立て麻辣湯を、自由にカスタム。"), storeDisplayName)}</h1>
        <p>
          {hero?.body
            ? t(hero.body)
            : formatStoreNameTemplate(
                t("{storeName}の店頭受け取り用カスタムメニューを作成できます。辛さ、痺れ、麺、トッピングを選んで、受け取り時間を指定してください。"),
                storeDisplayName,
              )}
        </p>
      </section>

      <MalatangOrderBuilder initialMenu={initialMenu} siteContent={{ reservationSummary }} />
    </main>
  );
}
