"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MenuChoice, MenuSection } from "@/data/malatang-menu";
import { useI18n } from "@/components/i18n-provider";
import { localizedPath } from "@/components/localized-path";

const yen = (price: number) => `¥${price.toLocaleString("ja-JP")}`;
const defaultMinimumPickupMinutes = 15;
const minimumBowlTotal = 800;
const getTokyoDateTimeParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || "";
  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    time: `${value("hour")}:${value("minute")}`,
  };
};
const normalizeMinimumPickupMinutes = (value: unknown) => {
  if (value === null || value === undefined || value === "") return defaultMinimumPickupMinutes;
  const minutes = Math.round(Number(value));
  if (!Number.isFinite(minutes)) return defaultMinimumPickupMinutes;
  return Math.max(0, Math.min(240, minutes));
};
const getMinimumPickupDateTime = (leadMinutes = defaultMinimumPickupMinutes) =>
  getTokyoDateTimeParts(new Date(Date.now() + leadMinutes * 60 * 1000));
const compareDateTime = (leftDate: string, leftTime: string, rightDate: string, rightTime: string) =>
  `${leftDate}T${leftTime}`.localeCompare(`${rightDate}T${rightTime}`);
const sectionSelectionLimitError = (sectionTitle: string, limit: number) =>
  `${sectionTitle}は${limit}個まで選択できます。数量を減らしてから、もう一度お試しください。`;
const optionPrice = (price: number) => `+${yen(price)}`;
const isRecommended = (item: MenuChoice) => item.note === "おすすめ";
const defaultChoiceId = (items: MenuChoice[], preferredId = "") =>
  items.find((item) => item.id === preferredId)?.id || items[0]?.id || "";
const defaultSubmitError = "予約を送信できませんでした。時間をおいてからもう一度お試しください。";
const minimumBowlTotalError = `一杯あたり${yen(minimumBowlTotal)}以上になるように具材を追加してください。`;
const unavailableSelectionError = "選択したトッピング・オプションの一部が現在販売停止または品切れです。予約リストから該当する一杯を削除して、もう一度選び直してください。";
const menuRefreshNotice = "メニュー状態が更新されました。販売中の内容を最新にしました。";
const menuRefreshIntervalMs = 15000;

function formatUnavailableItems(value: unknown) {
  if (!Array.isArray(value)) return "";
  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return "";
      const record = entry as Record<string, unknown>;
      const index = Number(record.itemIndex || 0);
      const title = String(record.title || "").trim();
      const optionNames = Array.isArray(record.unavailableOptions)
        ? record.unavailableOptions
            .map((option) => (option && typeof option === "object" ? String((option as Record<string, unknown>).name || "") : ""))
            .filter(Boolean)
            .join("、")
        : "";
      const summary = Array.isArray(record.summary) ? record.summary.map(String).filter(Boolean).join(" / ") : "";
      const label = [index ? `${index}.` : "", title, optionNames ? `: ${optionNames}` : summary ? `（${summary}）` : ""].filter(Boolean).join(" ");
      return label.trim();
    })
    .filter(Boolean)
    .join("、");
}

function getSubmitErrorMessage(body: Record<string, unknown> | null) {
  if (body?.code === "BOWL_TOTAL_TOO_LOW") return String(body.error || minimumBowlTotalError);
  if (body?.code === "MENU_SELECTION_UNAVAILABLE") {
    const items = formatUnavailableItems(body.unavailableItems);
    return items ? `${unavailableSelectionError} 対象: ${items}` : unavailableSelectionError;
  }
  if (body?.code === "MENU_ITEM_UNAVAILABLE") return String(body.error || "ベースの麻辣湯が現在販売停止中です。時間をおいてからもう一度お試しください。");
  return String(body?.error || defaultSubmitError);
}

function menuSignature(menu: MalatangMenu) {
  return JSON.stringify({
    base: [menu.baseSoup.id, menu.baseSoup.price, menu.baseSoup.isAvailable, menu.baseSoup.websiteEnabled],
    spice: menu.medicinalSpiceOptions.map((item) => [item.id, item.price]),
    heat: menu.heatLevels.map((item) => [item.id, item.price]),
    numb: menu.numbLevels.map((item) => [item.id, item.price]),
    flavors: menu.specialFlavors.map((item) => [item.id, item.price]),
    sections: menu.menuSections.map((section) => [section.id, section.items.map((item) => [item.id, item.price])]),
  });
}

