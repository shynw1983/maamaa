const { fetchFoundr1Receipt } = require("../../../../../server/foundr1-orders");

export async function GET(request, { params }) {
  const { orderId } = await params;
  const pickupCode = new URL(request.url).searchParams.get("pickupCode") || "";
  if (!pickupCode) {
    return Response.json({ error: "領収書の確認に必要な情報が不足しています。" }, { status: 400 });
  }

  const receipt = await fetchFoundr1Receipt(orderId, pickupCode).catch(() => null);
  if (!receipt) {
    return Response.json({ error: "領収書を取得できませんでした。時間をおいてからもう一度お試しください。" }, { status: 502 });
  }
  if (!receipt.ok) {
    return Response.json(
      { error: "領収書を取得できませんでした。注文情報を確認してください。" },
      { status: receipt.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  return new Response(receipt.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": receipt.disposition,
      "Cache-Control": "no-store",
    },
  });
}
