import { notFound } from "next/navigation";
import { LocalizedShell } from "@/components/localized-shell";
import { TokushoPageContent } from "@/components/tokusho-page-content";
import { isLocale, languageAlternates, translatedLocales, withLocalePath } from "@/data/locales";

const shimizuTokushoPath = "/stores/shimizu/legal/tokusho";

export function generateStaticParams() {
  return translatedLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") return {};

  return {
    title: "Legal notice | Maama Shimizu Shop",
    description: "Legal notice for pickup reservations at Maama Shimizu Shop.",
    alternates: {
      canonical: withLocalePath(lang, shimizuTokushoPath),
      languages: languageAlternates(shimizuTokushoPath),
    },
  };
}

export default async function LocalizedShimizuTokushoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") notFound();

  return (
    <LocalizedShell language={lang}>
      <TokushoPageContent />
    </LocalizedShell>
  );
}