function unavailableCartItemLabels(cartItems: CartItem[], menu: MalatangMenu) {
  const availableIds = new Set([
    ...menu.medicinalSpiceOptions.map((item) => item.id),
    ...menu.heatLevels.map((item) => item.id),
    ...menu.numbLevels.map((item) => item.id),
    ...menu.specialFlavors.map((item) => item.id),
    ...menu.menuSections.flatMap((section) => section.items.map((item) => item.id)),
  ]);

  return cartItems
    .map((item, index) => {
      const selectedIds = [
        item.selections.spice,
        item.selections.heat,
        item.selections.numb,
        ...item.selections.flavors,
        ...Object.entries(item.selections.items)
          .filter(([, quantity]) => quantity > 0)
          .map(([id]) => id),
      ].filter(Boolean);
      if (selectedIds.every((id) => availableIds.has(id))) return "";
      const unavailableNames = selectedIds
        .filter((id) => !availableIds.has(id))
        .map((id) => item.selectionLabels?.[id] || id)
        .filter(Boolean);
      return `${index + 1}. ${item.title}: ${unavailableNames.join("、") || item.summary.join(" / ")}`;
    })
    .filter(Boolean);
}

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
  selectionLabels: Record<string, string>;
};

type BowlSelections = {
  spice: string;
  heat: string;
  numb: string;
  flavors: string[];
  items: Record<string, number>;
};

export type MalatangMenu = {
  baseSoup: MenuChoice & {
    isAvailable?: boolean;
    websiteEnabled?: boolean;
  };
  medicinalSpiceOptions: MenuChoice[];
  heatLevels: MenuChoice[];
  numbLevels: MenuChoice[];
  specialFlavors: MenuChoice[];
  menuSections: MenuSection[];
  selectedStoreId?: string;
  stores?: Array<{ id: string; label: string; osStoreId?: string }>;
  storeOperation?: {
    reservationsEnabled?: boolean;
    statusNote?: string;
    minimumPickupMinutes?: number | null;
  };
  source?: string;
};

