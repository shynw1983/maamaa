import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <main>
      <SiteHeader menu />
      <section className="legalPage">
        <p className="kicker">ページ未検出</p>
        <h1>ページが見つかりません</h1>
        <p>URLをご確認のうえ、メニュー画面からもう一度お試しください。</p>
        <a className="button primary" href="/stores/shimizu/menu">メニューへ戻る</a>
      </section>
    </main>
  );
}
