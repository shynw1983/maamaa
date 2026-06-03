const { findOrderByPaymentReference, getOrder, updateOrder } = require("../../../../server/orders");
const { publishOrderEvent } = require("../../../../server/realtime");
const { verifyWebhookSignature } = require("../../../../server/komoju");

const resolveOrder = async (payment) => {
  const orderId = payment?.metadata?.order_id || payment?.external_order_num;
  if (orderId) {
    const order = await getOrder(orderId);
    if (order) return order;
  }
  if (payment?.session) return findOrderByPaymentReference(payment.session);
  return null;
};

const updateFromPayment = async (order, eventType, payment) => {
  if (eventType === "payment.captured" || payment?.status === "captured") {
    return updateOrder(order, {
      status: "new",
      paymentStatus: "paid",
      paymentProvider: "komoju",
      paymentReference: payment.session || order.paymentReference,
      paymentUpdatedAt: new Date().toISOString(),
      paidAt: payment.captured_at || new Date().toISOString(),
    });
  }

  if (["payment.failed", "payment.expired", "payment.cancelled"].includes(eventType) || ["failed", "expired", "cancelled"].includes(payment?.status)) {
    return updateOrder(order, {
      status: "payment_failed",
      paymentStatus: payment?.status === "cancelled" ? "canceled" : "failed",
      paymentProvider: "komoju",
      paymentReference: payment?.session || order.paymentReference,
      paymentUpdatedAt: new Date().toISOString(),
    });
  }

  return null;
};

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-komoju-signature");

  const event = JSON.parse(rawBody);
  const eventType = request.headers.get("x-komoju-event") || event.type;
  const payment = event.data || {};
  const order = await resolveOrder(payment);

  if (!verifyWebhookSignature(rawBody, signature, { storeId: order?.storeId })) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (eventType === "ping") return Response.json({ ok: true });
  if (!order) return Response.json({ ok: true, ignored: "order_not_found" });

  const updatedOrder = await updateFromPayment(order, eventType, payment);
  if (updatedOrder) {
    await publishOrderEvent(updatedOrder.paymentStatus === "paid" ? "order.created" : "order.updated", updatedOrder);
  }

  return Response.json({ ok: true });
}
