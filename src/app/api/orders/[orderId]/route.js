const { cancelFoundr1Order, fetchFoundr1Order } = require("../../../../server/foundr1-orders");

const orderNotFoundError = "注文情報が見つかりません。URLと受け取り番号を確認してください。";
const orderLookupError = "注文情報を確認できませんでした。時間をおいてからもう一度お試しください。";
const cancelFailedError = "キャンセル処理を完了できませんでした。時間をおいてからもう一度お試しください。";
const publicCancelErrors = new Map([
  ["Orders can be cancelled until 30 minutes before pickup.", "受け取り予定時刻の30分前までキャンセルできます。"],
  ["This order cannot be cancelled from this page.", "この注文はこのページからキャンセルできません。"],
  ["KOMOJU says this payment is not refundable.", "このお支払いは自動返金できません。店舗までお問い合わせください。"],
  ["KOMOJU payment was not found.", "決済情報を確認できません。店舗までお問い合わせください。"],
  ["KOMOJU refund authorization failed.", "返金処理を完了できませんでした。店舗までお問い合わせください。"],
  ["KOMOJU refund failed.", "返金処理を完了できませんでした。店舗までお問い合わせください。"],
  ["KOMOJU refund secret is not configured.", "返金処理を完了できませんでした。店舗までお問い合わせください。"],
  ["Payment ID is missing, so the refund cannot be processed automatically.", "決済情報を確認できません。店舗までお問い合わせください。"],
]);

export async function GET(_request, { params }) {
  const { orderId } = await params;
  const order = await fetchFoundr1Order(orderId).catch(() => null);

  if (!order) {
    return Response.json({ error: orderNotFoundError }, { status: 404 });
  }

  return Response.json({ order }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request, { params }) {
  const { orderId } = await params;
  const body = await request.json().catch(() => ({}));
  const result = await cancelFoundr1Order(orderId, body.pickupCode, body.pickupDate).catch(() => ({
    ok: false,
    status: 502,
    error: orderLookupError,
    order: null,
  }));

  if (!result.ok) {
    const error = publicCancelErrors.get(result.error) || (String(result.error || "").includes("KOMOJU") ? "返金処理を完了できませんでした。店舗までお問い合わせください。" : cancelFailedError);
    return Response.json(
      { error, order: result.order },
      { status: result.status, headers: { "Cache-Control": "no-store" } }
    );
  }

  return Response.json({ order: result.order }, { headers: { "Cache-Control": "no-store" } });
}
