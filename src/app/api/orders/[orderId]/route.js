const { getOrder } = require("../../../../server/orders");
const { toPublicOrder } = require("../../../../server/realtime");

export async function GET(_request, { params }) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (!order) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ order: toPublicOrder(order) });
}
