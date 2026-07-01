import { notFound } from "next/navigation";
import { LocalizedShell } from "@/components/localized-shell";
import { ShimizuReservationLogin } from "@/components/shimizu-reservation-login";
import { resolveMenuStoreDisplayName } from "@/components/store-display-name";
import { isLocale, languageAlternates, translatedLocales, withLocalePath } from "@/data/locales";
import { getMenuData } from "@/server/menu-source";

const shimizuLoginPath = "/stores/shimizu/login";

export function generateStaticParams() {
  return translatedLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") return {};
  const storeDisplayName = resolveMenuStoreDisplayName(await getMenuData("shimizu"));

  return {
    title: `${storeDisplayName} pickup login | Maama`,
    description: `Login page for reviewing ${storeDisplayName} pickup reservations.`,
    alternates: {
      canonical: withLocalePath(lang, shimizuLoginPath),
      languages: languageAlternates(shimizuLoginPath),
    },
  };
}

export default async function LocalizedShimizuLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{ next?: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") notFound();

  const [query, menu] = await Promise.all([
    searchParams,
    getMenuData("shimizu"),
  ]);
  const fallbackPath = withLocalePath(lang, "/stores/shimizu/menu");
  const nextPath = query?.next?.startsWith("/") ? query.next : fallbackPath;
  const storeDisplayName = resolveMenuStoreDisplayName(menu);

  return (
    <LocalizedShell language={lang}>
      <ShimizuReservationLogin nextPath={nextPath} storeDisplayName={storeDisplayName} />
    </LocalizedShell>
  );
}
