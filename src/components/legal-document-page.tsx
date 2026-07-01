"use client";

import { useI18n } from "@/components/i18n-provider";
import { localizedPath } from "@/components/localized-path";
import { SiteHeader } from "@/components/site-header";
import { formatStoreNameTemplate } from "@/components/store-display-name";

export type LegalSection = {
  title: string;
  body: string[];
};

export function LegalDocumentPage({
  title,
  lead,
  sections,
  storeDisplayName = "まぁ麻",
}: {
  title: string;
  lead: string;
  sections: LegalSection[];
  storeDisplayName?: string;
}) {
  const { language, t } = useI18n();

  return (
    <main>
      <SiteHeader menu />

      <section className="legalHero">
        <p className="kicker">{storeDisplayName}</p>
        <h1>{t(title)}</h1>
        <p>{formatStoreNameTemplate(t(lead.replace("まぁ麻 清水店", "{storeName}")), storeDisplayName)}</p>
      </section>

      <section className="legalSection" aria-label={t(title)}>
        <div className="legalDocument">
          {sections.map((section) => (
            <section className="legalDocumentSection" key={section.title}>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph.replaceAll("まぁ麻 清水店", storeDisplayName)}</p>
              ))}
            </section>
          ))}
        </div>
        <div className="legalLinks">
          <a className="textLink" href={localizedPath(language, "/stores/shimizu/legal/tokusho")}>
            {t("特定商取引法に基づく表記")}
          </a>
          <a className="textLink" href={localizedPath(language, "/stores/shimizu/menu")}>
            {formatStoreNameTemplate(t("{storeName}の受け取り予約へ戻る"), storeDisplayName)}
          </a>
        </div>
      </section>
    </main>
  );
}
