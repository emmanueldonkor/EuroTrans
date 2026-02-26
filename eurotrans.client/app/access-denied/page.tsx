"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"
import { useI18n } from "@/components/providers/i18n-provider"

export default function AccessDeniedPage() {
  const router = useRouter()
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t("accessDenied.title")}</h1>
          <p className="text-muted-foreground">{t("accessDenied.description")}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={() => router.back()} variant="outline" className="bg-transparent">
            {t("accessDenied.goBack")}
          </Button>
          <Button onClick={() => router.push("/auth/logout")}>{t("accessDenied.returnHome")}</Button>
        </div>
      </Card>
    </div>
  )
}
