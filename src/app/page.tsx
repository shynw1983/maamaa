import { ClientLocaleRedirect } from "@/components/client-locale-redirect";
import { HomeContent } from "@/components/home-content";
import { LocalizedShell } from "@/components/localized-shell";
import { getBrandSiteSections } from "@/server/brand-site-source";
import { getMenuData } from "@/server/menu-source";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [siteSections, initialMenu] = await Promise.all([
    getBrandSiteSections("maamaa", "ja"),
    getMenuData("shimizu"),
  ]);

  return (
    <LocalizedShell language="ja">
      <ClientLocaleRedirect path="/" />
      <HomeContent siteSections={siteSections} initialMenu={initialMenu} />
    </LocalizedShell>
  );
}
