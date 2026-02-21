"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import type { Locale } from "@/lib/i18n"
import { useI18n } from "@/components/providers/i18n-provider"

const languages = [
  { code: "en" as Locale, label: "English", token: "EN" },
  { code: "de" as Locale, label: "Deutsch", token: "DE" },
  { code: "fr" as Locale, label: "Français", token: "FR" },
]

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLocale(language.code)}
            className="flex items-center gap-2"
          >
            <span className="inline-flex h-5 min-w-8 items-center justify-center rounded bg-muted px-1 text-[10px] font-semibold text-muted-foreground">
              {language.token}
            </span>
            <span>{language.label}</span>
            {locale === language.code && <span className="ml-auto text-primary">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
