const localePrefix = (language) => {
  if (language === "en") return "/en";
  if (language === "zh") return "/zh";
  if (language === "ko") return "/ko";
  return "";
};

export async function GET(request) {
  const url = new URL(request.url);
  const language = url.searchParams.get("lang") || "ja";
  const orderId = url.searchParams.get("orderId") || "";
  const pickupCode = url.searchParams.get("pickupCode") || "";
  const payment = url.searchParams.get("payment") || "return";

  if (!orderId) {
    return Response.redirect(new URL(`${localePrefix(language)}/stores/shimizu/menu?payment=missing`, url.origin));
  }

  const target = new URL(`${localePrefix(language)}/stores/shimizu/orders/${encodeURIComponent(orderId)}`, url.origin);
  if (pickupCode) target.searchParams.set("pickupCode", pickupCode);
  target.searchParams.set("payment", payment);
  return Response.redirect(target);
}
