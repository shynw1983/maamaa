"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MenuChoice, MenuSection } from "@/data/malatang-menu";
import { useI18n } from "@/components/i18n-provider";
import { localizedPath } from "@/components/localized-path";
import { buildMemberHandoffUrl, consumeMemberHandoff, hasRecentMemberSignOut, type MemberProfile } from "@/components/member-session";
import type { BrandSiteSection } from "@/server/brand-site-source";

const yen = (price: number) => `¥${price.toLocaleString("ja-JP")}`;
const formatTemplate = (template: string, values: Record<string, string>) =>
  Object.entries(values).reduce((text, [key, value]) => text.split(`{${key}}`).join(value), template);
const defaultMinimumPickupMinutes = 15;
// Conservative launch setting while staffing/opening time is unstable; consider allowing pre-open reservations after operations stabilize.
const sameDayReceptionStartTime = "12:00";
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
const getSameDayMinimumPickupDateTime = (leadMinutes = defaultMinimumPickupMinutes) =>
  getMinimumPickupDateTime(leadMinutes);
const getReservationWindowsForDate = (windows: ReservationWindow[] | undefined, date: string) =>
  (Array.isArray(windows) ? windows : [])
    .filter((window) => window.date === date && /^\d{2}:\d{2}$/.test(window.start) && /^\d{2}:\d{2}$/.test(window.end) && window.end > window.start)
    .sort((left, right) => left.start.localeCompare(right.start));
const getSelectableReservationWindows = (windows: ReservationWindow[], minimumDate: string, minimumTime: string) =>
  windows
    .map((window) => ({
      ...window,
      start: window.date === minimumDate && window.start < minimumTime ? minimumTime : window.start,
    }))
    .filter((window) => `${window.date}T${window.end}` >= `${minimumDate}T${minimumTime}` && window.end >= window.start)
    .sort((left, right) => `${left.date}T${left.start}`.localeCompare(`${right.date}T${right.start}`));
const formatReservationWindows = (windows: ReservationWindow[]) =>
  windows.length ? windows.map((window) => `${window.start}-${window.end}`).join(" / ") : "";
const isPickupInReservationWindows = (time: string, windows: ReservationWindow[]) =>
  windows.some((window) => time >= window.start && time <= window.end);
const clampPickupToReservationWindows = (time: string, windows: ReservationWindow[]) => {
  if (!windows.length) return time;
  const containingWindow = windows.find((window) => time >= window.start && time <= window.end);
  if (containingWindow) return time;
  const nextWindow = windows.find((window) => time < window.start);
  return nextWindow?.start ?? windows[windows.length - 1].end;
};
const getPickupTimeFromSchedule = (time: string, windows: ReservationWindow[]) =>
  windows.length ? clampPickupToReservationWindows(time, windows) : "";
const sectionSelectionLimitError = (sectionTitle: string, limit: number) =>
  `${sectionTitle}は${limit}個まで選択できます。数量を減らしてから、もう一度お試しください。`;
const optionPrice = (price: number) => `+${yen(price)}`;
const isRecommended = (item: MenuChoice) => item.note === "おすすめ";
const stripEmoji = (value: string) =>
  value
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D\u20E3]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
const menuDisplayName = (
  item: {
    name?: string;
    title?: string;
    displayNames?: Record<string, string>;
    promotionPrefix?: string;
    promotionPrefixDisplayNames?: Record<string, string>;
    showPromotionPrefix?: boolean;
    showEmoji?: boolean;
  } | undefined,
  language: string,
  t: (value: string) => string,
  fallback = "",
) => {
  const original = fallback || item?.name || item?.title || "";
  const name = language === "ja"
    ? t(original)
    : item?.displayNames?.[language] || item?.displayNames?.en || t(original);
  const prefix = item?.showPromotionPrefix === false
    ? ""
    : language === "ja"
      ? item?.promotionPrefix || ""
      : item?.promotionPrefixDisplayNames?.[language] || item?.promotionPrefixDisplayNames?.en || "";
  const value = `${prefix}${name}`;
  return item?.showEmoji === false ? stripEmoji(value) : value;
};
const defaultChoiceId = (items: MenuChoice[], preferredId = "") =>
  items.find((item) => item.id === preferredId)?.id || items[0]?.id || "";
const defaultSubmitError = "予約を送信できませんでした。時間をおいてからもう一度お試しください。";
const unsafeErrorPattern = /(FOUNDR1|Foundr1|KOMOJU|Square|configured|configuration|Invalid|Missing|Unknown|Not found|checkout session|failed|required)/i;
const minimumBowlTotalError = `一杯あたり${yen(minimumBowlTotal)}以上になるように具材を追加してください。`;
const unavailableSelectionError = "選択したトッピング・オプションの一部が現在販売停止または品切れです。予約リストから該当する一杯を削除して、もう一度選び直してください。";
const menuRefreshNotice = "メニュー状態が更新されました。販売中の内容を最新にしました。";
const draftStorageKey = "maamaa-shimizu-menu-draft-v2";
const textValue = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const memberContactName = (profile: MemberProfile) =>
  textValue(profile.fullName) || [textValue(profile.lastName), textValue(profile.firstName)].filter(Boolean).join(" ") || textValue(profile.displayName);
const getCouponDiscountAmount = (coupon: MemberCoupon, subtotal: number) => {
  const baseAmount = Math.max(0, Math.round(Number(subtotal) || 0));
  const value = Math.max(0, Math.round(Number(coupon.discountValue) || 0));
  const maxAmount = coupon.maxDiscountAmount == null ? null : Math.max(0, Math.round(Number(coupon.maxDiscountAmount) || 0));
  const rawDiscount = coupon.discountType === "percent" ? Math.floor(baseAmount * value / 100) : value;
  return Math.min(baseAmount, maxAmount == null ? rawDiscount : Math.min(rawDiscount, maxAmount));
};
const formatCouponValue = (coupon: MemberCoupon) => {
  if (coupon.discountType === "percent") {
    return coupon.maxDiscountAmount ? `${coupon.discountValue}% OFF / 最大${yen(coupon.maxDiscountAmount)}` : `${coupon.discountValue}% OFF`;
  }
  return `${yen(coupon.discountValue)} OFF`;
};

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
  const message = String(body?.error || "");
  if (!message || unsafeErrorPattern.test(message)) return defaultSubmitError;
  return message;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

const sanitizeSelections = (value: unknown): BowlSelections | null => {
  if (!isRecord(value)) return null;
  const items = isRecord(value.items)
    ? Object.fromEntries(
        Object.entries(value.items)
          .map(([id, quantity]): [string, number] => [id, Math.max(0, Math.round(Number(quantity) || 0))])
          .filter(([, quantity]) => quantity > 0),
      )
    : {};
  return {
    productId: typeof value.productId === "string" ? value.productId : "",
    noodleChanges: isRecord(value.noodleChanges)
      ? Object.fromEntries(
          Object.entries(value.noodleChanges)
            .map(([id, quantity]): [string, number] => [id, Math.max(0, Math.round(Number(quantity) || 0))])
            .filter(([, quantity]) => quantity > 0),
        )
      : {},
    spice: typeof value.spice === "string" ? value.spice : "",
    heat: typeof value.heat === "string" ? value.heat : "",
    numb: typeof value.numb === "string" ? value.numb : "",
    flavors: Array.isArray(value.flavors) ? value.flavors.filter((id): id is string => typeof id === "string") : [],
    items,
  };
};