export function MalatangOrderBuilder({ initialMenu }: { initialMenu: MalatangMenu }) {
  const { language, t } = useI18n();
  const initialPickup = useMemo(
    () => getMinimumPickupDateTime(normalizeMinimumPickupMinutes(initialMenu.storeOperation?.minimumPickupMinutes)),
    [initialMenu.storeOperation?.minimumPickupMinutes],
  );
  const [menu, setMenu] = useState(initialMenu);
  const [spice, setSpice] = useState(defaultChoiceId(initialMenu.medicinalSpiceOptions));
  const [heat, setHeat] = useState(defaultChoiceId(initialMenu.heatLevels, "normal"));
  const [numb, setNumb] = useState(defaultChoiceId(initialMenu.numbLevels, "tiny"));
  const [flavors, setFlavors] = useState<string[]>([]);
  const [items, setItems] = useState<Record<string, number>>({});
  const [minimumPickup, setMinimumPickup] = useState(initialPickup);
  const [pickupDate, setPickupDate] = useState(initialPickup.date);
  const [pickupTime, setPickupTime] = useState(initialPickup.time);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pickupError, setPickupError] = useState("");
  const [menuNotice, setMenuNotice] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [showCheckoutFallback, setShowCheckoutFallback] = useState(false);
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);
  const [lastAddedTotal, setLastAddedTotal] = useState<number | null>(null);
  const menuSignatureRef = useRef(menuSignature(initialMenu));
  const { baseSoup, medicinalSpiceOptions, heatLevels, numbLevels, specialFlavors, menuSections } = menu;
  const minimumPickupMinutes = normalizeMinimumPickupMinutes(menu.storeOperation?.minimumPickupMinutes);

  const allChoices = useMemo(
    () => [
      ...medicinalSpiceOptions,
      ...heatLevels,
      ...numbLevels,
      ...specialFlavors,
      ...menuSections.flatMap((section) => section.items),
    ],
    [heatLevels, medicinalSpiceOptions, menuSections, numbLevels, specialFlavors],
  );
  const choiceMap = useMemo(() => new Map(allChoices.map((choice) => [choice.id, choice])), [allChoices]);
  const openChoiceIds = useMemo(() => new Set(allChoices.map((choice) => choice.id)), [allChoices]);
  const isChoiceOpen = (id: string) => openChoiceIds.has(id);
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
  const baseUnavailable = baseSoup.websiteEnabled === false || baseSoup.isAvailable === false;
  const reservationsPaused = menu.storeOperation?.reservationsEnabled === false;
  const reservationPauseMessage = menu.storeOperation?.statusNote
    ? `現在予約受付を停止しています（${menu.storeOperation.statusNote}）。店頭での受付状況は店舗へご確認ください。`
    : "現在予約受付を停止しています。店頭での受付状況は店舗へご確認ください。";
  const reserveButtonLabel = checkoutUrl
    ? t("決済ページへ移動中...")
    : isSubmitting
    ? t("送信中...")
    : reservationsPaused
      ? t("現在予約受付を停止しています")
    : baseUnavailable
      ? t("現在このメニューは販売停止中")
    : !cartItems.length
      ? t("メニューを追加してください")
      : cartItems.some((item) => item.total < minimumBowlTotal)
        ? t(minimumBowlTotalError)
      : !name || !phone
        ? t("お名前・電話番号を入力")
        : t("支払いへ進む");
  const pickupTimeErrorMessage = t(`受け取り時間は現在時刻から${minimumPickupMinutes}分後以降を選択してください。`);

  const enforceMinimumPickup = (nextDate: string, nextTime: string) => {
    const nextMinimum = getMinimumPickupDateTime(minimumPickupMinutes);
    const safeDate = nextDate < nextMinimum.date ? nextMinimum.date : nextDate;
    const safeTime =
      safeDate === nextMinimum.date && (!nextTime || nextTime < nextMinimum.time)
        ? nextMinimum.time
        : nextTime || nextMinimum.time;

    setMinimumPickup(nextMinimum);
    setPickupDate(safeDate);
    setPickupTime(safeTime);

    const changed = safeDate !== nextDate || safeTime !== nextTime;
    setPickupError(changed ? pickupTimeErrorMessage : "");
    return { safeDate, safeTime, changed };
  };

  useEffect(() => {
    let active = true;

    const loadMenu = (showNotice: boolean) => {
      fetch("/api/menu?store=shimizu", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((body) => {
        if (!active) return;
        if (body?.baseSoup && Array.isArray(body.menuSections)) {
          const nextMenu = body as MalatangMenu;
          const nextSignature = menuSignature(nextMenu);
          const changed = menuSignatureRef.current !== nextSignature;
          setMenu(nextMenu);
          menuSignatureRef.current = nextSignature;
          if (showNotice && changed) {
            const affected = unavailableCartItemLabels(cartItems, nextMenu);
            setMenuNotice(
              affected.length
                ? `${menuRefreshNotice} 現在選べないトッピング・オプションが含まれています。対象: ${affected.join("、")}。予約リストから該当する一杯を削除して、もう一度選び直してください。`
                : menuRefreshNotice,
            );
          }
        }
        })
        .catch(() => {});
    };

    loadMenu(false);
    const interval = window.setInterval(() => loadMenu(true), menuRefreshIntervalMs);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [cartItems]);

  useEffect(() => {
    if (!menuNotice) return;
    const timeout = window.setTimeout(() => setMenuNotice(""), 9000);
    return () => window.clearTimeout(timeout);
  }, [menuNotice]);

  useEffect(() => {
    const updateMinimumPickup = () => {
      const nextMinimum = getMinimumPickupDateTime(minimumPickupMinutes);
      const nextPickupDate = pickupDate < nextMinimum.date ? nextMinimum.date : pickupDate;
      setMinimumPickup(nextMinimum);
      setPickupDate(nextPickupDate);
      setPickupTime((currentTime) =>
        nextPickupDate === nextMinimum.date && (!currentTime || currentTime < nextMinimum.time) ? nextMinimum.time : currentTime,
      );
      setPickupError((current) => {
        const selectedTime = pickupDate === nextMinimum.date && pickupTime < nextMinimum.time;
        return selectedTime ? pickupTimeErrorMessage : current;
      });
    };

    const interval = window.setInterval(updateMinimumPickup, 30000);
    return () => window.clearInterval(interval);
  }, [minimumPickupMinutes, pickupDate]);

  useEffect(() => {
    setFlavors((current) => current.filter((id) => isChoiceOpen(id)));
    setItems((current) =>
      Object.fromEntries(Object.entries(current).filter(([id]) => isChoiceOpen(id))),
    );
    if (!isChoiceOpen(spice)) setSpice(defaultChoiceId(medicinalSpiceOptions));
    if (!isChoiceOpen(heat)) setHeat(defaultChoiceId(heatLevels, "normal"));
    if (!isChoiceOpen(numb)) setNumb(defaultChoiceId(numbLevels, "tiny"));
  }, [heat, heatLevels, medicinalSpiceOptions, numb, numbLevels, openChoiceIds, spice]);

  const toggleFlavor = (id: string) => {
    setFlavors((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : current.length >= 6 ? current : [...current, id],
    );
  };

  const getSectionSelectedCount = (section: MenuSection, nextItems = items) =>
    section.items.reduce((sum, item) => sum + Math.max(0, Math.round(Number(nextItems[item.id]) || 0)), 0);

  const changeQuantity = (section: MenuSection, id: string, delta: number) => {
    setItems((current) => {
      const next = Math.max(0, (current[id] || 0) + delta);
      if (delta > 0 && getSectionSelectedCount(section, current) >= section.limit) {
        setSubmitError(t(sectionSelectionLimitError(section.title, section.limit)));
        return current;
      }
      const copy = { ...current };
      if (next) copy[id] = next;
      else delete copy[id];
      setSubmitError("");
      return copy;
    });
  };

  const resetCurrentBowl = () => {
    setSpice(defaultChoiceId(medicinalSpiceOptions));
    setHeat(defaultChoiceId(heatLevels, "normal"));
    setNumb(defaultChoiceId(numbLevels, "tiny"));
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

  const buildCurrentSelectionLabels = () => Object.fromEntries([
    selectedSpice ? [selectedSpice.id, t(selectedSpice.name)] : null,
    selectedHeat ? [selectedHeat.id, t(selectedHeat.name)] : null,
    selectedNumb ? [selectedNumb.id, t(selectedNumb.name)] : null,
    ...selectedFlavors.map((item) => [item.id, t(item.name)]),
    ...selectedItems.map((item) => [item.id, `${t(item.name)} x${item.quantity}`]),
  ].filter(Boolean) as Array<[string, string]>);

  const addCurrentBowl = () => {
    if (baseUnavailable) return;
    const bowlNumber = cartItems.length + 1;
    const currentTotal = total;
    if (currentTotal < minimumBowlTotal) {
      setSubmitError(t(minimumBowlTotalError));
      return;
    }
    const nextItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: `${t(baseSoup.name)} #${bowlNumber}`,
      total: currentTotal,
      summary: buildCurrentSummary(),
      selections: getCurrentSelections(),
      selectionLabels: buildCurrentSelectionLabels(),
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
    const underMinimumItems = cartItems
      .map((item, index) => (item.total < minimumBowlTotal ? `${index + 1}. ${item.title} ${yen(item.total)}` : ""))
      .filter(Boolean);
    if (underMinimumItems.length) {
      setSubmitError(t(`${minimumBowlTotalError} 対象: ${underMinimumItems.join("、")}`));
      return;
    }
    if (reservationsPaused) {
      setSubmitError(t(reservationPauseMessage));
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setCheckoutUrl("");
    setShowCheckoutFallback(false);
    try {
      const nextMinimum = getMinimumPickupDateTime(minimumPickupMinutes);
      if (compareDateTime(pickupDate, pickupTime, nextMinimum.date, nextMinimum.time) < 0) {
        const { safeDate, safeTime } = enforceMinimumPickup(pickupDate, pickupTime);
        setSubmitError(t(`受け取り時間は現在時刻から${minimumPickupMinutes}分後以降を選択してください。最短 ${safeDate} ${safeTime} です。`));
        return;
      }
      const safePickupDate = pickupDate;
      const safePickupTime = pickupTime || nextMinimum.time;
      setMinimumPickup(nextMinimum);
      setPickupDate(safePickupDate);
      setPickupTime(safePickupTime);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          pickupDate: safePickupDate,
          pickupTime: safePickupTime,
          note,
          total: cartTotal,
          items: cartItems,
          language,
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        setSubmitError(t(getSubmitErrorMessage(body as Record<string, unknown>)));
        return;
      }
      const nextReservation = {
        orderId: body.order?.orderId || "",
        code: body.order?.pickupCode || `M-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "pending" as const,
        createdAt: body.order?.createdAt || new Date().toISOString(),
        name,
        phone,
        pickupDate: safePickupDate,
        pickupTime: safePickupTime,
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
        setCheckoutUrl(body.checkoutUrl);
        window.setTimeout(() => setShowCheckoutFallback(true), 3000);
        window.setTimeout(() => {
          window.location.href = body.checkoutUrl;
        }, 100);
      } else if (body.orderUrl) {
        window.location.href = body.orderUrl;
      }
    } catch {
      setSubmitError(t(defaultSubmitError));
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
            <input
              type="date"
              min={minimumPickup.date}
              value={pickupDate}
              onChange={(event) => enforceMinimumPickup(event.target.value, pickupTime)}
            />
          </label>
          <label>
            {t("受け取り時間")}
            <input
              type="time"
              min={pickupDate === minimumPickup.date ? minimumPickup.time : undefined}
              value={pickupTime}
              onBlur={(event) => enforceMinimumPickup(pickupDate, event.target.value)}
              onChange={(event) => enforceMinimumPickup(pickupDate, event.target.value)}
            />
          </label>
          {pickupError ? <p className="formError">{pickupError}</p> : null}
          <label>
            {t("メモ")}
            <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={t("香菜なし、袋分けなど")} />
          </label>
        </div>
        <button className="button primary reserveButton" disabled={reservationsPaused || baseUnavailable || !name || !phone || !cartItems.length || cartItems.some((item) => item.total < minimumBowlTotal) || isSubmitting || Boolean(checkoutUrl)} onClick={createReservation}>
          {reserveButtonLabel}
        </button>
        {checkoutUrl && showCheckoutFallback ? (
          <a className="button primary reserveButton" href={checkoutUrl}>
            {t("KOMOJUで支払う")}
          </a>
        ) : null}
        {reservationsPaused ? <p className="reservationClosedNotice">{t(reservationPauseMessage)}</p> : null}
        {submitError ? <p className="formError">{submitError}</p> : null}
        {menuNotice ? <p className="menuNotice">{t(menuNotice)}</p> : null}
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
          <button className="button primary" type="button" disabled={baseUnavailable} onClick={addCurrentBowl}>
            {total < minimumBowlTotal ? t(`${yen(minimumBowlTotal)}以上で追加`) : editingCartItemId ? t("変更を保存") : lastAddedTotal !== null ? t("追加しました") : t("予約リストに追加")}
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
              {section.items.filter((item) => isChoiceOpen(item.id)).map((item) => {
                const sectionSelectedCount = getSectionSelectedCount(section);
                const canIncrease = sectionSelectedCount < section.limit;
                return (
                <div className="toppingRow" key={item.id}>
                  <div>
                    <strong>
                      <OptionName item={item} />
                    </strong>
                    <span>{yen(item.price)}</span>
                  </div>
                  <div className="quantityControl">
                    <button type="button" onClick={() => changeQuantity(section, item.id, -1)}>
                      -
                    </button>
                    <span>{items[item.id] || 0}</span>
                    <button type="button" onClick={() => changeQuantity(section, item.id, 1)} disabled={!canIncrease}>
                      +
                    </button>
                  </div>
                </div>
                );
              })}
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
