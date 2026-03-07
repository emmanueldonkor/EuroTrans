"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Check, Globe } from "lucide-react"
import type { Locale } from "@/lib/i18n"
import { useI18n } from "@/components/providers/i18n-provider"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { useQueryClient } from "@tanstack/react-query"
import type { CurrentUserContext } from "@/lib/types"

const languages = [
  { code: "en" as Locale, label: "English", token: "EN" },
  { code: "de" as Locale, label: "Deutsch", token: "DE" },
  { code: "fr" as Locale, label: "Francais", token: "FR" },
]

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleSelectLanguage = async (nextLocale: Locale) => {
    if (nextLocale === locale) return

    const previousLocale = locale
    setLocale(nextLocale)
    const previousCurrentUser = queryClient.getQueryData<CurrentUserContext>(["current-user"])

    if (previousCurrentUser) {
      queryClient.setQueryData<CurrentUserContext>(["current-user"], {
        ...previousCurrentUser,
        preferredLanguage: nextLocale,
      })
    }

    try {
      await api.updatePreferredLanguage(nextLocale)
    } catch {
      setLocale(previousLocale)

      if (previousCurrentUser) {
        queryClient.setQueryData<CurrentUserContext>(["current-user"], previousCurrentUser)
      }

      toast({
        title: t("language.saveErrorTitle"),
        description: t("language.saveErrorDescription"),
        variant: "destructive",
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t("language.switch")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => {
              void handleSelectLanguage(language.code)
            }}
            className="flex items-center gap-2"
          >
            <span className="inline-flex h-5 min-w-8 items-center justify-center rounded bg-muted px-1 text-[10px] font-semibold text-muted-foreground">
              {language.token}
            </span>
            <span>{language.label}</span>
            {locale === language.code && <Check className="ml-auto h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
