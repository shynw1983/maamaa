const { fetchFoundr1Order, fetchFoundr1RealtimeConfig } = require("../../../../../server/foundr1-orders");

export async function GET(_request, { params }) {
  const { orderId } = await params;
  const order = await fetchFoundr1Order(orderId);

  if (!order) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const config = await fetchFoundr1RealtimeConfig();
  if (!config?.key || !config?.cluster) {
    return Response.json({ available: false }, { headers: { "Cache-Control": "no-store" } });
  }

  return Response.json({
    available: true,
    key: config.key,
    cluster: config.cluster,
    channel: `order-${order.orderId}`,
  }, { headers: { "Cache-Control": "no-store" } });
}
