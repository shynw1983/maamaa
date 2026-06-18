const { getMenuData } = require("../../../server/menu-source");

const minimumBowlTotal = 800;
const missingOrderFieldsError = "お名前、電話番号、受け取り日時、注文内容を確認してください。";
const checkoutSetupError = "現在オンライン決済を開始できません。時間をおいてからもう一度お試しください。";
const checkoutCreateError = "予約の受付処理を完了できませんでした。時間をおいてからもう一度お試しください。";
const reservationPausedError = "現在予約受付を停止しています。店頭での受付状況は店舗へご確認ください。";
const pickupLeadTimeError = "受け取り時間が早すぎます。最新の選択可能時間を確認して、もう一度お試しください。";
const pickupBusinessHoursError = "選択した受け取り時間は営業時間外です。別の時間を選択してください。";
const sameDayPickupError = "Web予約は本日受け取り分のみ、23:00まで受け付けています。";

const localePrefix = (language) => {
  if (language === "en") return "/en";
  if (language === "zh") return "/zh";
  if (language === "zh-Hant") return "/zh-Hant";
  if (language === "ko") return "/ko";
  if (language === "vi") return "/vi";
  if (language === "ne") return "/ne";
  return "";
};

const requestOrigin = (request) => {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedProto && forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return new URL(request.url).origin;
};

const foundr1BaseUrl = () => {
  const value = process.env.FOUNDR1_API_BASE_URL || process.env.NEXT_PUBLIC_FOUNDR1_API_BASE_URL || "";
  return String(value).trim().replace(/\/$/, "");
};

const foundr1StoreId = () => (
  process.env.FOUNDR1_SHIMIZU_STORE_ID ||
  process.env.NEXT_PUBLIC_FOUNDR1_SHIMIZU_STORE_ID ||
  "ed6c3b1f-e68a-4cbd-92e2-06a800eb7183"
);

const createSectionByChoiceId = (menu) => new Map(
  menu.menuSections.flatMap((section) => section.items.map((item) => [item.id, section.id])),
);

const expandQuantitySelections = (items = {}, sectionByChoiceId) => {
  const selections = {};
  for (const [choiceId, rawQuantity] of Object.entries(items || {})) {
    const sectionId = sectionByChoiceId.get(choiceId);
    const quantity = Math.max(0, Math.min(99, Math.round(Number(rawQuantity) || 0)));
    if (!sectionId || quantity <= 0) continue;
    const list = selections[sectionId] || [];
    for (let index = 0; index < quantity; index += 1) list.push(choiceId);
    selections[sectionId] = list;
  }
  return selections;
};

const createValidSelectionIds = (menu) => new Set([
  ...menu.medicinalSpiceOptions.map((choice) => choice.id),
  ...menu.heatLevels.map((choice) => choice.id),
  ...menu.numbLevels.map((choice) => choice.id),
  ...menu.specialFlavors.map((choice) => choice.id),
  ...menu.menuSections.flatMap((section) => section.items.map((choice) => choice.id)),
]);

const createChoiceById = (menu) => new Map([
  [menu.baseSoup.id, menu.baseSoup],
  ...menu.medicinalSpiceOptions.map((choice) => [choice.id, choice]),
  ...menu.heatLevels.map((choice) => [choice.id, choice]),
  ...menu.numbLevels.map((choice) => [choice.id, choice]),
  ...menu.specialFlavors.map((choice) => [choice.id, choice]),
  ...menu.menuSections.flatMap((section) => section.items.map((choice) => [choice.id, choice])),
]);

const calculateBowlTotal = (item, menu, choiceById) => {
  const selections = item?.selections || {};
  const selectedSpice = choiceById.get(selections.spice) || menu.medicinalSpiceOptions[0];
  const selectedHeat = choiceById.get(selections.heat) || menu.heatLevels.find((choice) => choice.id === "normal") || menu.heatLevels[0];
  const selectedNumb = choiceById.get(selections.numb) || menu.numbLevels.find((choice) => choice.id === "tiny") || menu.numbLevels[0];
  const flavorTotal = (Array.isArray(selections.flavors) ? selections.flavors : [])
    .reduce((sum, id) => sum + Number(choiceById.get(id)?.price || 0), 0);
  const itemTotal = Object.entries(selections.items || {})
    .reduce((sum, [id, rawQuantity]) => {
      const quantity = Math.max(0, Math.round(Number(rawQuantity) || 0));
      return sum + Number(choiceById.get(id)?.price || 0) * quantity;
    }, 0);

  return Number(menu.baseSoup.price || 0) +
    Number(selectedSpice?.price || 0) +
    Number(selectedHeat?.price || 0) +
    Number(selectedNumb?.price || 0) +
    flavorTotal +
    itemTotal;
};

