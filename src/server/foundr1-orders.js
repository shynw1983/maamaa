const foundr1BaseUrl = () => {
  const value = process.env.FOUNDR1_API_BASE_URL || process.env.NEXT_PUBLIC_FOUNDR1_API_BASE_URL || "";
  return String(value).trim().replace(/\/$/, "");
};

const toPublicOrder = (order) => ({
  orderId: order.orderId,
  pickupCode: order.pickupCode,
  storeId: order.storeId || "shimizu",
  storeName: order.storeName || "まぁ麻 清水店",
  status: order.status,
  paymentStatus: order.paymentStatus,
  refundStatus: order.refundStatus || "",
  refundError: order.refundError || "",
  refundedAt: order.refundedAt || "",
  receiptUrl: order.receiptUrl || order.squareReceiptUrl || "",
  receiptPreviewUrl: order.receiptPreviewUrl || "",
  receiptPdfUrl: order.receiptPdfUrl || "",
  drink: order.drink || "",
  size: order.size || "",
  option: order.option || "",
  toppings: order.toppings || "",
  amount: Number(order.amount || 0),
  pickupDate: order.pickupDate || "",
  pickupTime: order.pickupTime || "",
  canCancel: Boolean(order.canCancel),
  cancelDeadline: order.cancelDeadline || "",
  cancelWindowMinutes: Number(order.cancelWindowMinutes || 30),
});

const fetchFoundr1Order = async (orderId) => {
  const baseUrl = foundr1BaseUrl();
  if (!baseUrl) throw new Error("FOUNDR1_API_BASE_URL is not configured.");

  const url = new URL(`${baseUrl}/api/public/orders/status`);
  url.searchParams.set("orderId", orderId);
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.order) return null;
  return toPublicOrder(body.order);
};

const fetchFoundr1Receipt = async (orderId, pickupCode) => {
  const baseUrl = foundr1BaseUrl();
  if (!baseUrl) throw new Error("FOUNDR1_API_BASE_URL is not configured.");

  const url = new URL(`${baseUrl}/api/public/orders/receipt`);
  url.searchParams.set("orderId", orderId);
  url.searchParams.set("pickupCode", pickupCode);
  const response = await fetch(url, { cache: "no-store" });
  const body = Buffer.from(await response.arrayBuffer());
  return {
    ok: response.ok,
    status: response.status,
    contentType: response.headers.get("content-type") || "application/pdf",
    disposition: response.headers.get("content-disposition") || `attachment; filename="receipt-${pickupCode}.pdf"`,
    body,
  };
};

const cancelFoundr1Order = async (orderId, pickupCode, pickupDate) => {
  const baseUrl = foundr1BaseUrl();
  if (!baseUrl) throw new Error("FOUNDR1_API_BASE_URL is not configured.");

  const response = await fetch(`${baseUrl}/api/public/orders/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, pickupCode, pickupDate }),
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  return {
    ok: response.ok,
    status: response.status,
    error: body.error || "",
    order: body.order ? toPublicOrder(body.order) : null,
  };
};

const fetchFoundr1RealtimeConfig = async () => {
  const baseUrl = foundr1BaseUrl();
  if (!baseUrl) return null;
  const response = await fetch(`${baseUrl}/api/public/orders/realtime-config`, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json().catch(() => null);
};

module.exports = {
  fetchFoundr1Order,
  fetchFoundr1Receipt,
  fetchFoundr1RealtimeConfig,
  cancelFoundr1Order,
  toPublicOrder,
};
