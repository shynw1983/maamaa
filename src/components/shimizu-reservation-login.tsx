"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";

export function ShimizuReservationLogin({ nextPath = "/stores/shimizu/menu" }: { nextPath?: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/stores/shimizu/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      setError(t("ユーザー名またはパスワードが違います。"));
      setIsSubmitting(false);
      return;
    }

    router.push(nextPath);
    router.refresh();
  };

  return (
    <main className="store-login-page">
      <section className="store-login-card">
        <p className="kicker">{t("Maama Shimizu Shop")}</p>
        <h1>{t("清水店 受け取り予約ログイン")}</h1>
        <p className="store-login-hint">{t("確認用のユーザー名とパスワードを入力してください。")}</p>
        <form onSubmit={handleSubmit}>
          <label>
            {t("ユーザー名")}
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              autoFocus
              required
            />
          </label>
          <label>
            {t("パスワード")}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("ログイン中...") : t("ログイン")}
          </button>
        </form>
        {error ? <p className="formError">{error}</p> : null}
      </section>
    </main>
  );
}