const validateCartAgainstMenu = (items, menu, sectionByChoiceId) => {
  const validIds = createValidSelectionIds(menu);
  const unavailableItems = [];

  for (const [index, item] of (items || []).entries()) {
    const selections = item?.selections || {};
    const selectionLabels = item?.selectionLabels && typeof item.selectionLabels === "object" ? item.selectionLabels : {};
    const unavailableSelections = new Map();
    const addUnavailable = (id) => {
      unavailableSelections.set(id, String(selectionLabels[id] || id));
    };
    [selections.spice, selections.heat, selections.numb]
      .filter(Boolean)
      .forEach((id) => {
        if (!validIds.has(id)) addUnavailable(id);
      });
    (Array.isArray(selections.flavors) ? selections.flavors : [])
      .filter(Boolean)
      .forEach((id) => {
        if (!validIds.has(id)) addUnavailable(id);
      });
    Object.entries(selections.items || {}).forEach(([id, rawQuantity]) => {
      const quantity = Math.max(0, Math.round(Number(rawQuantity) || 0));
      if (quantity > 0 && !sectionByChoiceId.has(id)) addUnavailable(id);
    });

    if (unavailableSelections.size) {
      unavailableItems.push({
        itemIndex: index + 1,
        title: String(item?.title || menu.baseSoup.name),
        summary: Array.isArray(item?.summary) ? item.summary.map(String).filter(Boolean) : [],
        unavailableOptions: Array.from(unavailableSelections.entries()).map(([id, name]) => ({ id, name })),
      });
    }
  }

  return unavailableItems;
};

const validateSectionLimits = (items, menu) => {
  const limitErrors = [];
  for (const [index, item] of (items || []).entries()) {
    const selections = item?.selections || {};
    const selectedItems = selections.items || {};
    for (const section of menu.menuSections) {
      const count = section.items.reduce((sum, choice) => {
        const quantity = Math.max(0, Math.round(Number(selectedItems[choice.id]) || 0));
        return sum + quantity;
      }, 0);
      if (count > Number(section.limit || 99)) {
        limitErrors.push({
          itemIndex: index + 1,
          title: String(item?.title || menu.baseSoup.name),
          sectionTitle: section.title,
          limit: Number(section.limit || 99),
          count,
        });
      }
    }
  }
  return limitErrors;
};

const toFoundr1Item = (item, menu, sectionByChoiceId) => {
  const selections = item?.selections || {};
  return {
    title: item?.title || menu.baseSoup.name,
    medicinalSpice: selections.spice || menu.medicinalSpiceOptions[0]?.id || "",
    heat: selections.heat || menu.heatLevels.find((choice) => choice.id === "normal")?.id || menu.heatLevels[0]?.id || "",
    numb: selections.numb || menu.numbLevels.find((choice) => choice.id === "tiny")?.id || menu.numbLevels[0]?.id || "",
    specialFlavors: Array.isArray(selections.flavors) ? selections.flavors : [],
    selections: expandQuantitySelections(selections.items, sectionByChoiceId),
    completionSummary: {
      title: item?.title || menu.baseSoup.name,
      summary: Array.isArray(item?.summary) ? item.summary : [],
      total: Number(item?.total || 0),
    },
  };
};

