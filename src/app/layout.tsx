import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "まぁ麻 | 出来立て麻辣湯",
  description:
    "まぁ麻は注文を受けてから一杯ずつ仕上げる、出来立て麻辣湯のブランドです。デリバリー、ピックアップ、イートインへ展開しています。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