const sanitizeCartItems = (value: unknown): CartItem[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!isRecord(item) || typeof item.id !== "string") return null;
      const selections = sanitizeSelections(item.selections);
      if (!selections) return null;
      return {
        id: item.id,
        title: typeof item.title === "string" ? item.title : "",
        total: Math.max(0, Math.round(Number(item.total) || 0)),
        summary: Array.isArray(item.summary) ? item.summary.map(String).filter(Boolean) : [],
        selections,
        selectionLabels: isRecord(item.selectionLabels)
          ? Object.fromEntries(Object.entries(item.selectionLabels).map(([id, label]) => [id, String(label)]))
          : {},
        minimumOrderAmount: Math.max(0, Number(item.minimumOrderAmount ?? minimumBowlTotal) || 0),
      };
    })
    .filter((item): item is CartItem => Boolean(item));
};

function menuSignature(menu: MalatangMenu) {
  const productSignature = (item: MenuChoice & {
    isAvailable?: boolean;
    websiteEnabled?: boolean;
    category?: string;
    customizationGroupKeys?: string[];
    minimumOrderAmount?: number;
  }) => [
    item.id,
    item.name,
    item.displayNames,
    item.promotionPrefix,
    item.promotionPrefixDisplayNames,
    item.showPromotionPrefix,
    item.showEmoji,
    item.price,
    item.isAvailable,
    item.websiteEnabled,
    item.category,
    item.customizationGroupKeys,
    item.minimumOrderAmount,
  ];
  return JSON.stringify({
    base: productSignature(menu.baseSoup),
    presets: menu.presetSoups.map(productSignature),
    noodleReplacements: menu.noodleReplacementOptions.map((item) => [item.id, item.price]),
    noodleReplacementRule: menu.noodleReplacementRule,
    spice: menu.medicinalSpiceOptions.map((item) => [item.id, item.price]),
    heat: menu.heatLevels.map((item) => [item.id, item.price]),
    numb: menu.numbLevels.map((item) => [item.id, item.price]),
    flavors: menu.specialFlavors.map((item) => [item.id, item.price]),
    sections: menu.menuSections.map((section) => [section.id, section.limit, section.perOptionMax, section.items.map((item) => [item.id, item.price])]),
  });
}

