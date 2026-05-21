import { notFound } from "next/navigation";
import { HomeContent } from "@/components/home-content";
import { LocalizedShell } from "@/components/localized-shell";
import { isLocale, languageAlternates, translatedLocales, withLocalePath } from "@/data/locales";

export function generateStaticParams() {
  return translatedLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") return {};

  return {
    alternates: {
      canonical: withLocalePath(lang, "/"),
      languages: languageAlternates("/"),
    },
  };
}

export default async function LocalizedHomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") notFound();

  return (
    <LocalizedShell language={lang}>
      <HomeContent />
    </LocalizedShell>
  );
}
