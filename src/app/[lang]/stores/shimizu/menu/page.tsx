import { notFound } from "next/navigation";
import { LocalizedShell } from "@/components/localized-shell";
import { MenuPageContent } from "@/components/menu-page-content";
import { isLocale, languageAlternates, translatedLocales, withLocalePath } from "@/data/locales";

const shimizuMenuPath = "/stores/shimizu/menu";

export function generateStaticParams() {
  return translatedLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") return {};

  return {
    title: "Shimizu shop menu / Pickup reservation | まぁ麻",
    description: "Customize Maama Shimizu shop's freshly made malatang and create a pickup reservation.",
    alternates: {
      canonical: withLocalePath(lang, shimizuMenuPath),
      languages: languageAlternates(shimizuMenuPath),
    },
  };
}

export default async function LocalizedShimizuMenuPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") notFound();

  return (
    <LocalizedShell language={lang}>
      <MenuPageContent />
    </LocalizedShell>
  );
}
