import { ClientLocaleRedirect } from "@/components/client-locale-redirect";
import { LocalizedShell } from "@/components/localized-shell";
import { ShimizuReservationLogin } from "@/components/shimizu-reservation-login";
import { languageAlternates } from "@/data/locales";

const shimizuLoginPath = "/stores/shimizu/login";

export const metadata = {
  title: "清水店 受け取り予約ログイン | まぁ麻",
  description: "まぁ麻 清水店の受け取り予約を確認するためのログインページです。",
  alternates: {
    canonical: shimizuLoginPath,
    languages: languageAlternates(shimizuLoginPath),
  },
};

export default async function ShimizuLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params?.next?.startsWith("/") ? params.next : "/stores/shimizu/menu";

  return (
    <LocalizedShell language="ja">
      <ClientLocaleRedirect path={shimizuLoginPath} />
      <ShimizuReservationLogin nextPath={nextPath} />
    </LocalizedShell>
  );
}
