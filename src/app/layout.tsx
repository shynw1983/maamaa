import type { Metadata } from "next";
import { languageAlternates, localeConfig, type Locale } from "@/data/locales";
import "./globals.css";

export const metadata: Metadata = {
  title: "まぁ麻 | 出来立て麻辣湯",
  description:
    "まぁ麻は注文を受けてから一杯ずつ仕上げる、出来立て麻辣湯のブランドです。デリバリー、ピックアップ、イートインへ展開しています。",
  alternates: {
    canonical: "/",
    languages: languageAlternates("/"),
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: Promise<{ lang?: Locale }>;
}>) {
  const routeParams = await params;
  const htmlLang = localeConfig[routeParams?.lang || "ja"]?.htmlLang || "ja";

  return (
    <html lang={htmlLang}>
      <body>{children}</body>
    </html>
  );
}
