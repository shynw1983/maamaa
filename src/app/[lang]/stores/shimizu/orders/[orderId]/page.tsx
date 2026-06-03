import { notFound } from "next/navigation";
import { LocalizedShell } from "@/components/localized-shell";
import { OrderStatusPage } from "@/components/order-status-page";
import { isLocale, translatedLocales } from "@/data/locales";
import { fetchFoundr1Order } from "@/server/foundr1-orders";

export function generateStaticParams() {
  return translatedLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; orderId: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") return {};

  return {
    title: "Pickup number / Order status | まぁ麻",
    description: "Check your pickup number and preparation status for Maama Shimizu shop.",
  };
}

export default async function LocalizedShimizuOrderPage({ params }: { params: Promise<{ lang: string; orderId: string }> }) {
  const { lang, orderId } = await params;
  if (!isLocale(lang) || lang === "ja") notFound();

  const order = await fetchFoundr1Order(orderId);
  if (!order) notFound();

  return (
    <LocalizedShell language={lang}>
      <OrderStatusPage initialOrder={order} />
    </LocalizedShell>
  );
}
