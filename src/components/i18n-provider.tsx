"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { localeConfig, type Locale } from "@/data/locales";

const LANGUAGE_STORAGE_KEY = "maamaa-language";
const LOCALE_CACHE_VERSION = "20260702-maamaa-store-carousel";

type Dictionary = Record<string, string>;

const I18nContext = createContext<{
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: (value: string) => string;
}>({
  language: "ja",
  setLanguage: () => {},
  t: (value) => value,
});

const translateText = (value: string, dictionary: Dictionary) => {
  if (!value) return value;

  const exact = dictionary[value];
  if (exact) return exact;

  let translated = value;
  Object.entries(dictionary)
    .filter(([source, target]) => source.length > 3 && target && translated.includes(source))
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([source, target]) => {
      translated = translated.split(source).join(target);
    });

  return translated;
};

export function I18nProvider({
  children,
  initialLanguage = "ja",
  initialDictionary = {},
}: {
  children: React.ReactNode;
  initialLanguage?: Locale;
  initialDictionary?: Dictionary;
}) {
  const [language, setLanguage] = useState<Locale>(initialLanguage);
  const [dictionary, setDictionary] = useState<Dictionary>(initialLanguage === "ja" ? {} : initialDictionary);

  const selectLanguage = useCallback((nextLanguage: Locale) => {
    setLanguage(nextLanguage);

    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch {
      // Continue without persistence.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = localeConfig[language]?.htmlLang || "ja";

    if (language === "ja") {
      setDictionary({});
      return;
    }

    let active = true;
    const storageKey = `maamaa-dictionary-${LOCALE_CACHE_VERSION}-${language}`;

    const load = async () => {
      let cachedDictionary: Dictionary | null = null;

      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          cachedDictionary = JSON.parse(cached) as Dictionary;
          if (active) setDictionary(cachedDictionary);
        }
      } catch {
        // Fetch a fresh copy below.
      }

      try {
        const response = await fetch(`/locales/${language}.json`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          if (active && !cachedDictionary) setDictionary({});
          return;
        }

        const nextDictionary = (await response.json()) as Dictionary;

        if (active) setDictionary(nextDictionary);

        try {
          if (Object.keys(nextDictionary).length) {
            localStorage.setItem(storageKey, JSON.stringify(nextDictionary));
          }
        } catch {
          // Ignore cache failures.
        }
      } catch {
        if (active && !cachedDictionary) setDictionary({});
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: selectLanguage,
      t: (text: string) => translateText(text, dictionary),
    }),
    [dictionary, language, selectLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
