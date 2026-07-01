import { ClientLocaleRedirect } from "@/components/client-locale-redirect";
import { LegalDocumentPage } from "@/components/legal-document-page";
import { LocalizedShell } from "@/components/localized-shell";
import { resolveMenuStoreDisplayName } from "@/components/store-display-name";
import { languageAlternates } from "@/data/locales";
import { privacySections } from "@/data/shimizu-legal";
import { getMenuData } from "@/server/menu-source";

const shimizuPrivacyPath = "/stores/shimizu/legal/privacy";

export async function generateMetadata() {
  const storeDisplayName = resolveMenuStoreDisplayName(await getMenuData("shimizu"));
  return {
    title: `プライバシーポリシー | ${storeDisplayName}`,
    description: `${storeDisplayName}の店頭受け取り予約サービスに関するプライバシーポリシーです。`,
    alternates: {
      canonical: shimizuPrivacyPath,
      languages: languageAlternates(shimizuPrivacyPath),
    },
  };
}

export default async function ShimizuPrivacyPage() {
  const storeDisplayName = resolveMenuStoreDisplayName(await getMenuData("shimizu"));

  return (
    <LocalizedShell language="ja">
      <ClientLocaleRedirect path={shimizuPrivacyPath} />
      <LegalDocumentPage
        title="プライバシーポリシー"
        lead="まぁ麻 清水店の店頭受け取り予約サービスにおける個人情報の取扱いについて定めたものです。"
        sections={privacySections}
        storeDisplayName={storeDisplayName}
      />
    </LocalizedShell>
  );
}
