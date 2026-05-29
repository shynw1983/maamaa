"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLocale, type Locale } from "@/data/locales";

const LANGUAGE_STORAGE_KEY = "maamaa-language";

const browserLocale = (): Locale => {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];

  for (const language of languages) {
    const normalized = language.toLowerCase();
    if (normalized.startsWith("en")) return "en";
    if (normalized.startsWith("zh")) return "zh";
    if (normalized.startsWith("ko")) return "ko";
    if (normalized.startsWith("ja")) return "ja";
  }

  return "ja";
};

const localePath = (language: Locale, path: string) => {
  if (language === "ja") return path;
  return `/${language}${path === "/" ? "" : path}`;
};

export function ClientLocaleRedirect({
  path,
}: {
  path: "/" | "/stores/shimizu/menu" | "/stores/shimizu/legal/tokusho" | "/stores/shimizu/login";
}) {
  const router = useRouter();

  useEffect(() => {
    let preferredLanguage: Locale | null = null;

    try {
      const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLanguage && isLocale(storedLanguage)) {
        preferredLanguage = storedLanguage;
      }
    } catch {
      // Fall back to browser language.
    }

    const nextLanguage = preferredLanguage || browserLocale();
    if (nextLanguage !== "ja") {
      router.replace(localePath(nextLanguage, path));
    }
  }, [path, router]);

  return null;
}
