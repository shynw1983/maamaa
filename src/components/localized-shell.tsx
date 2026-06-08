import { I18nProvider } from "@/components/i18n-provider";
import type { Locale } from "@/data/locales";

import en from "../../public/locales/en.json";
import ja from "../../public/locales/ja.json";
import ko from "../../public/locales/ko.json";
import ne from "../../public/locales/ne.json";
import vi from "../../public/locales/vi.json";
import zh from "../../public/locales/zh.json";

const dictionaries = { en, ja, ko, ne, vi, zh };

export function LocalizedShell({ language, children }: { language: Locale; children: React.ReactNode }) {
  return (
    <I18nProvider initialLanguage={language} initialDictionary={dictionaries[language] || {}}>
      {children}
    </I18nProvider>
  );
}
