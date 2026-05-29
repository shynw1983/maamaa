import { ClientLocaleRedirect } from "@/components/client-locale-redirect";
import { LegalDocumentPage } from "@/components/legal-document-page";
import { LocalizedShell } from "@/components/localized-shell";
import { languageAlternates } from "@/data/locales";
import { termsSections } from "@/data/shimizu-legal";

const shimizuTermsPath = "/stores/shimizu/legal/terms";

export const metadata = {
  title: "利用規約 | まぁ麻 清水店",
  description: "まぁ麻 清水店の店頭受け取り予約サービスに関する利用規約です。",
  alternates: {
    canonical: shimizuTermsPath,
    languages: languageAlternates(shimizuTermsPath),
  },
};

export default function ShimizuTermsPage() {
  return (
    <LocalizedShell language="ja">
      <ClientLocaleRedirect path={shimizuTermsPath} />
      <LegalDocumentPage
        title="利用規約"
        lead="まぁ麻 清水店の店頭受け取り予約サービスをご利用いただく際の条件を定めたものです。"
        sections={termsSections}
      />
    </LocalizedShell>
  );
}
