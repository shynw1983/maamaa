"use client";

import { useEffect, useMemo, useState } from "react";
import {
  baseSoup,
  heatLevels,
  medicinalSpiceOptions,
  menuSections,
  numbLevels,
  specialFlavors,
  type MenuChoice,
} from "@/data/malatang-menu";
import { useI18n } from "@/components/i18n-provider";
import { localizedPath } from "@/components/localized-path";

const yen = (price: number) => `¥${price.toLocaleString("ja-JP")}`;
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date());
const optionPrice = (price: number) => `+${yen(price)}`;
const isRecommended = (item: MenuChoice) => item.note === "おすすめ";

type Reservation = {
  orderId: string;
  code: string;
  status: "pending" | "new";
  createdAt: string;
  name: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  note: string;
  total: number;
  items: CartItem[];
};

type CartItem = {
  id: string;
  title: string;
  total: number;
  summary: string[];
  selections: BowlSelections;
};

type BowlSelections = {
  spice: string;
  heat: string;
  numb: string;
  flavors: string[];
  items: Record<string, number>;
};

type ProductState = {
  drinkId: string;
  isAvailable: boolean;
  websiteEnabled: boolean;
};

export function MalatangOrderBuilder() {
  const { language, t } = useI18n();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [hiddenChoiceIds, setHiddenChoiceIds] = useState<Set<string>>(new Set());
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);
  const [lastAddedTotal, setLastAddedTotal] = useState<number | null>(null);

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
  const isChoiceOpen = (id: string) => !hiddenChoiceIds.has(id);
  const selectedSpice = choiceMap.get(spice) || medicinalSpiceOptions[0];
  const selectedHeat = choiceMap.get(heat) || heatLevels[0];
  const selectedNumb = choiceMap.get(numb) || numbLevels[0];
  const selectedFlavors = flavors
    .map((id) => choiceMap.get(id))
    .filter((item): item is MenuChoice => (item ? isChoiceOpen(item.id) : false));
  const selectedItems = Object.entries(items)
    .map(([id, quantity]) => {
      const item = choiceMap.get(id);
      return item && quantity > 0 && isChoiceOpen(id) ? { ...item, quantity } : null;
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
  const reserveButtonLabel = isSubmitting
    ? t("送信中...")
    : !cartItems.length
      ? t("メニューを追加してください")
      : !name || !phone
        ? t("お名前・電話番号を入力")
        : t("支払いへ進む");

  useEffect(() => {
    let active = true;
    fetch("/api/products", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (!active) return;
        const products = (body?.products || []) as ProductState[];
        const hiddenIds = products
          .filter((product) => !product.isAvailable || !product.websiteEnabled)
          .map((product) => product.drinkId);
        setHiddenChoiceIds(new Set(hiddenIds));
      })
      .catch(() => {
        if (active) setHiddenChoiceIds(new Set());
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setFlavors((current) => current.filter((id) => isChoiceOpen(id)));
    setItems((current) =>
      Object.fromEntries(Object.entries(current).filter(([id]) => isChoiceOpen(id))),
    );
    if (!isChoiceOpen(spice)) setSpice(medicinalSpiceOptions.find((item) => isChoiceOpen(item.id))?.id || medicinalSpiceOptions[0].id);
    if (!isChoiceOpen(heat)) setHeat(heatLevels.find((item) => isChoiceOpen(item.id))?.id || heatLevels[0].id);
    if (!isChoiceOpen(numb)) setNumb(numbLevels.find((item) => isChoiceOpen(item.id))?.id || numbLevels[0].id);
  }, [hiddenChoiceIds, spice, heat, numb]);

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
    setEditingCartItemId(null);
  };

  const getCurrentSelections = (): BowlSelections => ({
    spice,
    heat,
    numb,
    flavors,
    items,
  });

  const applySelections = (selections: BowlSelections) => {
    setSpice(selections.spice);
    setHeat(selections.heat);
    setNumb(selections.numb);
    setFlavors(selections.flavors);
    setItems(selections.items);
  };

  const buildCurrentSummary = () =>
    [
      t(selectedSpice.name),
      t(selectedHeat.name),
      t(selectedNumb.name),
      ...selectedFlavors.map((item) => t(item.name)),
      ...selectedItems.map((item) => `${t(item.name)} x${item.quantity}`),
    ].filter(Boolean);

  const addCurrentBowl = () => {
    const bowlNumber = cartItems.length + 1;
    const currentTotal = total;
    const nextItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: `${t(baseSoup.name)} #${bowlNumber}`,
      total: currentTotal,
      summary: buildCurrentSummary(),
      selections: getCurrentSelections(),
    };

    if (editingCartItemId) {
      setCartItems((current) =>
        current.map((item) =>
          item.id === editingCartItemId
            ? {
                ...nextItem,
                id: item.id,
                title: item.title,
              }
            : item,
        ),
      );
      setReservation(null);
      setLastAddedTotal(currentTotal);
      resetCurrentBowl();
      return;
    }

    setCartItems((current) => [
      ...current,
      nextItem,
    ]);
    setReservation(null);
    setLastAddedTotal(currentTotal);
    resetCurrentBowl();
  };

  const editCartItem = (item: CartItem) => {
    applySelections(item.selections);
    setEditingCartItemId(item.id);
    setReservation(null);
  };

  const removeCartItem = (id: string) => {
    setCartItems((current) => current.filter((item) => item.id !== id));
    if (editingCartItemId === id) resetCurrentBowl();
  };

  useEffect(() => {
    if (lastAddedTotal === null) return;
    const timeout = window.setTimeout(() => setLastAddedTotal(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [lastAddedTotal]);

  const createReservation = async () => {
    if (!cartItems.length) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          pickupDate,
          pickupTime,
          note,
          total: cartTotal,
          items: cartItems,
          language,
        }),
      });

      if (!response.ok) throw new Error("request failed");
      const body = await response.json();
      const nextReservation = {
        orderId: body.order?.orderId || "",
        code: body.order?.pickupCode || `M-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "pending" as const,
        createdAt: body.order?.createdAt || new Date().toISOString(),
        name,
        phone,
        pickupDate,
        pickupTime,
        note,
        total: cartTotal,
        items: cartItems,
      };

      setReservation(nextReservation);
      try {
        window.localStorage?.setItem("maamaa-latest-reservation", JSON.stringify(nextReservation));
      } catch {
        // Continue to checkout even when local storage is unavailable.
      }
      if (body.checkoutUrl) {
        window.location.assign(body.checkoutUrl);
      } else if (body.orderUrl) {
        window.location.assign(body.orderUrl);
      }
    } catch {
      setSubmitError(t("予約を送信できませんでした。決済設定を確認してください。"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="menuBuilder">
      <aside className="orderSummary" aria-label={t("予約内容")}>
        <p className="kicker">{t("Pickup reservation")}</p>
        <h2>{t("予約リスト")}</h2>
        <p>
          {t("カスタムした一杯をリストに追加して、複数の商品をまとめて受け取り予約できます。")}
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
                <p>{item.summary.join(" / ")}</p>
                <div className="cartItemActions">
                  <button className={editingCartItemId === item.id ? "isEditing" : ""} type="button" onClick={() => editCartItem(item)}>
                    {editingCartItemId === item.id ? t("編集中") : t("編集")}
                  </button>
                  <button type="button" onClick={() => removeCartItem(item.id)}>
                    {t("削除")}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="emptyCart">
              {t("メニューから一杯をカスタムして、予約リストに追加してください。")}
            </div>
          )}
        </div>
        <div className="summaryTotal">
          <span>{t("合計")}</span>
          <strong>{yen(cartTotal)}</strong>
        </div>
        <div className="pickupFields">
          <label>
            {t("お名前")}
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder={t("例: 山田")} />
          </label>
          <label>
            {t("電話番号")}
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="090..." />
          </label>
          <label>
            {t("受け取り日")}
            <input type="date" min={today()} value={pickupDate} onChange={(event) => setPickupDate(event.target.value)} />
          </label>
          <label>
            {t("受け取り時間")}
            <input type="time" value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} />
          </label>
          <label>
            {t("メモ")}
            <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={t("香菜なし、袋分けなど")} />
          </label>
        </div>
        <button className="button primary reserveButton" disabled={!name || !phone || !cartItems.length || isSubmitting} onClick={createReservation}>
          {reserveButtonLabel}
        </button>
        {submitError ? <p className="formError">{submitError}</p> : null}
        {reservation ? (
          <div className="reservationResult">
            <strong>{t("予約番号")} {reservation.code}</strong>
            <span>
              {reservation.pickupDate} {reservation.pickupTime} / {yen(reservation.total)}
            </span>
            <small>
              {reservation.items.length}
              {t("点。決済完了後、制作状況ページでこの番号を確認できます。")}
            </small>
          </div>
        ) : null}
        <div className="legalSummaryLinks">
          <a className="legalSummaryLink" href={localizedPath(language, "/stores/shimizu/legal/tokusho")}>
            {t("特定商取引法に基づく表記")}
          </a>
          <a className="legalSummaryLink" href={localizedPath(language, "/stores/shimizu/legal/terms")}>
            {t("利用規約")}
          </a>
          <a className="legalSummaryLink" href={localizedPath(language, "/stores/shimizu/legal/privacy")}>
            {t("プライバシーポリシー")}
          </a>
        </div>
      </aside>

      <section className="menuForm" aria-label={t("まぁ麻 メニュー")}>
        <div className="menuHeroCard">
          <p className="kicker">{t("Base soup")}</p>
          <h1>{t(baseSoup.name)}</h1>
          <p>{t(baseSoup.note || "")}</p>
          <strong>{yen(baseSoup.price)}</strong>
        </div>

        <section className="currentBowlBar" aria-label={t("現在の一杯")}>
          <div>
            {lastAddedTotal !== null && !editingCartItemId ? (
              <>
                <span className="successText">{t("予約リストに追加しました")}</span>
                <strong>{yen(lastAddedTotal)}</strong>
              </>
            ) : (
              <>
                <span className={editingCartItemId ? "editingText" : undefined}>
                  {editingCartItemId ? t("編集中の一杯") : cartItems.length ? t("次の一杯") : t("現在の一杯")}
                </span>
                <strong>{yen(total)}</strong>
              </>
            )}
          </div>
          <button className="button primary" type="button" onClick={addCurrentBowl}>
            {editingCartItemId ? t("変更を保存") : lastAddedTotal !== null ? t("追加しました") : t("予約リストに追加")}
          </button>
        </section>

        <ChoiceGroup title="薬膳の有無を選ぶ" items={medicinalSpiceOptions.filter((item) => isChoiceOpen(item.id))} value={spice} onChange={setSpice} />
        <ChoiceGroup title="辛さレベルを選ぶ" items={heatLevels.filter((item) => isChoiceOpen(item.id))} value={heat} onChange={setHeat} />
        <ChoiceGroup title="痺れレベルを選ぶ" items={numbLevels.filter((item) => isChoiceOpen(item.id))} value={numb} onChange={setNumb} />

        <section className="menuPanel">
          <div className="menuPanelHeader">
            <p className="kicker">Special flavor</p>
            <h2>{t("スペシャルな味変")}</h2>
            <span>{t("6個まで")}</span>
          </div>
          <div className="optionGrid">
            {specialFlavors.filter((item) => isChoiceOpen(item.id)).map((item) => (
              <button
                className={flavors.includes(item.id) ? "optionButton selected" : "optionButton"}
                key={item.id}
                onClick={() => toggleFlavor(item.id)}
                type="button"
              >
                <OptionName item={item} />
                <small>{optionPrice(item.price)}</small>
              </button>
            ))}
          </div>
        </section>

        {menuSections.map((section) => (
          <section className="menuPanel" key={section.id}>
            <div className="menuPanelHeader">
              <p className="kicker">{section.id}</p>
              <h2>{t(section.title)}</h2>
              <span>{section.limit}{t("個まで")}</span>
            </div>
            <div className="toppingList">
              {section.items.filter((item) => isChoiceOpen(item.id)).map((item) => (
                <div className="toppingRow" key={item.id}>
                  <div>
                    <strong>
                      <OptionName item={item} />
                    </strong>
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
  const { t } = useI18n();

  return (
    <section className="menuPanel">
      <div className="menuPanelHeader">
        <p className="kicker">Required</p>
        <h2>{t(title)}</h2>
        <span>{t("1個選択")}</span>
      </div>
      <div className="optionGrid">
        {items.map((item) => (
          <button
            className={value === item.id ? "optionButton selected" : "optionButton"}
            key={item.id}
            onClick={() => onChange(item.id)}
            type="button"
          >
            <OptionName item={item} />
            <small>{optionPrice(item.price)}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function OptionName({ item }: { item: MenuChoice }) {
  const { t } = useI18n();

  return (
    <span className="optionName">
      {t(item.name)}
      {isRecommended(item) ? (
        <span aria-label={t("おすすめ")} className="recommendIcon" title={t("おすすめ")}>
          ★
        </span>
      ) : null}
    </span>
  );
}
