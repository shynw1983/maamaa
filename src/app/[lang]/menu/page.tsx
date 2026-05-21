import { notFound } from "next/navigation";
import { LocalizedShell } from "@/components/localized-shell";
import { MenuPageContent } from "@/components/menu-page-content";
import { isLocale, languageAlternates, translatedLocales, withLocalePath } from "@/data/locales";

export function generateStaticParams() {
  return translatedLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") return {};

  return {
    title: "Menu / Pickup reservation | まぁ麻",
    description: "Customize Maama's freshly made malatang and create a pickup reservation.",
    alternates: {
      canonical: withLocalePath(lang, "/menu"),
      languages: languageAlternates("/menu"),
    },
  };
}

export default async function LocalizedMenuPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") notFound();

  return (
    <LocalizedShell language={lang}>
      <MenuPageContent />
    </LocalizedShell>
  );
}
