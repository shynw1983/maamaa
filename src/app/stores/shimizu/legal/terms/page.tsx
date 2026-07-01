import { ClientLocaleRedirect } from "@/components/client-locale-redirect";
import { LegalDocumentPage } from "@/components/legal-document-page";
import { LocalizedShell } from "@/components/localized-shell";
import { resolveMenuStoreDisplayName } from "@/components/store-display-name";
import { languageAlternates } from "@/data/locales";
import { termsSections } from "@/data/shimizu-legal";
import { getMenuData } from "@/server/menu-source";

const shimizuTermsPath = "/stores/shimizu/legal/terms";

export async function generateMetadata() {
  const storeDisplayName = resolveMenuStoreDisplayName(await getMenuData("shimizu"));
  return {
    title: `利用規約 | ${storeDisplayName}`,
    description: `${storeDisplayName}の店頭受け取り予約サービスに関する利用規約です。`,
    alternates: {
      canonical: shimizuTermsPath,
      languages: languageAlternates(shimizuTermsPath),
    },
  };
}

export default async function ShimizuTermsPage() {
  const storeDisplayName = resolveMenuStoreDisplayName(await getMenuData("shimizu"));

  return (
    <LocalizedShell language="ja">
      <ClientLocaleRedirect path={shimizuTermsPath} />
      <LegalDocumentPage
        title="利用規約"
        lead="まぁ麻 清水店の店頭受け取り予約サービスをご利用いただく際の条件を定めたものです。"
        sections={termsSections}
        storeDisplayName={storeDisplayName}
      />
    </LocalizedShell>
  );
}
