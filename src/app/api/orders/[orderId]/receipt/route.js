const { fetchFoundr1Receipt } = require("../../../../../server/foundr1-orders");

export async function GET(request, { params }) {
  const { orderId } = await params;
  const pickupCode = new URL(request.url).searchParams.get("pickupCode") || "";
  if (!pickupCode) {
    return Response.json({ error: "pickupCode is required" }, { status: 400 });
  }

  const receipt = await fetchFoundr1Receipt(orderId, pickupCode);
  if (!receipt.ok) {
    return new Response(receipt.body, {
      status: receipt.status,
      headers: { "Content-Type": receipt.contentType, "Cache-Control": "no-store" },
    });
  }

  return new Response(receipt.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": receipt.disposition,
      "Cache-Control": "no-store",
    },
  });
}
