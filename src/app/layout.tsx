import type { Metadata } from "next";
import { Klee_One } from "next/font/google";
import { languageAlternates, localeConfig, type Locale } from "@/data/locales";
import "./globals.css";

const kleeOne = Klee_One({
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-klee-one",
});

export const metadata: Metadata = {
  title: "まぁ麻 | 出来立て麻辣湯",
  description:
    "まぁ麻は、具材、麺、辛さ、しびれを自分好みに選べる麻辣湯専門店です。ご注文ごとに鍋を分け、一杯ずつ出来立てで仕上げます。",
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
    <html lang={htmlLang} className={kleeOne.variable}>
      <body>{children}</body>
    </html>
  );
}
