import { notFound, redirect } from "next/navigation";
import { isLocale, translatedLocales, withLocalePath } from "@/data/locales";

export function generateStaticParams() {
  return translatedLocales.map((lang) => ({ lang }));
}

export default async function LocalizedShimizuLoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") notFound();
  redirect(withLocalePath(lang, "/stores/shimizu/menu"));
}
