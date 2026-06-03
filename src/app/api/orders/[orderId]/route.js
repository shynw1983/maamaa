const { fetchFoundr1Order } = require("../../../../server/foundr1-orders");

export async function GET(_request, { params }) {
  const { orderId } = await params;
  const order = await fetchFoundr1Order(orderId);

  if (!order) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ order }, { headers: { "Cache-Control": "no-store" } });
}
