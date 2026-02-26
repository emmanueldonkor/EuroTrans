import { de } from "./i18n/locales/de"
import { en } from "./i18n/locales/en"
import { fr } from "./i18n/locales/fr"
import type { TranslationDictionary, TranslationKey } from "./i18n/locales/types"

export type Locale = "en" | "de" | "fr"
export type { TranslationKey }

export const translations: Record<Locale, TranslationDictionary> = {
  en,
  de,
  fr,
}

export function translate(locale: Locale, key: TranslationKey): string {
  return translations[locale]?.[key] ?? translations.en[key] ?? key
}

export function useTranslation(locale: Locale = "en") {
  const t = (key: TranslationKey): string => translate(locale, key)
  return { t, locale }
}
