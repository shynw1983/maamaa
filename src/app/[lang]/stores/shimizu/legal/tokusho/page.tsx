import { notFound } from "next/navigation";
import { LocalizedShell } from "@/components/localized-shell";
import { resolveMenuStoreDisplayName } from "@/components/store-display-name";
import { TokushoPageContent } from "@/components/tokusho-page-content";
import { isLocale, languageAlternates, translatedLocales, withLocalePath } from "@/data/locales";
import { getMenuData } from "@/server/menu-source";

const shimizuTokushoPath = "/stores/shimizu/legal/tokusho";

export function generateStaticParams() {
  return translatedLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") return {};
  const storeDisplayName = resolveMenuStoreDisplayName(await getMenuData("shimizu"));

  return {
    title: `Legal notice | ${storeDisplayName}`,
    description: `Legal notice for pickup reservations at ${storeDisplayName}.`,
    alternates: {
      canonical: withLocalePath(lang, shimizuTokushoPath),
      languages: languageAlternates(shimizuTokushoPath),
    },
  };
}

export default async function LocalizedShimizuTokushoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") notFound();
  const storeDisplayName = resolveMenuStoreDisplayName(await getMenuData("shimizu"));

  return (
    <LocalizedShell language={lang}>
      <TokushoPageContent storeDisplayName={storeDisplayName} />
    </LocalizedShell>
  );
}
