"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Locale, TranslationKey, translate } from "@/lib/i18n"

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const I18N_STORAGE_KEY = "eurotrans.locale"

const I18nContext = createContext<I18nContextValue | null>(null)

const SUPPORTED_LOCALES: Locale[] = ["en", "de", "fr"]

function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale)
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en"

    const storedLocale = window.localStorage.getItem(I18N_STORAGE_KEY)
    if (storedLocale && isLocale(storedLocale)) {
      return storedLocale
    }

    const browserLocale = navigator.language.slice(0, 2).toLowerCase()
    if (isLocale(browserLocale)) {
      return browserLocale
    }

    return "en"
  })

  useEffect(() => {
    document.documentElement.lang = locale
    window.localStorage.setItem(I18N_STORAGE_KEY, locale)
  }, [locale])

  const t = useCallback((key: TranslationKey) => translate(locale, key), [locale])

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }

  return context
}
