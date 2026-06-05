"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { SiteHeader } from "@/components/site-header";
import { localizedPath } from "@/components/localized-path";

type PublicOrder = {
  orderId: string;
  pickupCode: string;
  storeName: string;
  status: "pending_payment" | "checkout_failed" | "payment_failed" | "refund_pending" | "new" | "preparing" | "ready" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "canceled" | "refunded";
  refundStatus: string;
  refundError: string;
  refundedAt: string;
  receiptUrl: string;
  drink: string;
  size: string;
  amount: number;
  pickupDate: string;
  pickupTime: string;
  canCancel: boolean;
  cancelDeadline: string;
  cancelWindowMinutes: number;
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
  refund_pending: 0,
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
  refund_pending: "返金処理中",
  cancelled: "キャンセル",
  new: "注文受付",
  preparing: "制作中",
  ready: "受け取り可",
  completed: "受け渡し完了",
};

const cancelErrorLabel: Record<string, string> = {
  "Orders can be cancelled until 30 minutes before pickup.": "受け取り予定時刻の30分前までキャンセルできます。",
  "This order cannot be cancelled from this page.": "この注文はこのページからキャンセルできません。",
  "KOMOJU says this payment is not refundable.": "このお支払いは自動返金できません。店舗までお問い合わせください。",
  "KOMOJU payment was not found.": "決済情報が見つかりません。店舗までお問い合わせください。",
  "KOMOJU refund authorization failed.": "返金処理の認証に失敗しました。店舗までお問い合わせください。",
  "KOMOJU refund failed.": "返金処理に失敗しました。店舗までお問い合わせください。",
  "KOMOJU refund secret is not configured.": "返金設定が未設定です。店舗までお問い合わせください。",
  "Payment ID is missing, so the refund cannot be processed automatically.": "決済情報が不足しているため自動返金できません。店舗までお問い合わせください。",
};
const defaultCancelError = "キャンセル処理を完了できませんでした。時間をおいてからもう一度お試しください。";

export function OrderStatusPage({ initialOrder }: { initialOrder: PublicOrder }) {
  const { language, t } = useI18n();
  const [order, setOrder] = useState(initialOrder);
  const [connection, setConnection] = useState<"connecting" | "live" | "polling">("connecting");
  const [cancelState, setCancelState] = useState<"idle" | "submitting">("idle");
  const [cancelMessage, setCancelMessage] = useState("");
  const currentRank = statusRank[order.status] || (order.paymentStatus === "paid" ? 1 : 0);
  const itemLines = useMemo(() => order.size.split("\n").filter(Boolean), [order.size]);
  const canCancelOrder = order.canCancel && cancelState !== "submitting";

  const cancelOrder = async () => {
    if (!order.canCancel || cancelState === "submitting") return;
    const confirmed = window.confirm(t("この注文をキャンセルしますか？"));
    if (!confirmed) return;

    setCancelState("submitting");
    setCancelMessage("");
    try {
      const response = await fetch(`/api/orders/${order.orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupCode: order.pickupCode,
          pickupDate: order.pickupDate,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (body.order) setOrder(body.order);
      if (!response.ok) {
        const errorText = cancelErrorLabel[body.error] || defaultCancelError;
        setCancelMessage(t(errorText));
        return;
      }
      setCancelMessage(t("注文をキャンセルし、返金しました。"));
    } catch {
      setCancelMessage(t("通信エラーです。時間をおいてもう一度お試しください。"));
    } finally {
      setCancelState("idle");
    }
  };

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
        <p className="kicker">{t("受け取り状況")}</p>
        <h1>{t("受け取り番号")}</h1>
        <strong>{order.pickupCode}</strong>
        <span className={`orderStatusBadge is-${order.status}`}>{t(statusLabel[order.status] || order.status)}</span>
        <div className="orderCancelBlock">
          <p>{t("キャンセル・返金は、受け取り予定時刻の30分前までです。")}</p>
          {order.canCancel ? (
            <button className="button secondary orderCancelButton" type="button" disabled={!canCancelOrder} onClick={cancelOrder}>
              {cancelState === "submitting" ? t("返金処理中") : t("キャンセルして返金")}
            </button>
          ) : null}
          {cancelMessage ? <small>{cancelMessage}</small> : null}
        </div>
      </section>

      <section className="orderStatusLayout">
        <div className="orderProgressPanel">
          <div className="orderProgressHeader">
            <div>
              <p className="kicker">{t(connection === "live" ? "リアルタイム更新" : "自動更新")}</p>
              <h2>{t("制作状況")}</h2>
            </div>
            <span>{order.pickupDate} {order.pickupTime}</span>
          </div>

          <ol className="orderProgressSteps">
            {steps.map((step, index) => {
              const rank = index + 1;
              const isCurrent = currentRank === rank;
              const isComplete = currentRank > rank;
              const stepClassName = isCurrent ? "isCurrent" : isComplete ? "isComplete" : "";
              return (
                <li className={stepClassName} key={step.status}>
                  <span>{rank}</span>
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
              {order.receiptUrl ? (
                <a className="button primary orderPaymentLink" href={order.receiptUrl}>
                  {t("もう一度支払う")}
                </a>
              ) : null}
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
              <dd>{order.paymentStatus === "paid" ? t("支払い済み") : t("未決済")}</dd>
            </div>
          </dl>
          <div className="orderItemSummary">
            {itemLines.map((line, index) => (
              <span key={`${line}-${index}`}>{t(line)}</span>
            ))}
          </div>
          {order.paymentStatus === "paid" ? (
            <a
              className="button primary orderReceiptLink"
              href={`/api/orders/${order.orderId}/receipt?pickupCode=${encodeURIComponent(order.pickupCode)}`}
              download={`receipt-${order.pickupCode}.pdf`}
            >
              {t("領収書 PDF")}
            </a>
          ) : null}
          <a className="button secondary orderBackLink" href={localizedPath(language, "/stores/shimizu/menu")}>
            {t("メニューへ戻る")}
          </a>
        </aside>
      </section>
    </main>
  );
}
