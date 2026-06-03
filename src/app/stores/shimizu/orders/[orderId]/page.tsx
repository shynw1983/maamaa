import { notFound } from "next/navigation";
import { LocalizedShell } from "@/components/localized-shell";
import { OrderStatusPage } from "@/components/order-status-page";
import { getOrder } from "@/server/orders";
import { toPublicOrder } from "@/server/realtime";

export const metadata = {
  title: "受け取り番号・制作状況 | まぁ麻",
  description: "まぁ麻 清水店の受け取り予約の受け取り番号と制作状況を確認できます。",
};

export default async function ShimizuOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await getOrder(orderId);
  if (!order) notFound();

  return (
    <LocalizedShell language="ja">
      <OrderStatusPage initialOrder={toPublicOrder(order)} />
    </LocalizedShell>
  );
}
