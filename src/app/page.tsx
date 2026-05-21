import Image from "next/image";

const stores = [
  {
    label: "1st store",
    title: "まぁ麻 テイクアウト店",
    body: "現在営業中の店舗です。Uber Eats などのデリバリーとテイクアウトに対応し、ご注文を受けてから一杯ずつ出来立てで仕上げます。",
  },
  {
    label: "2nd store",
    title: "まぁ麻 イートイン店",
    body: "次に準備している追加店舗です。店内でも出来立ての麻辣湯を楽しめる、イートイン対応の店舗として計画しています。",
  },
];

const bowls = [
  ["Made fresh", "注文を受けてから一杯ずつ調理。作り置きではない、出来立ての温度感。"],
  ["Select", "野菜、きのこ、豆腐、ミートボール、春雨、麺を気分に合わせて。"],
  ["Balance", "辛さ、しびれ、香味、トッピングを自分らしく調整。"],
];

export default function Home() {
  return (
    <main>
      <header className="siteHeader" aria-label="メインナビゲーション">
        <a className="brand" href="#top" aria-label="まぁ麻 ホーム">
          <span className="brandStamp">まぁ</span>
          <span>まぁ麻</span>
        </a>
        <nav className="nav" aria-label="ページナビゲーション">
          <a href="#concept">Concept</a>
          <a href="/menu">Menu</a>
          <a href="#stores">Stores</a>
          <a href="#pickup">Pickup</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section id="top" className="hero" aria-labelledby="heroTitle">
        <div className="heroContent">
          <p className="kicker">出来立て麻辣湯</p>
          <h1 id="heroTitle">まぁ麻</h1>
          <p className="heroLead">
            ご注文を受けてから、一杯ずつ仕上げる麻辣湯。まぁ麻は、熱さ、香り、具材の食感まで、出来立てのおいしさを届けます。
          </p>
          <div className="heroActions">
            <a className="button primary" href="/menu">
              メニューを見る
            </a>
            <a className="button quiet" href="#pickup">
              ピックアップ予定
            </a>
          </div>
        </div>
        <div className="heroVisual" aria-hidden="true">
          <Image
            className="heroImage"
            src="/images/maamaa-hero-bowl.jpg"
            alt=""
            width={990}
            height={1152}
            priority
            sizes="(max-width: 920px) 90vw, 46vw"
          />
        </div>
      </section>

      <section id="concept" className="section split">
        <div>
          <p className="kicker">Brand concept</p>
          <h2>作り置きではなく、注文ごとに仕上げる。</h2>
        </div>
        <div className="copyStack">
          <p>
            まぁ麻の麻辣湯は、大きな鍋でまとめて煮込むスタイルではありません。注文を受けてから具材とスープを合わせ、一杯ずつ出来立てでお渡しします。
          </p>
          <p>
            目指すのは、強い装飾に頼らない、日常に寄り添う麻辣湯ブランド。デリバリーからピックアップ、そしてイートインへ、体験を段階的に広げていきます。
          </p>
        </div>
      </section>

      <section className="section bowlSection" aria-labelledby="bowlTitle">
        <div className="sectionIntro">
          <p className="kicker">Build a bowl</p>
          <h2 id="bowlTitle">選べる楽しさと、出来立ての安心感。</h2>
        </div>
        <div className="bowlGrid">
          {bowls.map(([title, body]) => (
            <article className="bowlCard" key={title}>
              <span>{title}</span>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="stores" className="section storeIntroSection" aria-labelledby="storesTitle">
        <div className="sectionIntro">
          <p className="kicker">Shop information</p>
          <h2 id="storesTitle">出来立てを受け取る店から、店内で味わう店へ。</h2>
        </div>
        <div className="storeIntroGrid">
          {stores.map((item) => (
            <article className="storeIntroItem" key={item.title}>
              <p className="pill">{item.label}</p>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pickup" className="section pickupSection" aria-labelledby="pickupTitle">
        <div className="pickupVisual" aria-hidden="true">
          <div className="phone">
            <div className="phoneLine wide" />
            <div className="phoneLine" />
            <div className="phoneList">
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="takeoutBag">
            <span />
          </div>
        </div>
        <div>
          <p className="kicker">Pickup plan</p>
          <h2 id="pickupTitle">店頭ピックアップで、もっと近く、もっと早く。</h2>
          <p>
            ピックアップ機能では、スープ、具材、辛さを事前に選び、指定時間に受け取れる導線を想定しています。受け取り直前に仕上げることで、近隣のお客様にも出来立ての一杯を届けます。
          </p>
        </div>
      </section>

      <footer id="contact" className="footer">
        <div>
          <p className="footerLogo">まぁ麻</p>
          <p>出来立て麻辣湯 for delivery, pickup, and dine-in.</p>
        </div>
        <a className="button footerButton" href="mailto:hello@maamaa.example">
          Contact
        </a>
      </footer>
    </main>
  );
}
