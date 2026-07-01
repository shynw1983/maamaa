import { ClientLocaleRedirect } from "@/components/client-locale-redirect";
import { LocalizedShell } from "@/components/localized-shell";
import { ShimizuReservationLogin } from "@/components/shimizu-reservation-login";
import { resolveMenuStoreDisplayName } from "@/components/store-display-name";
import { languageAlternates } from "@/data/locales";
import { getMenuData } from "@/server/menu-source";

const shimizuLoginPath = "/stores/shimizu/login";

export async function generateMetadata() {
  const storeDisplayName = resolveMenuStoreDisplayName(await getMenuData("shimizu"));
  return {
    title: `${storeDisplayName} 受け取り予約ログイン | まぁ麻`,
    description: `${storeDisplayName}の受け取り予約を確認するためのログインページです。`,
    alternates: {
      canonical: shimizuLoginPath,
      languages: languageAlternates(shimizuLoginPath),
    },
  };
}

export default async function ShimizuLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const [params, menu] = await Promise.all([
    searchParams,
    getMenuData("shimizu"),
  ]);
  const nextPath = params?.next?.startsWith("/") ? params.next : "/stores/shimizu/menu";
  const storeDisplayName = resolveMenuStoreDisplayName(menu);

  return (
    <LocalizedShell language="ja">
      <ClientLocaleRedirect path={shimizuLoginPath} />
      <ShimizuReservationLogin nextPath={nextPath} storeDisplayName={storeDisplayName} />
    </LocalizedShell>
  );
}
