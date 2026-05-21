"use client";

import { useI18n } from "@/components/i18n-provider";
import { MalatangOrderBuilder } from "@/components/malatang-order-builder";
import { SiteHeader } from "@/components/site-header";

export function MenuPageContent() {
  const { t } = useI18n();

  return (
    <main>
      <SiteHeader menu />

      <section className="menuPageHero">
        <p className="kicker">{t("Menu / pickup reservation")}</p>
        <h1>{t("出来立て麻辣湯を、自由にカスタム。")}</h1>
        <p>
          {t(
            "Uber Eats のメニュー構成をもとに、店頭受け取り用のカスタムメニューを作成できます。辛さ、痺れ、麺、トッピングを選んで、受け取り時間を指定してください。",
          )}
        </p>
      </section>

      <MalatangOrderBuilder />
    </main>
  );
}
