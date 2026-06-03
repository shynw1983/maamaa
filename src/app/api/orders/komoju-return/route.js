const { getOrder, updateOrder } = require("../../../../server/orders");
const { publishOrderEvent } = require("../../../../server/realtime");
const { showSession } = require("../../../../server/komoju");

const localePrefix = (language) => {
  if (language === "en") return "/en";
  if (language === "zh") return "/zh";
  if (language === "ko") return "/ko";
  return "";
};

const paymentIsCaptured = (session) => session?.status === "complete" || session?.status === "completed" || session?.payment?.status === "captured";
const paymentIsFailed = (session) => session?.status === "cancelled" || session?.payment?.status === "failed";

export async function GET(request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("order_id");
  const sessionId = url.searchParams.get("session_id");
  const language = url.searchParams.get("lang") || "ja";
  const orderPath = `${localePrefix(language)}/stores/shimizu/orders/${orderId || ""}`;

  if (!orderId || !sessionId) {
    return Response.redirect(new URL(`${localePrefix(language)}/stores/shimizu/menu?payment=missing`, url.origin));
  }

  const order = await getOrder(orderId);
  if (!order || order.paymentReference !== sessionId) {
    return Response.redirect(new URL(`${orderPath}?payment=not_found`, url.origin));
  }

  try {
    const session = await showSession(sessionId, { storeId: order.storeId });

    if (paymentIsCaptured(session)) {
      const updatedOrder = await updateOrder(order, {
        status: "new",
        paymentStatus: "paid",
        paymentProvider: "komoju",
        paymentReference: sessionId,
        paymentUpdatedAt: new Date().toISOString(),
        paidAt: session.payment?.captured_at || new Date().toISOString(),
      });
      await publishOrderEvent("order.created", updatedOrder);
      return Response.redirect(new URL(`${orderPath}?payment=paid`, url.origin));
    }

    if (paymentIsFailed(session)) {
      const updatedOrder = await updateOrder(order, {
        status: "payment_failed",
        paymentStatus: "failed",
        paymentUpdatedAt: new Date().toISOString(),
      });
      await publishOrderEvent("order.updated", updatedOrder);
      return Response.redirect(new URL(`${orderPath}?payment=failed`, url.origin));
    }
  } catch {
    return Response.redirect(new URL(`${orderPath}?payment=check_failed`, url.origin));
  }

  return Response.redirect(new URL(`${orderPath}?payment=pending`, url.origin));
}
