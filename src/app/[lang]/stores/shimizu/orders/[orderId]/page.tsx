import { notFound } from "next/navigation";
import { LocalizedShell } from "@/components/localized-shell";
import { OrderStatusPage } from "@/components/order-status-page";
import { isLocale } from "@/data/locales";
import { fetchFoundr1Order } from "@/server/foundr1-orders";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ lang: string; orderId: string }> }) {
  const { lang, orderId } = await params;
  if (!isLocale(lang) || lang === "ja") return {};
  const order = await fetchFoundr1Order(orderId).catch(() => null);
  const storeDisplayName = order?.storeName || "maamaa";

  return {
    title: `Pickup number / Order status | ${storeDisplayName}`,
    description: `Check your pickup number and preparation status for ${storeDisplayName}.`,
  };
}

export default async function LocalizedShimizuOrderPage({ params }: { params: Promise<{ lang: string; orderId: string }> }) {
  const { lang, orderId } = await params;
  if (!isLocale(lang) || lang === "ja") notFound();

  const order = await fetchFoundr1Order(orderId).catch(() => null);
  if (!order) notFound();

  return (
    <LocalizedShell language={lang}>
      <OrderStatusPage initialOrder={order} />
    </LocalizedShell>
  );
}
