import { notFound } from "next/navigation";
import { LocalizedShell } from "@/components/localized-shell";
import { ShimizuReservationLogin } from "@/components/shimizu-reservation-login";
import { isLocale, languageAlternates, translatedLocales, withLocalePath } from "@/data/locales";

const shimizuLoginPath = "/stores/shimizu/login";

export function generateStaticParams() {
  return translatedLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") return {};

  return {
    title: "Shimizu pickup login | Maama",
    description: "Login page for reviewing Maama Shimizu Shop pickup reservations.",
    alternates: {
      canonical: withLocalePath(lang, shimizuLoginPath),
      languages: languageAlternates(shimizuLoginPath),
    },
  };
}

export default async function LocalizedShimizuLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{ next?: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "ja") notFound();

  const query = await searchParams;
  const fallbackPath = withLocalePath(lang, "/stores/shimizu/menu");
  const nextPath = query?.next?.startsWith("/") ? query.next : fallbackPath;

  return (
    <LocalizedShell language={lang}>
      <ShimizuReservationLogin nextPath={nextPath} />
    </LocalizedShell>
  );
}
