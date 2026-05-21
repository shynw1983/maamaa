import { ClientLocaleRedirect } from "@/components/client-locale-redirect";
import { LocalizedShell } from "@/components/localized-shell";
import { MenuPageContent } from "@/components/menu-page-content";
import { languageAlternates } from "@/data/locales";

export const metadata = {
  title: "メニュー・受け取り予約 | まぁ麻",
  description: "まぁ麻の出来立て麻辣湯をカスタムして、店頭受け取り予約の内容を作成できます。",
  alternates: {
    canonical: "/menu",
    languages: languageAlternates("/menu"),
  },
};

export default function MenuPage() {
  return (
    <LocalizedShell language="ja">
      <ClientLocaleRedirect path="/menu" />
      <MenuPageContent />
    </LocalizedShell>
  );
}
