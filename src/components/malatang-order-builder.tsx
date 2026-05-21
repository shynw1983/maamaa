"use client";

import { useMemo, useState } from "react";
import {
  baseSoup,
  heatLevels,
  medicinalSpiceOptions,
  menuSections,
  numbLevels,
  specialFlavors,
  type MenuChoice,
} from "@/data/malatang-menu";

const yen = (price: number) => `¥${price.toLocaleString("ja-JP")}`;
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date());

type Reservation = {
  code: string;
  name: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  total: number;
  items: CartItem[];
};

type CartItem = {
  id: string;
  title: string;
  total: number;
  summary: string[];
};

export function MalatangOrderBuilder() {
  const [spice, setSpice] = useState(medicinalSpiceOptions[0].id);
  const [heat, setHeat] = useState("normal");
  const [numb, setNumb] = useState("tiny");
  const [flavors, setFlavors] = useState<string[]>([]);
  const [items, setItems] = useState<Record<string, number>>({});
  const [pickupDate, setPickupDate] = useState(today());
  const [pickupTime, setPickupTime] = useState("18:30");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [reservation, setReservation] = useState<Reservation | null>(null);

  const allChoices = useMemo(
    () => [
      ...medicinalSpiceOptions,
      ...heatLevels,
      ...numbLevels,
      ...specialFlavors,
      ...menuSections.flatMap((section) => section.items),
    ],
    [],
  );
  const choiceMap = useMemo(() => new Map(allChoices.map((choice) => [choice.id, choice])), [allChoices]);
  const selectedSpice = choiceMap.get(spice) || medicinalSpiceOptions[0];
  const selectedHeat = choiceMap.get(heat) || heatLevels[0];
  const selectedNumb = choiceMap.get(numb) || numbLevels[0];
  const selectedFlavors = flavors.map((id) => choiceMap.get(id)).filter(Boolean) as MenuChoice[];
  const selectedItems = Object.entries(items)
    .map(([id, quantity]) => {
      const item = choiceMap.get(id);
      return item && quantity > 0 ? { ...item, quantity } : null;
    })
    .filter(Boolean) as Array<MenuChoice & { quantity: number }>;

  const total =
    baseSoup.price +
    selectedSpice.price +
    selectedHeat.price +
    selectedNumb.price +
    selectedFlavors.reduce((sum, item) => sum + item.price, 0) +
    selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0);

  const toggleFlavor = (id: string) => {
    setFlavors((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : current.length >= 6 ? current : [...current, id],
    );
  };

  const changeQuantity = (id: string, delta: number) => {
    setItems((current) => {
      const next = Math.max(0, (current[id] || 0) + delta);
      const copy = { ...current };
      if (next) copy[id] = next;
      else delete copy[id];
      return copy;
    });
  };

  const resetCurrentBowl = () => {
    setSpice(medicinalSpiceOptions[0].id);
    setHeat("normal");
    setNumb("tiny");
    setFlavors([]);
    setItems({});
  };

  const buildCurrentSummary = () =>
    [
      selectedSpice.name,
      selectedHeat.name,
      selectedNumb.name,
      ...selectedFlavors.map((item) => item.name),
      ...selectedItems.map((item) => `${item.name} x${item.quantity}`),
    ].filter(Boolean);

  const addCurrentBowl = () => {
    const bowlNumber = cartItems.length + 1;
    setCartItems((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: `${baseSoup.name} #${bowlNumber}`,
        total,
        summary: buildCurrentSummary(),
      },
    ]);
    setReservation(null);
    resetCurrentBowl();
  };

  const removeCartItem = (id: string) => {
    setCartItems((current) => current.filter((item) => item.id !== id));
  };

  const createReservation = () => {
    if (!cartItems.length) return;

    const nextReservation = {
      code: `M-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      phone,
      pickupDate,
      pickupTime,
      total: cartTotal,
      items: cartItems,
    };

    setReservation(nextReservation);
    window.localStorage.setItem("maamaa-latest-reservation", JSON.stringify(nextReservation));
  };

  return (
    <div className="menuBuilder">
      <aside className="orderSummary" aria-label="予約内容">
        <p className="kicker">Pickup reservation</p>
        <h2>予約リスト</h2>
        <p>
          カスタムした一杯をリストに追加して、複数の商品をまとめて受け取り予約できます。
        </p>
        <div className="cartList">
          {cartItems.length ? (
            cartItems.map((item, index) => (
              <article className="cartItem" key={item.id}>
                <div>
                  <strong>
                    {index + 1}. {item.title}
                  </strong>
                  <span>{yen(item.total)}</span>
                </div>
                <p>{item.summary.slice(0, 5).join(" / ")}</p>
                <button type="button" onClick={() => removeCartItem(item.id)}>
                  削除
                </button>
              </article>
            ))
          ) : (
            <div className="emptyCart">
              右側で一杯をカスタムして、予約リストに追加してください。
            </div>
          )}
        </div>
        <div className="summaryTotal">
          <span>合計</span>
          <strong>{yen(cartTotal)}</strong>
        </div>
        <div className="pickupFields">
          <label>
            お名前
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="例: 山田" />
          </label>
          <label>
            電話番号
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="090..." />
          </label>
          <label>
            受け取り日
            <input type="date" min={today()} value={pickupDate} onChange={(event) => setPickupDate(event.target.value)} />
          </label>
          <label>
            受け取り時間
            <input type="time" value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} />
          </label>
          <label>
            メモ
            <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="香菜なし、袋分けなど" />
          </label>
        </div>
        <button className="button primary reserveButton" disabled={!name || !phone || !cartItems.length} onClick={createReservation}>
          予約内容を作成
        </button>
        {reservation ? (
          <div className="reservationResult">
            <strong>予約番号 {reservation.code}</strong>
            <span>
              {reservation.pickupDate} {reservation.pickupTime} / {yen(reservation.total)}
            </span>
            <small>{reservation.items.length}点。店頭でこの番号をお伝えください。</small>
          </div>
        ) : null}
      </aside>

      <section className="menuForm" aria-label="まぁ麻 メニュー">
        <div className="menuHeroCard">
          <p className="kicker">Base soup</p>
          <h1>{baseSoup.name}</h1>
          <p>{baseSoup.note}</p>
          <strong>{yen(baseSoup.price)}</strong>
        </div>

        <section className="currentBowlBar" aria-label="現在の一杯">
          <div>
            <span>現在の一杯</span>
            <strong>{yen(total)}</strong>
          </div>
          <button className="button primary" type="button" onClick={addCurrentBowl}>
            予約リストに追加
          </button>
        </section>

        <ChoiceGroup title="薬膳の有無を選ぶ" items={medicinalSpiceOptions} value={spice} onChange={setSpice} />
        <ChoiceGroup title="辛さレベルを選ぶ" items={heatLevels} value={heat} onChange={setHeat} />
        <ChoiceGroup title="痺れレベルを選ぶ" items={numbLevels} value={numb} onChange={setNumb} />

        <section className="menuPanel">
          <div className="menuPanelHeader">
            <p className="kicker">Special flavor</p>
            <h2>スペシャルな味変</h2>
            <span>6個まで</span>
          </div>
          <div className="optionGrid">
            {specialFlavors.map((item) => (
              <button
                className={flavors.includes(item.id) ? "optionButton selected" : "optionButton"}
                key={item.id}
                onClick={() => toggleFlavor(item.id)}
                type="button"
              >
                <span>{item.name}</span>
                <small>{item.note || yen(item.price)}</small>
              </button>
            ))}
          </div>
        </section>

        {menuSections.map((section) => (
          <section className="menuPanel" key={section.id}>
            <div className="menuPanelHeader">
              <p className="kicker">{section.id}</p>
              <h2>{section.title}</h2>
              <span>{section.limit}個まで</span>
            </div>
            <div className="toppingList">
              {section.items.map((item) => (
                <div className="toppingRow" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{yen(item.price)}</span>
                  </div>
                  <div className="quantityControl">
                    <button type="button" onClick={() => changeQuantity(item.id, -1)}>
                      -
                    </button>
                    <span>{items[item.id] || 0}</span>
                    <button type="button" onClick={() => changeQuantity(item.id, 1)}>
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </section>
    </div>
  );
}

function ChoiceGroup({
  title,
  items,
  value,
  onChange,
}: {
  title: string;
  items: MenuChoice[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <section className="menuPanel">
      <div className="menuPanelHeader">
        <p className="kicker">Required</p>
        <h2>{title}</h2>
        <span>1個選択</span>
      </div>
      <div className="optionGrid">
        {items.map((item) => (
          <button
            className={value === item.id ? "optionButton selected" : "optionButton"}
            key={item.id}
            onClick={() => onChange(item.id)}
            type="button"
          >
            <span>{item.name}</span>
            <small>{item.note || (item.price ? `+${yen(item.price)}` : "追加料金なし")}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
