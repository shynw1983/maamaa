export const localeConfig = {
  ja: { htmlLang: "ja", pathPrefix: "" },
  en: { htmlLang: "en", pathPrefix: "/en" },
  zh: { htmlLang: "zh-Hans", pathPrefix: "/zh" },
  ko: { htmlLang: "ko", pathPrefix: "/ko" },
} as const;

export type Locale = keyof typeof localeConfig;

export const supportedLocales = Object.keys(localeConfig) as Locale[];
export const translatedLocales = supportedLocales.filter((locale) => locale !== "ja");

export const isLocale = (value: string): value is Locale => supportedLocales.includes(value as Locale);

export const withLocalePath = (locale: Locale, path = "/") => {
  const normalizedPath = path === "/" ? "" : path;
  return `${localeConfig[locale].pathPrefix}${normalizedPath}` || "/";
};

export const languageAlternates = (path = "/") =>
  Object.fromEntries(supportedLocales.map((locale) => [localeConfig[locale].htmlLang, withLocalePath(locale, path)]));
