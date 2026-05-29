import { notFound } from "next/navigation";
import { LegalDocumentPage } from "@/components/legal-document-page";
import { LocalizedShell } from "@/components/localized-shell";
import { isLocale, languageAlternates, translatedLocales, withLocalePath } from "@/data/locales";
import { termsSections } from "@/data/shimizu-legal";

const shimizuTermsPath = "/stores/shimizu/legal/terms";

export function generateStaticParams() {
  return translatedLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") return {};

  return {
    title: "Terms of Service | Maama Shimizu Shop",
    description: "Terms of service for pickup reservations at Maama Shimizu Shop.",
    alternates: {
      canonical: withLocalePath(lang, shimizuTermsPath),
      languages: languageAlternates(shimizuTermsPath),
    },
  };
}

export default async function LocalizedShimizuTermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") notFound();

  return (
    <LocalizedShell language={lang}>
      <LegalDocumentPage
        title="利用規約"
        lead="まぁ麻 清水店の店頭受け取り予約サービスをご利用いただく際の条件を定めたものです。"
        sections={termsSections}
      />
    </LocalizedShell>
  );
}
