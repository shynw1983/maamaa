import { notFound } from "next/navigation";
import { LegalDocumentPage } from "@/components/legal-document-page";
import { LocalizedShell } from "@/components/localized-shell";
import { resolveMenuStoreDisplayName } from "@/components/store-display-name";
import { isLocale, languageAlternates, translatedLocales, withLocalePath } from "@/data/locales";
import { privacySections } from "@/data/shimizu-legal";
import { getMenuData } from "@/server/menu-source";

const shimizuPrivacyPath = "/stores/shimizu/legal/privacy";

export function generateStaticParams() {
  return translatedLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") return {};
  const storeDisplayName = resolveMenuStoreDisplayName(await getMenuData("shimizu"));

  return {
    title: `Privacy Policy | ${storeDisplayName}`,
    description: `Privacy policy for pickup reservations at ${storeDisplayName}.`,
    alternates: {
      canonical: withLocalePath(lang, shimizuPrivacyPath),
      languages: languageAlternates(shimizuPrivacyPath),
    },
  };
}

export default async function LocalizedShimizuPrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") notFound();
  const storeDisplayName = resolveMenuStoreDisplayName(await getMenuData("shimizu"));

  return (
    <LocalizedShell language={lang}>
      <LegalDocumentPage
        title="プライバシーポリシー"
        lead="まぁ麻 清水店の店頭受け取り予約サービスにおける個人情報の取扱いについて定めたものです。"
        sections={privacySections}
        storeDisplayName={storeDisplayName}
      />
    </LocalizedShell>
  );
}
