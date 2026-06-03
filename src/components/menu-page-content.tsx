"use client";

import { useI18n } from "@/components/i18n-provider";
import { MalatangOrderBuilder, type MalatangMenu } from "@/components/malatang-order-builder";
import { SiteHeader } from "@/components/site-header";

export function MenuPageContent({ initialMenu }: { initialMenu: MalatangMenu }) {
  const { t } = useI18n();

  return (
    <main>
      <SiteHeader menu />

      <section className="menuPageHero">
        <p className="kicker">{t("Shimizu shop / pickup reservation")}</p>
        <h1>{t("清水店の出来立て麻辣湯を、自由にカスタム。")}</h1>
        <p>
          {t(
            "まぁ麻 清水店の店頭受け取り用カスタムメニューを作成できます。辛さ、痺れ、麺、トッピングを選んで、受け取り時間を指定してください。",
          )}
        </p>
      </section>

      <MalatangOrderBuilder initialMenu={initialMenu} />
    </main>
  );
}
