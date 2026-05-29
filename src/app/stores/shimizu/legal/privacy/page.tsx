import { ClientLocaleRedirect } from "@/components/client-locale-redirect";
import { LegalDocumentPage } from "@/components/legal-document-page";
import { LocalizedShell } from "@/components/localized-shell";
import { languageAlternates } from "@/data/locales";
import { privacySections } from "@/data/shimizu-legal";

const shimizuPrivacyPath = "/stores/shimizu/legal/privacy";

export const metadata = {
  title: "プライバシーポリシー | まぁ麻 清水店",
  description: "まぁ麻 清水店の店頭受け取り予約サービスに関するプライバシーポリシーです。",
  alternates: {
    canonical: shimizuPrivacyPath,
    languages: languageAlternates(shimizuPrivacyPath),
  },
};

export default function ShimizuPrivacyPage() {
  return (
    <LocalizedShell language="ja">
      <ClientLocaleRedirect path={shimizuPrivacyPath} />
      <LegalDocumentPage
        title="プライバシーポリシー"
        lead="まぁ麻 清水店の店頭受け取り予約サービスにおける個人情報の取扱いについて定めたものです。"
        sections={privacySections}
      />
    </LocalizedShell>
  );
}
