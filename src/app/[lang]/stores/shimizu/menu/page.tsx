import { notFound } from "next/navigation";
import { LocalizedShell } from "@/components/localized-shell";
import { MenuPageContent } from "@/components/menu-page-content";
import { resolveMenuStoreDisplayName } from "@/components/store-display-name";
import { isLocale, languageAlternates, translatedLocales, withLocalePath } from "@/data/locales";
import { getBrandSiteSections } from "@/server/brand-site-source";
import { getMenuData } from "@/server/menu-source";

const shimizuMenuPath = "/stores/shimizu/menu";

export function generateStaticParams() {
  return translatedLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") return {};
  const storeDisplayName = resolveMenuStoreDisplayName(await getMenuData("shimizu"));

  return {
    title: `${storeDisplayName} menu / Pickup reservation | まぁ麻`,
    description: `Customize ${storeDisplayName}'s freshly made malatang and create a pickup reservation.`,
    alternates: {
      canonical: withLocalePath(lang, shimizuMenuPath),
      languages: languageAlternates(shimizuMenuPath),
    },
  };
}

export default async function LocalizedShimizuMenuPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") notFound();
  const [initialMenu, siteSections] = await Promise.all([
    getMenuData("shimizu"),
    getBrandSiteSections("maamaa", lang),
  ]);

  return (
    <LocalizedShell language={lang}>
      <MenuPageContent initialMenu={initialMenu} siteSections={siteSections} />
    </LocalizedShell>
  );
}
