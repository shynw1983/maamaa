import { ClientLocaleRedirect } from "@/components/client-locale-redirect";
import { LocalizedShell } from "@/components/localized-shell";
import { MenuPageContent } from "@/components/menu-page-content";
import { languageAlternates } from "@/data/locales";

const shimizuMenuPath = "/stores/shimizu/menu";

export const metadata = {
  title: "清水店 メニュー・受け取り予約 | まぁ麻",
  description: "まぁ麻 清水店の出来立て麻辣湯をカスタムして、店頭受け取り予約の内容を作成できます。",
  alternates: {
    canonical: shimizuMenuPath,
    languages: languageAlternates(shimizuMenuPath),
  },
};

export default function ShimizuMenuPage() {
  return (
    <LocalizedShell language="ja">
      <ClientLocaleRedirect path={shimizuMenuPath} />
      <MenuPageContent />
    </LocalizedShell>
  );
}
