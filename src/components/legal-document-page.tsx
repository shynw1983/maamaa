"use client";

import { useI18n } from "@/components/i18n-provider";
import { localizedPath } from "@/components/localized-path";
import { SiteHeader } from "@/components/site-header";

export type LegalSection = {
  title: string;
  body: string[];
};

export function LegalDocumentPage({
  title,
  lead,
  sections,
}: {
  title: string;
  lead: string;
  sections: LegalSection[];
}) {
  const { language, t } = useI18n();

  return (
    <main>
      <SiteHeader menu />

      <section className="legalHero">
        <p className="kicker">{t("Maama Shimizu Shop")}</p>
        <h1>{t(title)}</h1>
        <p>{t(lead)}</p>
      </section>

      <section className="legalSection" aria-label={t(title)}>
        <div className="legalDocument">
          {sections.map((section) => (
            <section className="legalDocumentSection" key={section.title}>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
        <div className="legalLinks">
          <a className="textLink" href={localizedPath(language, "/stores/shimizu/legal/tokusho")}>
            {t("特定商取引法に基づく表記")}
          </a>
          <a className="textLink" href={localizedPath(language, "/stores/shimizu/menu")}>
            {t("清水店の受け取り予約へ戻る")}
          </a>
        </div>
      </section>
    </main>
  );
}
