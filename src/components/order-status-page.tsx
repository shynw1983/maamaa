"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { SiteHeader } from "@/components/site-header";
import { localizedPath } from "@/components/localized-path";

type PublicOrder = {
  orderId: string;
  pickupCode: string;
  storeName: string;
  status: "pending_payment" | "checkout_failed" | "payment_failed" | "new" | "preparing" | "ready" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "canceled";
  receiptUrl: string;
  drink: string;
  size: string;
  amount: number;
  pickupDate: string;
  pickupTime: string;
};

const yen = new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" });

const steps = [
  { status: "paid", label: "注文受付" },
  { status: "preparing", label: "制作中" },
  { status: "ready", label: "受け取り可" },
  { status: "completed", label: "受け渡し完了" },
] as const;

const statusRank: Record<string, number> = {
  pending_payment: 0,
  checkout_failed: 0,
  payment_failed: 0,
  cancelled: 0,
  new: 1,
  preparing: 2,
  ready: 3,
  completed: 4,
};

const statusLabel: Record<string, string> = {
  pending_payment: "お支払い待ち",
  checkout_failed: "決済作成失敗",
  payment_failed: "決済失敗",
  cancelled: "キャンセル",
  new: "注文受付",
  preparing: "制作中",
  ready: "受け取り可",
  completed: "受け渡し完了",
};

export function OrderStatusPage({ initialOrder }: { initialOrder: PublicOrder }) {
  const { language, t } = useI18n();
  const [order, setOrder] = useState(initialOrder);
  const [connection, setConnection] = useState<"connecting" | "live" | "polling">("connecting");
  const currentRank = statusRank[order.status] || (order.paymentStatus === "paid" ? 1 : 0);
  const itemLines = useMemo(() => order.size.split("\n").filter(Boolean), [order.size]);

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      const response = await fetch(`/api/orders/${order.orderId}`, { cache: "no-store" });
      if (!active || !response.ok) return;
      const body = await response.json();
      if (body.order) setOrder(body.order);
    };

    const connectRealtime = async () => {
      try {
        const response = await fetch(`/api/orders/${order.orderId}/realtime-config`, { cache: "no-store" });
        if (!response.ok) throw new Error("config failed");
        const config = await response.json();
        if (!config.available) throw new Error("realtime unavailable");

        const { default: Pusher } = await import("pusher-js");
        const pusher = new Pusher(config.key, {
          cluster: config.cluster,
          forceTLS: true,
        });
        const channel = pusher.subscribe(config.channel);
        channel.bind("order.created", ({ order: nextOrder }: { order: PublicOrder }) => setOrder(nextOrder));
        channel.bind("order.updated", ({ order: nextOrder }: { order: PublicOrder }) => setOrder(nextOrder));
        channel.bind("pusher:subscription_succeeded", () => {
          if (active) setConnection("live");
        });

        return () => {
          pusher.unsubscribe(config.channel);
          pusher.disconnect();
        };
      } catch {
        if (active) setConnection("polling");
        const interval = window.setInterval(refresh, 8000);
        refresh();
        return () => window.clearInterval(interval);
      }
    };

    let cleanup: (() => void) | undefined;
    connectRealtime().then((nextCleanup) => {
      cleanup = nextCleanup;
    });

    return () => {
      active = false;
      cleanup?.();
    };
  }, [order.orderId]);

  return (
    <main>
      <SiteHeader menu />
      <section className="orderStatusHero">
        <p className="kicker">{t("Pickup status")}</p>
        <h1>{t("取单号码")}</h1>
        <strong>{order.pickupCode}</strong>
        <span className={`orderStatusBadge is-${order.status}`}>{t(statusLabel[order.status] || order.status)}</span>
      </section>

      <section className="orderStatusLayout">
        <div className="orderProgressPanel">
          <div className="orderProgressHeader">
            <div>
              <p className="kicker">{t(connection === "live" ? "Live update" : "Auto refresh")}</p>
              <h2>{t("制作过程")}</h2>
            </div>
            <span>{order.pickupDate} {order.pickupTime}</span>
          </div>

          <ol className="orderProgressSteps">
            {steps.map((step, index) => {
              const isDone = currentRank >= index + 1;
              const isCurrent = currentRank === index + 1;
              return (
                <li className={isDone ? "isDone" : ""} key={step.status}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{t(step.label)}</strong>
                    {isCurrent ? <small>{t("現在のステータス")}</small> : null}
                  </div>
                </li>
              );
            })}
          </ol>

          {order.paymentStatus !== "paid" ? (
            <div className="orderPaymentNotice">
              <strong>{t("お支払いがまだ完了していません")}</strong>
              <span>{t("決済完了後に注文が店舗へ送信されます。")}</span>
            </div>
          ) : null}
        </div>

        <aside className="orderDetailPanel">
          <p className="kicker">{t(order.storeName)}</p>
          <h2>{t("注文内容")}</h2>
          <dl>
            <div>
              <dt>{t("合計")}</dt>
              <dd>{yen.format(order.amount)}</dd>
            </div>
            <div>
              <dt>{t("受け取り時間")}</dt>
              <dd>{order.pickupDate} {order.pickupTime}</dd>
            </div>
            <div>
              <dt>{t("支払い")}</dt>
              <dd>{order.paymentStatus === "paid" ? t("支払済み") : t("未決済")}</dd>
            </div>
          </dl>
          <div className="orderItemSummary">
            {itemLines.map((line, index) => (
              <span key={`${line}-${index}`}>{line}</span>
            ))}
          </div>
          <a className="button secondary orderBackLink" href={localizedPath(language, "/stores/shimizu/menu")}>
            {t("メニューへ戻る")}
          </a>
        </aside>
      </section>
    </main>
  );
}
