const { getOrder } = require("../../../../../server/orders");

export async function GET(_request, { params }) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (!order) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (!process.env.PUSHER_KEY || !process.env.PUSHER_CLUSTER) {
    return Response.json({ available: false });
  }

  return Response.json({
    available: true,
    key: process.env.PUSHER_KEY,
    cluster: process.env.PUSHER_CLUSTER,
    channel: `order-${order.orderId}`,
  });
}
