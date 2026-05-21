import { ClientLocaleRedirect } from "@/components/client-locale-redirect";
import { HomeContent } from "@/components/home-content";
import { LocalizedShell } from "@/components/localized-shell";

export default function Home() {
  return (
    <LocalizedShell language="ja">
      <ClientLocaleRedirect path="/" />
      <HomeContent />
    </LocalizedShell>
  );
}
