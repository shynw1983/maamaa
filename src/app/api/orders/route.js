const { baseSoup, heatLevels, medicinalSpiceOptions, menuSections, numbLevels, specialFlavors } = require("../../../data/malatang-menu");

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

const choiceNameById = new Map([
  ...medicinalSpiceOptions,
  ...heatLevels,
  ...numbLevels,
  ...specialFlavors,
  ...menuSections.flatMap((section) => section.items),
].map((choice) => [choice.id, choice.name]));

const sectionByChoiceId = new Map(
  menuSections.flatMap((section) => section.items.map((item) => [item.id, section.id])),
);

const expandQuantitySelections = (items = {}) => {
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

const toFoundr1Item = (item) => {
  const selections = item?.selections || {};
  return {
    title: item?.title || baseSoup.name,
    medicinalSpice: selections.spice || "with-spice",
    heat: selections.heat || "normal",
    numb: selections.numb || "tiny",
    specialFlavors: Array.isArray(selections.flavors) ? selections.flavors : [],
    selections: expandQuantitySelections(selections.items),
    completionSummary: {
      title: item?.title || baseSoup.name,
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

  const language = String(body.language || "ja");
  const origin = requestOrigin(request);
  const menuPath = `${localePrefix(language)}/stores/shimizu/menu`;
  const completionUrl = `${origin}${menuPath}`;
  const foundr1Response = await fetch(`${baseUrl}/api/public/orders/maamaa/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      store: foundr1StoreId(),
      pickupDate: body.pickupDate,
      pickup: body.pickupTime,
      items: body.items.map(toFoundr1Item),
      completionUrl,
      completionSummary: {
        name: body.name,
        phone: body.phone,
        note: body.note || "",
        drink: body.items.map((item, index) => `${index + 1}. ${item.title || baseSoup.name}`).join(" / "),
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
      drink: body.items.map((item, index) => `${index + 1}. ${item.title || baseSoup.name}`).join(" / "),
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
    orderUrl: `${menuPath}?orderId=${encodeURIComponent(orderId)}&pickupCode=${encodeURIComponent(pickupCode)}`,
  });
}
