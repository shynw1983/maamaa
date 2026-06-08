import { ClientLocaleRedirect } from "@/components/client-locale-redirect";
import { HomeContent } from "@/components/home-content";
import { LocalizedShell } from "@/components/localized-shell";
import { getBrandSiteSections } from "@/server/brand-site-source";

export const dynamic = "force-dynamic";

export default async function Home() {
  const siteSections = await getBrandSiteSections("maamaa", "ja");

  return (
    <LocalizedShell language="ja">
      <ClientLocaleRedirect path="/" />
      <HomeContent siteSections={siteSections} />
    </LocalizedShell>
  );
}
