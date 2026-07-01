import { ClientLocaleRedirect } from "@/components/client-locale-redirect";
import { LocalizedShell } from "@/components/localized-shell";
import { resolveMenuStoreDisplayName } from "@/components/store-display-name";
import { TokushoPageContent } from "@/components/tokusho-page-content";
import { languageAlternates } from "@/data/locales";
import { getMenuData } from "@/server/menu-source";

const shimizuTokushoPath = "/stores/shimizu/legal/tokusho";

export async function generateMetadata() {
  const storeDisplayName = resolveMenuStoreDisplayName(await getMenuData("shimizu"));
  return {
    title: `特定商取引法に基づく表記 | ${storeDisplayName}`,
    description: `${storeDisplayName}の店頭受け取り予約に関する特定商取引法に基づく表記です。`,
    alternates: {
      canonical: shimizuTokushoPath,
      languages: languageAlternates(shimizuTokushoPath),
    },
  };
}

export default async function ShimizuTokushoPage() {
  const storeDisplayName = resolveMenuStoreDisplayName(await getMenuData("shimizu"));

  return (
    <LocalizedShell language="ja">
      <ClientLocaleRedirect path={shimizuTokushoPath} />
      <TokushoPageContent storeDisplayName={storeDisplayName} />
    </LocalizedShell>
  );
}
