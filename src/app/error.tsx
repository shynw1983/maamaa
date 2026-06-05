"use client";

import { SiteHeader } from "@/components/site-header";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main>
      <SiteHeader menu />
      <section className="legalPage">
        <p className="kicker">表示エラー</p>
        <h1>ページを表示できませんでした</h1>
        <p>通信状況をご確認のうえ、時間をおいてからもう一度お試しください。</p>
        <div className="checkoutActions">
          <button className="button primary" type="button" onClick={() => reset()}>
            再読み込み
          </button>
          <a className="button secondary" href="/stores/shimizu/menu">メニューへ戻る</a>
        </div>
      </section>
    </main>
  );
}
