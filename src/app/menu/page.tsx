import { MalatangOrderBuilder } from "@/components/malatang-order-builder";

export const metadata = {
  title: "メニュー・受け取り予約 | まぁ麻",
  description: "まぁ麻の出来立て麻辣湯をカスタムして、店頭受け取り予約の内容を作成できます。",
};

export default function MenuPage() {
  return (
    <main>
      <header className="siteHeader" aria-label="メインナビゲーション">
        <a className="brand" href="/" aria-label="まぁ麻 ホーム">
          <span className="brandStamp">まぁ</span>
          <span>まぁ麻</span>
        </a>
        <nav className="nav" aria-label="ページナビゲーション">
          <a href="/">Home</a>
          <a href="/menu">Menu</a>
          <a href="/#stores">Stores</a>
          <a href="/#contact">Contact</a>
        </nav>
      </header>

      <section className="menuPageHero">
        <p className="kicker">Menu / pickup reservation</p>
        <h1>出来立て麻辣湯を、自由にカスタム。</h1>
        <p>
          Uber Eats のメニュー構成をもとに、店頭受け取り用のカスタムメニューを作成できます。
          辛さ、痺れ、麺、トッピングを選んで、受け取り時間を指定してください。
        </p>
      </section>

      <MalatangOrderBuilder />
    </main>
  );
}
