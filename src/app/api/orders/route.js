const { createOrder, updateOrder } = require("../../../server/orders");
const { createPaymentSession } = require("../../../server/komoju");
const { publishOrderEvent } = require("../../../server/realtime");

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

export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  if (!body.items?.length || !body.name || !body.phone || !body.pickupDate || !body.pickupTime) {
    return Response.json({ error: "Missing order fields" }, { status: 400 });
  }

  const pickupCode = `M-${Math.floor(1000 + Math.random() * 9000)}`;
  const itemLines = body.items
    .map((item, index) => `${index + 1}. ${item.title}\n${(item.summary || []).join(" / ")}\n¥${item.total}`)
    .join("\n\n");

  const order = await createOrder({
    pickupCode,
    storeId: "shimizu",
    storeName: "まぁ麻 清水店",
    drink: body.items.map((item, index) => `${index + 1}. ${item.title}`).join(" / "),
    size: itemLines,
    temperature: body.name,
    sweetness: body.phone,
    ice: body.note || "",
    option: "店頭ピックアップ",
    toppings: itemLines,
    pickupDate: body.pickupDate,
    pickupTime: body.pickupTime,
    amount: Number(body.total || 0),
  });

  try {
    const language = String(body.language || "ja");
    const origin = requestOrigin(request);
    const returnUrl = `${origin}/api/orders/komoju-return?order_id=${encodeURIComponent(order.orderId)}&lang=${encodeURIComponent(language)}`;
    const session = await createPaymentSession({
      order,
      returnUrl,
      locale: language,
    });

    const pendingOrder = await updateOrder(order, {
      paymentProvider: "komoju",
      paymentReference: session.id,
      receiptUrl: session.session_url,
      paymentUpdatedAt: new Date().toISOString(),
    });

    return Response.json({
      order: pendingOrder,
      checkoutUrl: session.session_url,
      orderUrl: `${localePrefix(language)}/stores/shimizu/orders/${order.orderId}`,
    });
  } catch (error) {
    const failedOrder = await updateOrder(order, {
      status: "checkout_failed",
      paymentStatus: "failed",
      paymentProvider: "komoju",
      paymentUpdatedAt: new Date().toISOString(),
    });
    await publishOrderEvent("order.updated", failedOrder);
    return Response.json({ error: "Could not create KOMOJU checkout session" }, { status: 502 });
  }
}