export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  if (!body.items?.length || !body.name || !body.phone || !body.pickupDate || !body.pickupTime) {
    return Response.json({ error: missingOrderFieldsError }, { status: 400 });
  }

  const menu = await getMenuData("shimizu", { noStore: true });
  if (menu.baseSoup.websiteEnabled === false || menu.baseSoup.isAvailable === false) {
    return Response.json({
      code: "MENU_ITEM_UNAVAILABLE",
      error: "ベースの麻辣湯が現在販売停止中です。時間をおいてからもう一度お試しください。",
    }, { status: 409 });
  }
  const sectionByChoiceId = createSectionByChoiceId(menu);
  const choiceById = createChoiceById(menu);
  const unavailableSelections = validateCartAgainstMenu(body.items, menu, sectionByChoiceId);
  if (unavailableSelections.length) {
    return Response.json({
      code: "MENU_SELECTION_UNAVAILABLE",
      error: "選択したトッピング・オプションの一部が現在販売停止または品切れです。予約リストから該当する一杯を削除して、もう一度選び直してください。",
      unavailableItems: unavailableSelections,
    }, { status: 409 });
  }
  const sectionLimitErrors = validateSectionLimits(body.items, menu);
  if (sectionLimitErrors.length) {
    const first = sectionLimitErrors[0];
    return Response.json({
      code: "MENU_SECTION_LIMIT_EXCEEDED",
      error: `${first.sectionTitle}は${first.limit}個まで選択できます。数量を減らしてから、もう一度お試しください。`,
      sectionLimitErrors,
    }, { status: 400 });
  }
  const underMinimumItems = body.items
    .map((item, index) => ({
      itemIndex: index + 1,
      title: String(item?.title || menu.baseSoup.name),
      total: calculateBowlTotal(item, menu, choiceById),
    }))
    .filter((item) => item.total < minimumBowlTotal);
  if (underMinimumItems.length) {
    return Response.json({
      code: "BOWL_TOTAL_TOO_LOW",
      error: `一杯あたり¥${minimumBowlTotal.toLocaleString("ja-JP")}以上になるように具材を追加してください。`,
      minimumBowlTotal,
      underMinimumItems,
    }, { status: 400 });
  }
  const baseUrl = foundr1BaseUrl();
  if (!baseUrl) {
    return Response.json({ error: checkoutSetupError }, { status: 500 });
  }

  const language = String(body.language || "ja");
  const origin = requestOrigin(request);
  const orderPathPrefix = `${localePrefix(language)}/stores/shimizu/orders`;
  const completionUrl = `${origin}/api/orders/foundr1-return?lang=${encodeURIComponent(language)}`;
  const foundr1Response = await fetch(`${baseUrl}/api/public/orders/maamaa/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      store: foundr1StoreId(),
      pickupDate: body.pickupDate,
      pickup: body.pickupTime,
      memberToken: body.memberToken || "",
      memberEmail: body.memberEmail || "",
      memberPhone: body.memberPhone || "",
      memberName: body.memberName || "",
      couponId: body.couponId || "",
      items: body.items.map((item) => toFoundr1Item(item, menu, sectionByChoiceId)),
      completionUrl,
      completionSummary: {
        name: body.name,
        phone: body.phone,
        drink: body.items.map((item, index) => `${index + 1}. ${item.title || menu.baseSoup.name}`).join(" / "),
        size: body.items.map((item, index) => `${index + 1}. ${(item.summary || []).join(" / ")}`).join("\n"),
        total: Number(body.total || 0),
      },
    }),
    cache: "no-store",
  });

  const foundr1Body = await foundr1Response.json().catch(() => ({}));
  if (!foundr1Response.ok || !foundr1Body.checkoutUrl) {
    const upstreamError = String(foundr1Body.error || "");
    const isMenuSelectionError = upstreamError.includes("Invalid selection") || upstreamError.includes("Invalid special flavor");
    const isSectionLimitError = upstreamError.includes("まで選択できます") || upstreamError.includes("can only select up to");
    const isReservationPaused = upstreamError.includes("Reservations are temporarily paused");
    const isPickupLeadTime = upstreamError.includes("Pickup time must be at least");
    const isSameDayPickup = upstreamError.includes("same-day pickup") || upstreamError.includes("available until 23:00");
    const isBusinessHours = upstreamError.includes("outside store business hours");
    const isPaymentSetupError =
      foundr1Body.code === "STORE_PAYMENT_NOT_CONFIGURED" ||
      upstreamError.includes("KOMOJU") ||
      upstreamError.includes("not configured");
    return Response.json({
      code: isSectionLimitError
        ? "MENU_SECTION_LIMIT_EXCEEDED"
        : isMenuSelectionError
        ? "MENU_SELECTION_UNAVAILABLE"
        : isReservationPaused
        ? "RESERVATIONS_PAUSED"
        : isPickupLeadTime
        ? "PICKUP_TOO_SOON"
        : isSameDayPickup
        ? "PICKUP_SAME_DAY_ONLY"
        : isBusinessHours
        ? "PICKUP_OUTSIDE_BUSINESS_HOURS"
        : isPaymentSetupError
        ? "PAYMENT_SETUP_UNAVAILABLE"
        : foundr1Body.code || "CHECKOUT_FAILED",
      error: isSectionLimitError
        ? upstreamError
        : isMenuSelectionError
        ? "選択したトッピング・オプションの一部が現在販売停止または品切れです。予約リストから該当する一杯を削除して、もう一度選び直してください。"
        : isReservationPaused
        ? reservationPausedError
        : isPickupLeadTime
        ? pickupLeadTimeError
        : isSameDayPickup
        ? sameDayPickupError
        : isBusinessHours
        ? pickupBusinessHoursError
        : isPaymentSetupError
        ? checkoutSetupError
        : checkoutCreateError,
    }, { status: foundr1Response.status || 502 });
  }

  const pickupCode = foundr1Body.pickupCode || `M-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderId = foundr1Body.localOrderId || foundr1Body.orderId || "";

  return Response.json({
    order: {
      orderId,
      pickupCode,
      status: "pending_payment",
      paymentStatus: "pending",
      paymentProvider: "komoju",
      storeId: foundr1StoreId(),
      storeName: "まぁ麻 清水店",
      drink: body.items.map((item, index) => `${index + 1}. ${item.title || menu.baseSoup.name}`).join(" / "),
      size: body.items.map((item) => (item.summary || []).join(" / ")).join("\n"),
      temperature: "",
      sweetness: "",
      ice: "",
      option: "店頭ピックアップ",
      toppings: body.items.map((item) => (item.summary || []).join(" / ")).join("\n"),
      pickupDate: body.pickupDate,
      pickupTime: body.pickupTime,
      amount: Number(body.total || 0),
      currency: "JPY",
      createdAt: new Date().toISOString(),
    },
    checkoutUrl: foundr1Body.checkoutUrl,
    orderUrl: `${orderPathPrefix}/${encodeURIComponent(orderId)}?pickupCode=${encodeURIComponent(pickupCode)}`,
  });
}
