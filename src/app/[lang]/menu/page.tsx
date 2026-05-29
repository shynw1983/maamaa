import { notFound, redirect } from "next/navigation";
import { isLocale, translatedLocales, withLocalePath } from "@/data/locales";

export function generateStaticParams() {
  return translatedLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") return {};

  return {
    alternates: {
      canonical: withLocalePath(lang, "/stores/shimizu/menu"),
    },
  };
}

export default async function LocalizedMenuPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") notFound();

  redirect(withLocalePath(lang, "/stores/shimizu/menu"));
}
