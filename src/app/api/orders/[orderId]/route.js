const { cancelFoundr1Order, fetchFoundr1Order } = require("../../../../server/foundr1-orders");

export async function GET(_request, { params }) {
  const { orderId } = await params;
  const order = await fetchFoundr1Order(orderId);

  if (!order) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ order }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request, { params }) {
  const { orderId } = await params;
  const body = await request.json().catch(() => ({}));
  const result = await cancelFoundr1Order(orderId, body.pickupCode, body.pickupDate);

  if (!result.ok) {
    return Response.json(
      { error: result.error || "Cancel failed", order: result.order },
      { status: result.status, headers: { "Cache-Control": "no-store" } }
    );
  }

  return Response.json({ order: result.order }, { headers: { "Cache-Control": "no-store" } });
}