function unavailableCartItemLabels(cartItems: CartItem[], menu: MalatangMenu) {
  const availableIds = new Set([
    ...[menu.baseSoup, ...menu.presetSoups]
      .filter((item) => item.websiteEnabled !== false && item.isAvailable !== false)
      .map((item) => item.id),
    ...menu.medicinalSpiceOptions.map((item) => item.id),
    ...menu.heatLevels.map((item) => item.id),
    ...menu.numbLevels.map((item) => item.id),
    ...menu.specialFlavors.map((item) => item.id),
    ...menu.noodleReplacementOptions.map((item) => item.id),
    ...menu.menuSections.flatMap((section) => section.items.map((item) => item.id)),
  ]);

  return cartItems
    .map((item, index) => {
      const selectedIds = [
        item.selections.productId,
        ...Object.entries(item.selections.noodleChanges)
          .filter(([, quantity]) => quantity > 0)
          .map(([id]) => id),
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
  minimumOrderAmount: number;
};

type BowlSelections = {
  productId: string;
  noodleChanges: Record<string, number>;
  spice: string;
  heat: string;
  numb: string;
  flavors: string[];
  items: Record<string, number>;
};

type OrderDraft = {
  cartItems?: CartItem[];
  currentSelections?: BowlSelections;
  pickupDate?: string;
  pickupTime?: string;
  shortagePreference?: "substitute_or_refund" | "refund" | "";
};

type MemberCoupon = NonNullable<MemberProfile["coupons"]>[number];

type MenuGroupLabel = {
  id: string;
  name: string;
  displayNames?: Record<string, string>;
};

type ReservationWindow = {
  date: string;
  start: string;
  end: string;
};

export type MalatangMenu = {
  baseSoup: MenuChoice & {
    isAvailable?: boolean;
    websiteEnabled?: boolean;
    noteDisplayNames?: Record<string, string>;
    category?: string;
    customizationGroupKeys?: string[];
    minimumOrderAmount?: number;
  };
  medicinalSpiceGroup?: MenuGroupLabel;
  medicinalSpiceOptions: MenuChoice[];
  heatGroup?: MenuGroupLabel;
  heatLevels: MenuChoice[];
  numbGroup?: MenuGroupLabel;
  numbLevels: MenuChoice[];
  specialFlavorGroup?: MenuGroupLabel;
  specialFlavors: MenuChoice[];
  presetSoups: Array<MenuChoice & {
    category: string;
    defaultNoodle: string;
    customizationGroupKeys?: string[];
    minimumOrderAmount?: number;
    isAvailable?: boolean;
    websiteEnabled?: boolean;
  }>;
  menuCategories?: Array<{ id: string; name: string; sortOrder: number }>;
  noodleReplacementOptions: MenuChoice[];
  noodleReplacementRule: {
    limit: number;
    perOptionMax: number;
  };
  menuSections: MenuSection[];
  selectedStoreId?: string;
  stores?: Array<{ id: string; label: string; osStoreId?: string }>;
  storeOperation?: {
    reservationsEnabled?: boolean;
    statusNote?: string;
    minimumPickupMinutes?: number | null;
    reservationWindows?: ReservationWindow[];
  };
  source?: string;
};

export function MalatangOrderBuilder({
  initialMenu,
  siteContent = {},
}: {
  initialMenu: MalatangMenu;
  siteContent?: {
    reservationSummary?: BrandSiteSection;
  };
}) {
  const { language, t } = useI18n();
  const reservationSummary = siteContent.reservationSummary;
  const menuText = (item: {
    name?: string;
    title?: string;
    displayNames?: Record<string, string>;
    promotionPrefix?: string;
    promotionPrefixDisplayNames?: Record<string, string>;
    showPromotionPrefix?: boolean;
    showEmoji?: boolean;
  } | undefined, fallback = "") =>
    menuDisplayName(item, language, t, fallback);
  const initialPickup = useMemo(
    () => {
      const minimum = getSameDayMinimumPickupDateTime(normalizeMinimumPickupMinutes(initialMenu.storeOperation?.minimumPickupMinutes));
      const windows = getSelectableReservationWindows(
        initialMenu.storeOperation?.reservationWindows ?? [],
        minimum.date,
        minimum.time,
      );
      return windows.length
        ? { date: windows[0].date, time: windows[0].start }
        : { date: minimum.date, time: "" };
    },
    [initialMenu.storeOperation?.minimumPickupMinutes, initialMenu.storeOperation?.reservationWindows],
  );
  const [menu, setMenu] = useState(initialMenu);
  const [productId, setProductId] = useState(initialMenu.baseSoup.id);
  const [noodleChanges, setNoodleChanges] = useState<Record<string, number>>({});
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
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [selectedCouponId, setSelectedCouponId] = useState("");
  const [shortagePreference, setShortagePreference] = useState<"substitute_or_refund" | "refund" | "">("");
  const [memberHref, setMemberHref] = useState("https://foundr1.jp/member");
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
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const menuSignatureRef = useRef(menuSignature(initialMenu));
  const cartItemsRef = useRef(cartItems);
  const reserveButtonRef = useRef<HTMLButtonElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const {
    baseSoup,
    medicinalSpiceGroup,
    medicinalSpiceOptions,
    heatGroup,
    heatLevels,
    numbGroup,
    numbLevels,
    specialFlavorGroup,
    specialFlavors,
    presetSoups,
    noodleReplacementOptions,
    noodleReplacementRule,
    menuSections,
  } = menu;
  const minimumPickupMinutes = normalizeMinimumPickupMinutes(menu.storeOperation?.minimumPickupMinutes);
  const currentTokyo = getTokyoDateTimeParts();
  const selectableReservationWindows = useMemo(
    () => getSelectableReservationWindows(
      menu.storeOperation?.reservationWindows ?? [],
      minimumPickup.date,
      minimumPickup.time,
    ),
    [menu.storeOperation?.reservationWindows, minimumPickup.date, minimumPickup.time],
  );
  const reservationWindows = useMemo(
    () => getReservationWindowsForDate(selectableReservationWindows, pickupDate),
    [pickupDate, selectableReservationWindows],
  );
  const availablePickupDates = useMemo(
    () => Array.from(new Set(selectableReservationWindows.map((window) => window.date))),
    [selectableReservationWindows],
  );
  const hasReservationWindows = reservationWindows.length > 0;
  const earliestReservationTime = reservationWindows[0]?.start ?? minimumPickup.time;
  const latestReservationTime = reservationWindows[reservationWindows.length - 1]?.end ?? minimumPickup.time;
  const reservationWindowLabel = formatReservationWindows(reservationWindows);
  const isPickupOutsideReservationWindows = hasReservationWindows ? !isPickupInReservationWindows(pickupTime, reservationWindows) : true;
  const hasOvernightContinuation = (menu.storeOperation?.reservationWindows ?? []).some(
    (window) => window.date === currentTokyo.date && window.start <= currentTokyo.time && window.end >= currentTokyo.time,
  );
  const isBeforeSameDayReception = currentTokyo.time < sameDayReceptionStartTime && !hasOvernightContinuation;
  const isAfterSameDayReception = selectableReservationWindows.length === 0;
  const sameDayBookingClosed = isBeforeSameDayReception || isAfterSameDayReception;
  const choiceGroupTitle = (group: MenuGroupLabel | undefined, fallback: string) => {
    const groupName = menuText(group, fallback);
    return t("{name}を選ぶ").replace("{name}", groupName);
  };
  const productNote = (item: MenuChoice) => language === "ja"
    ? t(item.note || "")
    : item.noteDisplayNames?.[language] ||
      item.noteDisplayNames?.en ||
      t(item.note || "");
  const baseSoupNote = productNote(baseSoup);
  const allProducts = useMemo(
    () => [baseSoup, ...presetSoups].filter((item) => item.websiteEnabled !== false),
    [baseSoup, presetSoups],
  );
  const activeProduct = allProducts.find((item) => item.id === productId) || allProducts[0] || baseSoup;
  const isPreset = activeProduct.id !== baseSoup.id;
  const activeGroupKeys = new Set(activeProduct.customizationGroupKeys || []);
  const hasActiveGroup = (key: string) => activeGroupKeys.has(key);
  const activeMinimumOrderAmount = Math.max(0, Number(activeProduct.minimumOrderAmount ?? minimumBowlTotal) || 0);
  const activeProductNote = isPreset ? productNote(activeProduct) : baseSoupNote;
  const showDescriptionToggle = activeProductNote.trim().length > 72 || activeProductNote.split(/\r?\n/).length > 3;
  const visibleMenuSections = menuSections.filter((section) => hasActiveGroup(section.id));

  useEffect(() => {
    setDescriptionExpanded(false);
  }, [activeProduct.id]);
  const groupedProducts = useMemo(() => {
    const categoryById = new Map((menu.menuCategories || []).map((category) => [category.id, category]));
    const groups = new Map<string, typeof allProducts>();
    for (const product of allProducts) {
      const category = product.category || "その他";
      groups.set(category, [...(groups.get(category) || []), product]);
    }
    return Array.from(groups, ([id, products]) => ({
      id,
      name: categoryById.get(id)?.name || id,
      sortOrder: categoryById.get(id)?.sortOrder ?? 9999,
      products,
    })).sort((left, right) => left.sortOrder - right.sortOrder);
  }, [allProducts, menu.menuCategories]);

  const allChoices = useMemo(
    () => [
      ...allProducts,
      ...medicinalSpiceOptions,
      ...heatLevels,
      ...numbLevels,
      ...specialFlavors,
      ...noodleReplacementOptions,
      ...menuSections.flatMap((section) => section.items),
    ],
    [allProducts, heatLevels, medicinalSpiceOptions, menuSections, noodleReplacementOptions, numbLevels, specialFlavors],
  );
  const choiceMap = useMemo(() => new Map(allChoices.map((choice) => [choice.id, choice])), [allChoices]);
  const openChoiceIds = useMemo(() => new Set(allChoices.map((choice) => choice.id)), [allChoices]);
  const isChoiceOpen = (id: string) => openChoiceIds.has(id);
  const selectedSpice = choiceMap.get(spice) || medicinalSpiceOptions[0];
  const selectedHeat = choiceMap.get(heat) || heatLevels[0];
  const selectedNumb = choiceMap.get(numb) || numbLevels[0];
  const selectedNoodleChanges = hasActiveGroup("noodle-replacement")
    ? Object.entries(noodleChanges)
        .map(([id, quantity]) => {
          const item = choiceMap.get(id);
          return item && quantity > 0 && isChoiceOpen(id) ? { ...item, quantity } : null;
        })
        .filter(Boolean) as Array<MenuChoice & { quantity: number }>
    : [];
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
    activeProduct.price +
    selectedNoodleChanges.reduce((sum, item) => sum + item.price * item.quantity, 0) +
    (hasActiveGroup("medicinal-spice") ? selectedSpice.price : 0) +
    (hasActiveGroup("heat") ? selectedHeat.price : 0) +
    (hasActiveGroup("numb") ? selectedNumb.price : 0) +
    (hasActiveGroup("special-flavor") ? selectedFlavors.reduce((sum, item) => sum + item.price, 0) : 0) +
    selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const memberCoupons = memberProfile?.coupons ?? [];
  const selectedCoupon = memberCoupons.find((coupon) => coupon.id === selectedCouponId);
  const couponDiscount = selectedCoupon ? Math.min(getCouponDiscountAmount(selectedCoupon, cartTotal), Math.max(0, cartTotal - 1)) : 0;
  const paymentTotal = Math.max(0, cartTotal - couponDiscount);
  const baseUnavailable = activeProduct.websiteEnabled === false || activeProduct.isAvailable === false;
  const reservationsPaused = menu.storeOperation?.reservationsEnabled === false;
  const reservationPauseMessage = menu.storeOperation?.statusNote
    ? formatTemplate(t("現在予約受付を停止しています（{reason}）。店頭での受付状況は店舗へご確認ください。"), {
        reason: menu.storeOperation.statusNote,
      })
    : t("現在予約受付を停止しています。店頭での受付状況は店舗へご確認ください。");
  const reserveButtonLabel = checkoutUrl
    ? t("決済ページへ移動中...")
    : isSubmitting
    ? t("送信中...")
    : reservationsPaused
      ? t("現在予約受付を停止しています")
    : sameDayBookingClosed
      ? isBeforeSameDayReception
        ? t("本日のWeb予約は準備中です")
        : t("この営業日のWeb予約受付は終了しました")
    : isPickupOutsideReservationWindows
      ? t("受付中の時間を選択してください")
    : baseUnavailable
      ? t("現在このメニューは販売停止中")
    : !cartItems.length
      ? t("メニューを追加してください")
      : cartItems.some((item) => item.total < (item.minimumOrderAmount ?? minimumBowlTotal))
        ? t(minimumBowlTotalError)
      : !name || !phone
        ? t("お名前・電話番号を入力")
        : t("支払いへ進む");
  const pickupTimeErrorMessage = formatTemplate(t("受付中の受け取り時間を選択してください。最短 {datetime} です。"), {
    datetime: `${minimumPickup.date} ${minimumPickup.time}`,
  });
  const pickupSameDayErrorMessage = isBeforeSameDayReception
    ? t("Web予約は店舗の受付状況に合わせて承ります。受付開始までしばらくお待ちください。")
    : t("この営業日のWeb予約受付は終了しました。");
  const getPickupScheduleErrorMessage = (time: string) => {
    if (hasReservationWindows && time > latestReservationTime) {
      return t("この営業日のWeb予約受付は終了しました。");
    }
    if (hasReservationWindows && time < earliestReservationTime) {
      return t("Web予約は店舗の受付状況に合わせて承ります。受付開始までしばらくお待ちください。");
    }
    return formatTemplate(t("選択した受け取り時間は現在の受付枠外です。受付中の時間: {windows}"), {
      windows: reservationWindowLabel || "-",
    });
  };
  const remainingBowlAmount = Math.max(0, activeMinimumOrderAmount - total);
  const addBowlButtonLabel =
    total < activeMinimumOrderAmount
      ? formatTemplate(t("あと{amount}分お選びください"), { amount: yen(remainingBowlAmount) })
      : editingCartItemId
        ? t("変更を保存")
        : lastAddedTotal !== null
          ? t("追加しました")
          : t("予約リストに追加");

  const scrollToPayment = () => {
    reserveButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const enforceMinimumPickup = (nextDate: string, nextTime: string) => {
    const nextMinimum = getSameDayMinimumPickupDateTime(minimumPickupMinutes);
    const nextWindows = getSelectableReservationWindows(
      menu.storeOperation?.reservationWindows ?? [],
      nextMinimum.date,
      nextMinimum.time,
    );
    const nextDates = Array.from(new Set(nextWindows.map((window) => window.date)));
    const safeDate = nextDates.includes(nextDate) ? nextDate : nextDates[0] ?? nextMinimum.date;
    const dateWindows = getReservationWindowsForDate(nextWindows, safeDate);
    const safeTime = nextTime || dateWindows[0]?.start || "";
    const scheduleSafeTime = getPickupTimeFromSchedule(safeTime, dateWindows);

    setMinimumPickup(nextMinimum);
    setPickupDate(safeDate);
    setPickupTime(scheduleSafeTime);

    const changed = safeDate !== nextDate || scheduleSafeTime !== nextTime;
    setPickupError(
      sameDayBookingClosed
        ? ""
        : changed
          ? scheduleSafeTime !== safeTime
            ? getPickupScheduleErrorMessage(safeTime)
            : pickupTimeErrorMessage
          : "",
    );
    return { safeDate, safeTime: scheduleSafeTime, changed };
  };

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  useEffect(() => {
    let active = true;
    let pusher: any;
    let channel: any;
    let fallbackTimer = 0;
    let fallbackStartedAt = Date.now();
    let realtimeConnected = false;

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
            const affected = unavailableCartItemLabels(cartItemsRef.current, nextMenu);
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

    const clearFallback = () => {
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      fallbackTimer = 0;
    };
    const scheduleFallback = () => {
      clearFallback();
      if (!active || realtimeConnected || document.visibilityState !== "visible") return;
      const disconnectedFor = Date.now() - fallbackStartedAt;
      const delay = disconnectedFor >= 15 * 60_000 ? 5 * 60_000 : disconnectedFor >= 5 * 60_000 ? 2 * 60_000 : 60_000;
      fallbackTimer = window.setTimeout(() => {
        loadMenu(true);
        scheduleFallback();
      }, delay);
    };
    const startFallback = (immediate = false) => {
      if (!fallbackStartedAt) fallbackStartedAt = Date.now();
      realtimeConnected = false;
      if (immediate && document.visibilityState === "visible") loadMenu(true);
      scheduleFallback();
    };
    const stopFallback = () => {
      realtimeConnected = true;
      fallbackStartedAt = 0;
      clearFallback();
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState !== "visible") {
        clearFallback();
        return;
      }
      loadMenu(true);
      if (!realtimeConnected) scheduleFallback();
    };

    loadMenu(false);
    scheduleFallback();
    const osStoreId = String(initialMenu.stores?.find((item) => item.osStoreId)?.osStoreId || "").trim();
    fetch(`/api/menu/realtime-config?storeId=${encodeURIComponent(osStoreId)}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then(async (config) => {
        if (!active || !config?.key || !config?.cluster || !config?.menuChannel) return;
        const { default: Pusher } = await import("pusher-js");
        if (!active) return;
        pusher = new Pusher(config.key, { cluster: config.cluster, forceTLS: true });
        pusher.connection.bind("unavailable", () => startFallback(true));
        pusher.connection.bind("failed", () => startFallback(true));
        pusher.connection.bind("disconnected", () => startFallback(true));
        channel = pusher.subscribe(config.menuChannel);
        channel.bind("pusher:subscription_succeeded", () => {
          stopFallback();
          loadMenu(true);
        });
        channel.bind("pusher:subscription_error", () => startFallback(true));
        channel.bind("menu.updated", () => loadMenu(true));
      })
      .catch(() => startFallback());
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      active = false;
      clearFallback();
      channel?.unbind_all?.();
      if (channel) pusher?.unsubscribe(channel.name);
      pusher?.disconnect();
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [initialMenu.stores]);

  useEffect(() => {
    if (!menuNotice) return;
    const timeout = window.setTimeout(() => setMenuNotice(""), 9000);
    return () => window.clearTimeout(timeout);
  }, [menuNotice]);

  useEffect(() => {
    const updateMinimumPickup = () => {
      const nextMinimum = getSameDayMinimumPickupDateTime(minimumPickupMinutes);
      const nextReservationWindows = getSelectableReservationWindows(
        menu.storeOperation?.reservationWindows ?? [],
        nextMinimum.date,
        nextMinimum.time,
      );
      const nextDates = Array.from(new Set(nextReservationWindows.map((window) => window.date)));
      const nextPickupDate = nextDates.includes(pickupDate) ? pickupDate : nextDates[0] ?? nextMinimum.date;
      const nextDateWindows = getReservationWindowsForDate(nextReservationWindows, nextPickupDate);
      const nextTokyo = getTokyoDateTimeParts();
      const nextHasOvernightContinuation = (menu.storeOperation?.reservationWindows ?? []).some(
        (window) => window.date === nextTokyo.date && window.start <= nextTokyo.time && window.end >= nextTokyo.time,
      );
      const nextSameDayBookingClosed =
        (nextTokyo.time < sameDayReceptionStartTime && !nextHasOvernightContinuation) ||
        !nextReservationWindows.length;
      setMinimumPickup(nextMinimum);
      setPickupDate(nextPickupDate);
      setPickupTime((currentTime) => {
        const nextTime = currentTime || nextDateWindows[0]?.start || "";
        return getPickupTimeFromSchedule(nextTime, nextDateWindows);
      });
      setPickupError((current) => {
        if (nextSameDayBookingClosed) return "";
        const selectedTime = pickupDate === nextMinimum.date && pickupTime < nextMinimum.time;
        return selectedTime ? pickupTimeErrorMessage : current;
      });
    };

    updateMinimumPickup();
    const interval = window.setInterval(updateMinimumPickup, 30000);
    return () => window.clearInterval(interval);
  }, [menu.storeOperation?.reservationWindows, minimumPickupMinutes, pickupDate, pickupTime, pickupTimeErrorMessage]);

  useEffect(() => {
    setFlavors((current) => current.filter((id) => isChoiceOpen(id)));
    setItems((current) =>
      Object.fromEntries(Object.entries(current).filter(([id]) => isChoiceOpen(id))),
    );
    if (!isChoiceOpen(spice)) setSpice(defaultChoiceId(medicinalSpiceOptions));
    if (!isChoiceOpen(heat)) setHeat(defaultChoiceId(heatLevels, "normal"));
    if (!isChoiceOpen(numb)) setNumb(defaultChoiceId(numbLevels, "tiny"));
    const selectedProduct = allProducts.find((item) => item.id === productId);
    if (!selectedProduct || selectedProduct.isAvailable === false) {
      const firstAvailableProduct = allProducts.find((item) => item.isAvailable !== false);
      setProductId(firstAvailableProduct?.id || baseSoup.id);
    }
    setNoodleChanges((current) =>
      Object.fromEntries(Object.entries(current).filter(([id]) => isChoiceOpen(id))),
    );
  }, [allProducts, baseSoup.id, heat, heatLevels, medicinalSpiceOptions, numb, numbLevels, openChoiceIds, productId, spice]);

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
        setSubmitError(t(sectionSelectionLimitError(menuText(section, section.title), section.limit)));
        return current;
      }
      if (delta > 0 && next > section.perOptionMax) return current;
      const copy = { ...current };
      if (next) copy[id] = next;
      else delete copy[id];
      setSubmitError("");
      return copy;
    });
  };

  const changeNoodleQuantity = (id: string, delta: number) => {
    setNoodleChanges((current) => {
      const selectedCount = Object.values(current).reduce((sum, quantity) => sum + quantity, 0);
      const next = Math.max(0, (current[id] || 0) + delta);
      if (delta > 0 && selectedCount >= noodleReplacementRule.limit) {
        setSubmitError(t(sectionSelectionLimitError(t("麺の種類を変更する"), noodleReplacementRule.limit)));
        return current;
      }
      if (delta > 0 && next > noodleReplacementRule.perOptionMax) return current;
      const copy = { ...current };
      if (next) copy[id] = next;
      else delete copy[id];
      setSubmitError("");
      return copy;
    });
  };

  const selectProduct = (id: string) => {
    if (id === productId) return;
    setProductId(id);
    setNoodleChanges({});
    setItems({});
    setSubmitError("");
  };

  const resetCurrentBowl = () => {
    setProductId(baseSoup.id);
    setNoodleChanges({});
    setSpice(defaultChoiceId(medicinalSpiceOptions));
    setHeat(defaultChoiceId(heatLevels, "normal"));
    setNumb(defaultChoiceId(numbLevels, "tiny"));
    setFlavors([]);
    setItems({});
    setEditingCartItemId(null);
  };

  const getCurrentSelections = (): BowlSelections => ({
    productId: activeProduct.id,
    noodleChanges: isPreset ? noodleChanges : {},
    spice: hasActiveGroup("medicinal-spice") ? spice : "",
    heat: hasActiveGroup("heat") ? heat : "",
    numb: hasActiveGroup("numb") ? numb : "",
    flavors: hasActiveGroup("special-flavor") ? flavors : [],
    items,
  });

  const applySelections = (selections: BowlSelections) => {
    setProductId(selections.productId || baseSoup.id);
    setNoodleChanges(selections.noodleChanges);
    setSpice(selections.spice);
    setHeat(selections.heat);
    setNumb(selections.numb);
    setFlavors(selections.flavors);
    setItems(selections.items);
  };

  const buildCurrentSummary = () =>
    [
      hasActiveGroup("medicinal-spice") ? menuText(selectedSpice) : "",
      hasActiveGroup("heat") ? menuText(selectedHeat) : "",
      hasActiveGroup("numb") ? menuText(selectedNumb) : "",
      ...selectedNoodleChanges.map((item) => `麺の変更: ${menuText(item)} x${item.quantity}`),
      ...(hasActiveGroup("special-flavor") ? selectedFlavors.map((item) => menuText(item)) : []),
      ...selectedItems.map((item) => `${menuText(item)} x${item.quantity}`),
    ].filter(Boolean);

  const buildCurrentSelectionLabels = () => Object.fromEntries([
    selectedSpice ? [selectedSpice.id, menuText(selectedSpice)] : null,
    selectedHeat ? [selectedHeat.id, menuText(selectedHeat)] : null,
    selectedNumb ? [selectedNumb.id, menuText(selectedNumb)] : null,
    ...selectedNoodleChanges.map((item) => [item.id, `${menuText(item)} x${item.quantity}`]),
    ...selectedFlavors.map((item) => [item.id, menuText(item)]),
    ...selectedItems.map((item) => [item.id, `${menuText(item)} x${item.quantity}`]),
  ].filter(Boolean) as Array<[string, string]>);

  const formatCartItemTitle = (item: CartItem, index: number) => `${item.title || menuText(baseSoup)} #${index + 1}`;

  const formatCartChoiceLabel = (item: CartItem, id: string, quantity?: number) => {
    const choice = choiceMap.get(id);
    const baseLabel = choice ? menuText(choice) : item.selectionLabels[id] || id;
    return quantity ? `${baseLabel} x${quantity}` : baseLabel;
  };

  const formatCartItemSummary = (item: CartItem) => {
    const selections = item.selections;
    return [
      selections.spice ? formatCartChoiceLabel(item, selections.spice) : "",
      selections.heat ? formatCartChoiceLabel(item, selections.heat) : "",
      selections.numb ? formatCartChoiceLabel(item, selections.numb) : "",
      ...Object.entries(selections.noodleChanges)
        .filter(([, quantity]) => quantity > 0)
        .map(([id, quantity]) => `麺の変更: ${formatCartChoiceLabel(item, id, quantity)}`),
      ...selections.flavors.map((id) => formatCartChoiceLabel(item, id)),
      ...Object.entries(selections.items)
        .filter(([, quantity]) => quantity > 0)
        .map(([id, quantity]) => formatCartChoiceLabel(item, id, quantity)),
    ].filter(Boolean);
  };

  const formatCartSelectionLabels = (item: CartItem) =>
    Object.fromEntries([
      item.selections.spice ? [item.selections.spice, formatCartChoiceLabel(item, item.selections.spice)] : null,
      item.selections.heat ? [item.selections.heat, formatCartChoiceLabel(item, item.selections.heat)] : null,
      item.selections.numb ? [item.selections.numb, formatCartChoiceLabel(item, item.selections.numb)] : null,
      ...Object.entries(item.selections.noodleChanges)
        .filter(([, quantity]) => quantity > 0)
        .map(([id, quantity]) => [id, formatCartChoiceLabel(item, id, quantity)]),
      ...item.selections.flavors.map((id) => [id, formatCartChoiceLabel(item, id)]),
      ...Object.entries(item.selections.items)
        .filter(([, quantity]) => quantity > 0)
        .map(([id, quantity]) => [id, formatCartChoiceLabel(item, id, quantity)]),
    ].filter(Boolean) as Array<[string, string]>);

  const clearContactInputs = (force = false) => {
    const activeElement = document.activeElement;
    if (!force && (activeElement === nameInputRef.current || activeElement === phoneInputRef.current)) return;
    setName("");
    setPhone("");
    if (nameInputRef.current) nameInputRef.current.value = "";
    if (phoneInputRef.current) phoneInputRef.current.value = "";
  };

  useEffect(() => {
    setMemberHref(buildMemberHandoffUrl());
    consumeMemberHandoff()
      .then((profile) => {
        if (!profile) {
          setMemberProfile(null);
          if (hasRecentMemberSignOut()) {
            clearContactInputs(true);
            setSelectedCouponId("");
          } else {
            clearContactInputs();
            window.setTimeout(() => clearContactInputs(), 80);
            window.setTimeout(() => clearContactInputs(), 400);
          }
          return;
        }
        setMemberProfile(profile);
        setName(memberContactName(profile));
        setPhone((current) => current || profile.phone || "");
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!memberProfile) return;
    const contactName = memberContactName(memberProfile);
    if (contactName) setName(contactName);
  }, [memberProfile]);

  useEffect(() => {
    if (!selectedCouponId) return;
    if (!memberCoupons.some((coupon) => coupon.id === selectedCouponId)) setSelectedCouponId("");
  }, [memberCoupons, selectedCouponId]);

  useEffect(() => {
    try {
      const rawDraft = window.sessionStorage.getItem(draftStorageKey);
      if (!rawDraft) return;
      const draft = JSON.parse(rawDraft) as OrderDraft;
      const draftSelections = sanitizeSelections(draft.currentSelections);
      const draftCartItems = sanitizeCartItems(draft.cartItems);
      const nextMinimum = getSameDayMinimumPickupDateTime(minimumPickupMinutes);
      const draftPickupDate = typeof draft.pickupDate === "string" ? draft.pickupDate : "";
      const draftPickupTime = typeof draft.pickupTime === "string" ? draft.pickupTime : "";
      const safePickupDate = draftPickupDate && draftPickupDate >= nextMinimum.date ? draftPickupDate : nextMinimum.date;
      const safePickupTime =
        safePickupDate === nextMinimum.date && (!draftPickupTime || draftPickupTime < nextMinimum.time)
          ? nextMinimum.time
          : draftPickupTime || nextMinimum.time;
      const scheduleSafePickupTime = getPickupTimeFromSchedule(safePickupTime, reservationWindows);

      if (draftCartItems.length) setCartItems(draftCartItems);
      if (draftSelections) applySelections(draftSelections);
      setMinimumPickup(nextMinimum);
      setPickupDate(safePickupDate);
      setPickupTime(scheduleSafePickupTime);
      if (draft.shortagePreference === "substitute_or_refund" || draft.shortagePreference === "refund") setShortagePreference(draft.shortagePreference);
    } catch {
      try {
        window.sessionStorage.removeItem(draftStorageKey);
      } catch {
        // Ignore storage cleanup failures.
      }
    } finally {
      setDraftReady(true);
    }
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    const hasDraft =
      cartItems.length > 0 ||
      flavors.length > 0 ||
      Object.keys(items).length > 0;

    try {
      if (!hasDraft) {
        window.sessionStorage.removeItem(draftStorageKey);
        return;
      }
      const draft: OrderDraft = {
        cartItems,
        currentSelections: getCurrentSelections(),
        pickupDate,
        pickupTime,
        shortagePreference,
      };
      window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
    } catch {
      // Continue without draft persistence.
    }
  }, [cartItems, draftReady, flavors, heat, items, noodleChanges, numb, pickupDate, pickupTime, productId, shortagePreference, spice]);

  const addCurrentBowl = () => {
    if (baseUnavailable) return;
    const currentTotal = total;
    if (currentTotal < activeMinimumOrderAmount) {
      setSubmitError(t(`この商品は${yen(activeMinimumOrderAmount)}以上になるようにお選びください。`));
      return;
    }
    const nextItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: menuText(activeProduct),
      total: currentTotal,
      summary: buildCurrentSummary(),
      selections: getCurrentSelections(),
      selectionLabels: buildCurrentSelectionLabels(),
      minimumOrderAmount: activeMinimumOrderAmount,
    };

    if (editingCartItemId) {
      setCartItems((current) =>
        current.map((item) =>
          item.id === editingCartItemId
            ? {
                ...nextItem,
                id: item.id,
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
    if (!shortagePreference) {
      setSubmitError(t("欠品時の対応"));
      return;
    }
    if (!cartItems.length) return;
    const localizedCartItems = cartItems.map((item, index) => ({
      ...item,
      title: formatCartItemTitle(item, index),
      summary: formatCartItemSummary(item),
      selectionLabels: formatCartSelectionLabels(item),
    }));
    const underMinimumItems = localizedCartItems
      .map((item, index) => (item.total < (item.minimumOrderAmount ?? minimumBowlTotal) ? `${index + 1}. ${item.title} ${yen(item.total)}` : ""))
      .filter(Boolean);
    if (underMinimumItems.length) {
      setSubmitError(formatTemplate(t("一杯あたり¥800以上になるように具材を追加してください。対象: {items}"), {
        items: underMinimumItems.join("、"),
      }));
      return;
    }
    if (reservationsPaused) {
      setSubmitError(reservationPauseMessage);
      return;
    }
    if (sameDayBookingClosed) {
      setSubmitError(pickupSameDayErrorMessage);
      return;
    }
    if (isPickupOutsideReservationWindows) {
      enforceMinimumPickup(pickupDate, pickupTime);
      setSubmitError(getPickupScheduleErrorMessage(pickupTime));
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setCheckoutUrl("");
    setShowCheckoutFallback(false);
    try {
      const nextMinimum = getSameDayMinimumPickupDateTime(minimumPickupMinutes);
      if (compareDateTime(pickupDate, pickupTime, nextMinimum.date, nextMinimum.time) < 0) {
        const { safeDate, safeTime } = enforceMinimumPickup(pickupDate, pickupTime);
        setSubmitError(formatTemplate(t("受付中の受け取り時間を選択してください。最短 {datetime} です。"), {
          datetime: `${safeDate} ${safeTime}`,
        }));
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
          memberToken: memberProfile?.publicToken || "",
          memberEmail: memberProfile?.email || "",
          memberPhone: memberProfile?.phone || "",
          memberName: memberProfile ? name : "",
          couponId: selectedCouponId,
          shortagePreference,
          pickupDate: safePickupDate,
          pickupTime: safePickupTime,
          total: paymentTotal,
          items: localizedCartItems,
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
        total: paymentTotal,
        items: localizedCartItems,
      };

      setReservation(nextReservation);
      try {
        window.sessionStorage.removeItem(draftStorageKey);
      } catch {
        // Continue after checkout creation.
      }
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
        <p className="kicker">{t(reservationSummary?.subtitle || "Pickup reservation")}</p>
        <h2>{t(reservationSummary?.title || "予約リスト")}</h2>
        <p>
          {t(reservationSummary?.body || "カスタムした一杯をリストに追加して、複数の商品をまとめて受け取り予約できます。")}
        </p>
        <div className="pickupFields">
          <label>
            {t("お名前")}
            <input
              ref={nameInputRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("例: 山田")}
              autoComplete={memberProfile ? "name" : "new-password"}
              required
            />
          </label>
          <label>
            {t("電話番号")}
            <input
              ref={phoneInputRef}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="090..."
              autoComplete={memberProfile ? "tel" : "new-password"}
              inputMode="tel"
              required
            />
          </label>
          {!memberProfile ? (
            <div className="memberPointPanel">
              <div>
                <span>{t("会員ポイント")}</span>
                <strong>{t("ログインするとポイントが貯まります。")}</strong>
                <p>{t("予約だけなら登録なしで進めます。ポイント利用には会員登録・ログインが必要です。")}</p>
              </div>
              <a href={memberHref}>
                {t("会員登録・ログイン")}
              </a>
            </div>
          ) : null}
          <p className="pickupNotice">
            {t("Web予約は現在の営業日の受付状況に合わせて承ります。受け取り時間は受付中に選択できます。")}
          </p>
          <label>
            {t("受け取り日")}
            <input
              type="date"
              min={availablePickupDates[0] ?? minimumPickup.date}
              max={availablePickupDates.at(-1) ?? minimumPickup.date}
              value={pickupDate}
              onChange={(event) => enforceMinimumPickup(event.target.value, pickupTime)}
            />
          </label>
          <label>
            {t("受け取り時間")}
            {hasReservationWindows && !sameDayBookingClosed ? (
              <input
                type="time"
                min={pickupDate === minimumPickup.date ? earliestReservationTime : undefined}
                max={latestReservationTime}
                value={pickupTime}
                onBlur={(event) => enforceMinimumPickup(pickupDate, event.target.value)}
                onChange={(event) => enforceMinimumPickup(pickupDate, event.target.value)}
              />
            ) : (
              <input type="text" value="-" disabled aria-label={t("受け取り時間")} />
            )}
          </label>
          {reservationWindowLabel ? (
            <p className="pickupWindowHint">
              {formatTemplate(t("{date} の受け取り時間: {windows}"), { date: pickupDate, windows: reservationWindowLabel })}
            </p>
          ) : (
            <p className="pickupWindowHint">
              {t("選択できる受け取り時間はありません。")}
            </p>
          )}
          {!sameDayBookingClosed && pickupError ? <p className="formError">{pickupError}</p> : null}
        </div>
        <div className="cartList">
          {cartItems.length ? (
            cartItems.map((item, index) => (
              <article className="cartItem" key={item.id}>
                <div>
                  <strong>
                    {index + 1}. {formatCartItemTitle(item, index)}
                  </strong>
                  <span>{yen(item.total)}</span>
                </div>
                <p>{formatCartItemSummary(item).join(" / ")}</p>
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
          <strong>{yen(paymentTotal)}</strong>
          {couponDiscount ? <small>{t("クーポン値引き")} -{yen(couponDiscount)}</small> : null}
        </div>
        <fieldset className="shortagePreference">
          <legend>{t("欠品時の対応")}</legend>
          <p>{t("複数の販売先で在庫を共有しているため、決済後に欠品が判明する場合があります。")}</p>
          <label>
            <input type="radio" name="shortagePreference" checked={shortagePreference === "substitute_or_refund"} onChange={() => setShortagePreference("substitute_or_refund")} />
            <span><strong>{t("同類・同等以上の商品へ変更")}</strong><small>{t("安全に同類と判断できる代替品がない場合は、その商品・オプションを返金します。")}</small></span>
          </label>
          <label>
            <input type="radio" name="shortagePreference" checked={shortagePreference === "refund"} onChange={() => setShortagePreference("refund")} />
            <span><strong>{t("欠品した商品・オプションを返金")}</strong><small>{t("代替せず、提供できない分を返金します。")}</small></span>
          </label>
        </fieldset>
        {memberProfile && memberCoupons.length ? (
          <div className="memberCouponPanel">
            <span>{t("クーポン")}</span>
            {memberCoupons.map((coupon) => (
              <button
                key={coupon.id}
                className={selectedCouponId === coupon.id ? "isSelected" : ""}
                type="button"
                onClick={() => setSelectedCouponId((current) => (current === coupon.id ? "" : coupon.id))}
              >
                <strong>{t(coupon.name)}</strong>
                <small>{formatCouponValue(coupon)}</small>
              </button>
            ))}
          </div>
        ) : null}
        <button
          ref={reserveButtonRef}
          className="button primary reserveButton"
          disabled={reservationsPaused || sameDayBookingClosed || isPickupOutsideReservationWindows || baseUnavailable || !name || !phone || !shortagePreference || !cartItems.length || cartItems.some((item) => item.total < (item.minimumOrderAmount ?? minimumBowlTotal)) || isSubmitting || Boolean(checkoutUrl)}
          onClick={createReservation}
        >
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
        <section className="menuPanel">
          <div className="menuPanelHeader">
            <p className="kicker">{t("Menu")}</p>
            <h2>{t("商品を選ぶ")}</h2>
            <span>{t("1つ選択")}</span>
          </div>
          <div className="productCategoryList">
            {groupedProducts.map((category) => (
              <section className="productCategoryGroup" key={category.id}>
                <h3>{t(category.name)}</h3>
                <div className="optionGrid">
            {category.products.map((product) => {
              const unavailable = product.isAvailable === false;
              return (
                <button
                  className={[
                    "optionButton",
                    activeProduct.id === product.id ? "selected" : "",
                    product.imageUrl ? "hasImage" : "",
                  ].filter(Boolean).join(" ")}
                  disabled={unavailable}
                  key={product.id}
                  onClick={() => selectProduct(product.id)}
                  type="button"
                >
                  <ChoiceImage item={product} className="optionImage" />
                  <OptionName item={product} />
                  <small>{yen(product.price)}{unavailable ? ` / ${t("売切")}` : ""}</small>
                </button>
              );
            })}
                </div>
              </section>
            ))}
          </div>
        </section>

        <div className="menuHeroCard">
          <ChoiceImage item={activeProduct} className="menuHeroImage" />
          <p className="kicker">{isPreset ? t("Set menu") : t("Base soup")}</p>
          <h1>{menuText(activeProduct)}</h1>
          {activeProductNote ? (
            <>
              <p
                className={`menuHeroDescription${showDescriptionToggle && !descriptionExpanded ? " isCollapsed" : ""}`}
                id="active-product-description"
              >
                {activeProductNote}
              </p>
              {showDescriptionToggle ? (
                <button
                  aria-controls="active-product-description"
                  aria-expanded={descriptionExpanded}
                  className="menuDescriptionToggle"
                  onClick={() => setDescriptionExpanded((current) => !current)}
                  type="button"
                >
                  {descriptionExpanded ? t("説明を閉じる") : t("説明をもっと見る")}
                </button>
              ) : null}
            </>
          ) : null}
          <strong>{yen(activeProduct.price)}</strong>
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
          <div className="currentBowlActions">
            {cartItems.length > 0 && !editingCartItemId ? (
              <button className="button quiet" type="button" onClick={scrollToPayment}>
                {t("支払いへ進む")}
              </button>
            ) : null}
            <button className="button primary" type="button" disabled={baseUnavailable} onClick={addCurrentBowl}>
              {addBowlButtonLabel}
            </button>
          </div>
        </section>

        {hasActiveGroup("medicinal-spice") ? <ChoiceGroup title={choiceGroupTitle(medicinalSpiceGroup, "薬膳スパイス")} items={medicinalSpiceOptions.filter((item) => isChoiceOpen(item.id))} value={spice} onChange={setSpice} /> : null}
        {hasActiveGroup("heat") ? <ChoiceGroup title={choiceGroupTitle(heatGroup, "辛さ")} items={heatLevels.filter((item) => isChoiceOpen(item.id))} value={heat} onChange={setHeat} /> : null}
        {hasActiveGroup("numb") ? <ChoiceGroup title={choiceGroupTitle(numbGroup, "痺れ")} items={numbLevels.filter((item) => isChoiceOpen(item.id))} value={numb} onChange={setNumb} /> : null}
        {hasActiveGroup("noodle-replacement") ? (
          <section className="menuPanel">
            <div className="menuPanelHeader">
              <p className="kicker">noodle-replacement</p>
              <h2>{t("麺の種類を変更する（セットの板春雨と入れ替え）")}</h2>
              <span>{noodleReplacementRule.limit}{t("個まで")}</span>
            </div>
            <div className="toppingList">
              {noodleReplacementOptions.filter((item) => isChoiceOpen(item.id)).map((item) => {
                const selectedCount = Object.values(noodleChanges).reduce((sum, quantity) => sum + quantity, 0);
                const quantity = noodleChanges[item.id] || 0;
                const canIncrease = selectedCount < noodleReplacementRule.limit && quantity < noodleReplacementRule.perOptionMax;
                return (
                  <div className={quantity > 0 ? "toppingRow isSelected" : "toppingRow"} key={item.id}>
                    <button className={item.imageUrl ? "toppingItemButton hasImage" : "toppingItemButton"} type="button" onClick={() => changeNoodleQuantity(item.id, 1)} disabled={!canIncrease}>
                      <ChoiceImage item={item} className="toppingImage" />
                      <span className="toppingItemCopy">
                        <strong><OptionName item={item} /></strong>
                        <span>{yen(item.price)}</span>
                      </span>
                    </button>
                    <div className="quantityControl">
                      <button type="button" onClick={() => changeNoodleQuantity(item.id, -1)}>-</button>
                      <span>{quantity}</span>
                      <button type="button" onClick={() => changeNoodleQuantity(item.id, 1)} disabled={!canIncrease}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {hasActiveGroup("special-flavor") ? <section className="menuPanel">
          <div className="menuPanelHeader">
            <p className="kicker">{specialFlavorGroup?.id || "special-flavor"}</p>
            <h2>{menuText(specialFlavorGroup, "味変・追加調味")}</h2>
            <span>{t("6個まで")}</span>
          </div>
          <div className="optionGrid">
            {specialFlavors.filter((item) => isChoiceOpen(item.id)).map((item) => (
              <button
                className={[
                  "optionButton",
                  flavors.includes(item.id) ? "selected" : "",
                  item.imageUrl ? "hasImage" : "",
                ].filter(Boolean).join(" ")}
                key={item.id}
                onClick={() => toggleFlavor(item.id)}
                type="button"
              >
                <ChoiceImage item={item} className="optionImage" />
                <OptionName item={item} />
                <small>{optionPrice(item.price)}</small>
              </button>
            ))}
          </div>
        </section> : null}

        {visibleMenuSections.map((section) => (
          <section className="menuPanel" key={section.id}>
            <div className="menuPanelHeader">
              <p className="kicker">{section.id}</p>
              <h2>{menuText(section, section.title)}</h2>
              <span>{section.limit}{t("個まで")}</span>
            </div>
            <div className="toppingList">
              {section.items.filter((item) => isChoiceOpen(item.id)).map((item) => {
                const sectionSelectedCount = getSectionSelectedCount(section);
                const quantity = items[item.id] || 0;
                const canIncrease = sectionSelectedCount < section.limit && quantity < section.perOptionMax;
                return (
                <div className={quantity > 0 ? "toppingRow isSelected" : "toppingRow"} key={item.id}>
                  <button className={item.imageUrl ? "toppingItemButton hasImage" : "toppingItemButton"} type="button" onClick={() => changeQuantity(section, item.id, 1)} disabled={!canIncrease}>
                    <ChoiceImage item={item} className="toppingImage" />
                    <span className="toppingItemCopy">
                      <strong>
                        <OptionName item={item} />
                      </strong>
                      <span>{yen(item.price)}</span>
                    </span>
                  </button>
                  <div className="quantityControl">
                    <button type="button" onClick={() => changeQuantity(section, item.id, -1)}>
                      -
                    </button>
                    <span>{quantity}</span>
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
        <p className="kicker">{t("Required")}</p>
        <h2>{title}</h2>
        <span>{t("1個選択")}</span>
      </div>
      <div className="optionGrid">
        {items.map((item) => (
          <button
            className={[
              "optionButton",
              value === item.id ? "selected" : "",
              item.imageUrl ? "hasImage" : "",
            ].filter(Boolean).join(" ")}
            key={item.id}
            onClick={() => onChange(item.id)}
            type="button"
          >
            <ChoiceImage item={item} className="optionImage" />
            <OptionName item={item} />
            <small>{optionPrice(item.price)}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function ChoiceImage({ item, className }: { item: MenuChoice; className: string }) {
  if (!item.imageUrl) return null;
  return (
    <Image
      alt=""
      className={className}
      height={120}
      sizes="(max-width: 720px) 72px, 96px"
      src={item.imageUrl}
      unoptimized
      width={120}
    />
  );
}

function OptionName({ item }: { item: MenuChoice }) {
  const { language, t } = useI18n();

  return (
    <span className="optionName">
      {menuDisplayName(item, language, t)}
      {isRecommended(item) ? (
        <span aria-label={t("おすすめ")} className="recommendIcon" title={t("おすすめ")}>
          ★
        </span>
      ) : null}
    </span>
  );
}
