import { notFound } from "next/navigation";
import { LocalizedShell } from "@/components/localized-shell";
import { OrderStatusPage } from "@/components/order-status-page";
import { fetchFoundr1Order } from "@/server/foundr1-orders";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await fetchFoundr1Order(orderId).catch(() => null);
  const storeDisplayName = order?.storeName || "まぁ麻";

  return {
    title: `受け取り番号・制作状況 | ${storeDisplayName}`,
    description: `${storeDisplayName}の受け取り予約の受け取り番号と制作状況を確認できます。`,
  };
}

export default async function ShimizuOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await fetchFoundr1Order(orderId).catch(() => null);
  if (!order) notFound();

  return (
    <LocalizedShell language="ja">
      <OrderStatusPage initialOrder={order} />
    </LocalizedShell>
  );
}
