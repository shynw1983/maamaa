import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ClientLocaleRedirect } from "@/components/client-locale-redirect";
import { LocalizedShell } from "@/components/localized-shell";
import { MenuPageContent } from "@/components/menu-page-content";
import { resolveMenuStoreDisplayName } from "@/components/store-display-name";
import { languageAlternates } from "@/data/locales";
import { getBrandSiteSections } from "@/server/brand-site-source";
import { getMenuData } from "@/server/menu-source";
import { isReservationAuthenticated } from "@/server/shimizu-reservation-auth";

const shimizuMenuPath = "/stores/shimizu/menu";

export async function generateMetadata() {
  const storeDisplayName = resolveMenuStoreDisplayName(await getMenuData("shimizu"));
  return {
    title: `${storeDisplayName} メニュー・受け取り予約 | まぁ麻`,
    description: `${storeDisplayName}で、辛さ、痺れ、麺、具材を選び、ご注文ごとに鍋を分けて仕上げる麻辣湯を予約できます。`,
    alternates: {
      canonical: shimizuMenuPath,
      languages: languageAlternates(shimizuMenuPath),
    },
  };
}

export default async function ShimizuMenuPage() {
  const cookieStore = await cookies();
  if (!isReservationAuthenticated(cookieStore)) {
    redirect("/stores/shimizu/login?next=/stores/shimizu/menu");
  }
  const [initialMenu, siteSections] = await Promise.all([
    getMenuData("shimizu"),
    getBrandSiteSections("maamaa", "ja"),
  ]);

  return (
    <LocalizedShell language="ja">
      <ClientLocaleRedirect path={shimizuMenuPath} />
      <MenuPageContent initialMenu={initialMenu} siteSections={siteSections} />
    </LocalizedShell>
  );
}
