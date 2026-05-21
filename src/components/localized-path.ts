import type { Locale } from "@/data/locales";

export const localizedPath = (language: Locale, path: string) => (language === "ja" ? path : `/${language}${path}`);
