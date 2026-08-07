const cleanBaseUrl = (value = "") => String(value).trim().replace(/\/$/, "");

export const dynamic = "force-dynamic";

export async function GET(request) {
  const storeId = String(new URL(request.url).searchParams.get("storeId") || "").trim();
  const baseUrl = cleanBaseUrl(
    process.env.FOUNDR1_API_BASE_URL ||
    process.env.NEXT_PUBLIC_FOUNDR1_API_BASE_URL ||
    process.env.FOUNDR1_OS_BASE_URL ||
    "https://foundr1.jp",
  );
  const response = await fetch(
    `${baseUrl}/api/public/orders/realtime-config?storeId=${encodeURIComponent(storeId)}`,
    { cache: "no-store" },
  );
  const body = await response.json().catch(() => ({}));
  return Response.json(body, { status: response.status, headers: { "Cache-Control": "no-store" } });
}
