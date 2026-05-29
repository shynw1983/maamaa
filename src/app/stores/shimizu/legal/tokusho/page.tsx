import { ClientLocaleRedirect } from "@/components/client-locale-redirect";
import { LocalizedShell } from "@/components/localized-shell";
import { TokushoPageContent } from "@/components/tokusho-page-content";
import { languageAlternates } from "@/data/locales";

const shimizuTokushoPath = "/stores/shimizu/legal/tokusho";

export const metadata = {
  title: "特定商取引法に基づく表記 | まぁ麻 清水店",
  description: "まぁ麻 清水店の店頭受け取り予約に関する特定商取引法に基づく表記です。",
  alternates: {
    canonical: shimizuTokushoPath,
    languages: languageAlternates(shimizuTokushoPath),
  },
};

export default function ShimizuTokushoPage() {
  return (
    <LocalizedShell language="ja">
      <ClientLocaleRedirect path={shimizuTokushoPath} />
      <TokushoPageContent />
    </LocalizedShell>
  );
}
