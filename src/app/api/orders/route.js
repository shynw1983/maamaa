const { createOrder, updateOrder } = require("../../../server/orders");
const { publishOrderEvent } = require("../../../server/realtime");

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
    storeId: "maamaa",
    storeName: "まぁ麻",
    drink: body.items.map((item, index) => `${index + 1}. ${item.title}`).join(" / "),
    size: itemLines,
    temperature: body.name,
    sweetness: `電話: ${body.phone}`,
    ice: body.note ? `メモ: ${body.note}` : "",
    option: "店頭ピックアップ",
    toppings: itemLines,
    pickupDate: body.pickupDate,
    pickupTime: body.pickupTime,
    amount: Number(body.total || 0),
  });

  const paidOrder = await updateOrder(order, {
    status: "new",
    paymentStatus: "paid",
    paidAt: new Date().toISOString(),
  });

  await publishOrderEvent("order.created", paidOrder);
  return Response.json({ order: paidOrder });
}
