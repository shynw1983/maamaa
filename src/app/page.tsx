import { HomeContent } from "@/components/home-content";
import { LocalizedShell } from "@/components/localized-shell";

export default function Home() {
  return (
    <LocalizedShell language="ja">
      <HomeContent />
    </LocalizedShell>
  );
}
