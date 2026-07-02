import type { Metadata } from "next";
import { Gowun_Batang, Klee_One, LXGW_WenKai_TC, Newsreader } from "next/font/google";
import { languageAlternates, localeConfig, type Locale } from "@/data/locales";
import "./globals.css";

const kleeOne = Klee_One({
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-klee-one",
});

const lxgwWenKai = LXGW_WenKai_TC({
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-lxgw-wenkai",
});

const gowunBatang = Gowun_Batang({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-gowun-batang",
});

const newsreader = Newsreader({
  weight: ["400", "500"],
  axes: ["opsz"],
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "まぁ麻 | 出来立て麻辣湯",
  description:
    "まぁ麻は、選ぶ楽しさと出来立ての香りを大切にする麻辣湯専門店です。一杯ずつ鍋を分けて仕上げる、熱々の一杯をお楽しみください。",
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
    <html lang={htmlLang} className={`${kleeOne.variable} ${lxgwWenKai.variable} ${gowunBatang.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
