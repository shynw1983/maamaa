const { getMenuData } = require("../../../server/menu-source");

const localePrefix = (language) => {
  if (language === "en") return "/en";
  if (language === "zh") return "/zh";
  if (language === "ko") return "/ko";
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
    return Response.json({ error: "Missing order fields" }, { status: 400 });
  }

  const baseUrl = foundr1BaseUrl();
  if (!baseUrl) {
    return Response.json({ error: "FOUNDR1_API_BASE_URL is not configured" }, { status: 500 });
  }
  const menu = await getMenuData("shimizu");
  if (menu.baseSoup.websiteEnabled === false || menu.baseSoup.isAvailable === false) {
    return Response.json({ error: "Menu item is temporarily unavailable" }, { status: 409 });
  }
  const sectionByChoiceId = createSectionByChoiceId(menu);

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
      items: body.items.map((item) => toFoundr1Item(item, menu, sectionByChoiceId)),
      completionUrl,
      completionSummary: {
        name: body.name,
        phone: body.phone,
        note: body.note || "",
        drink: body.items.map((item, index) => `${index + 1}. ${item.title || menu.baseSoup.name}`).join(" / "),
        size: body.items.map((item, index) => `${index + 1}. ${(item.summary || []).join(" / ")}`).join("\n"),
        total: Number(body.total || 0),
      },
    }),
    cache: "no-store",
  });

  const foundr1Body = await foundr1Response.json().catch(() => ({}));
  if (!foundr1Response.ok || !foundr1Body.checkoutUrl) {
    return Response.json({
      error: foundr1Body.error || "Could not create Foundr1 checkout session",
      details: foundr1Body.details || undefined,
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
      temperature: body.name,
      sweetness: body.phone,
      ice: body.note || "",
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
