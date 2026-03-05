"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserIcon, Mail, Phone, BadgeAlert, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import type { CurrentUserContext } from "@/lib/types"
import { SectionLoader } from "@/components/ui/page-state"
import { useToast } from "@/hooks/use-toast"
import { toActionErrorMessage } from "@/lib/utils/error"
import { useI18n } from "@/components/providers/i18n-provider"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function DriverProfilePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const isForcedCompletion = searchParams.get("complete") === "1"
  const { toast } = useToast()
  const { t } = useI18n()
  const { data: profile, isLoading, error } = useCurrentUser()

  const [phone, setPhone] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile) return

    setPhone((prev) => (prev === "" ? profile.phone ?? "" : prev))
    setLicenseNumber((prev) => (prev === "" ? profile.licenseNumber ?? "" : prev))
  }, [profile])

  useEffect(() => {
    if (!profile) return

    if (profile.role !== "driver") {
      router.replace("/")
      return
    }

    if (profile.driverProfileComplete && isForcedCompletion) {
      router.replace("/driver")
    }
  }, [isForcedCompletion, profile, router])

  const loadError = error ? toActionErrorMessage(error, t("driver.profile.loadError")) : null

  const handleSave = async () => {
    if (!phone.trim() || !licenseNumber.trim()) {
      const message = t("driver.profile.validationRequired")
      toast({
        title: t("driver.profile.validationFailedTitle"),
        description: message,
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await api.updateMyDriverProfile({
        phone: phone.trim(),
        licenseNumber: licenseNumber.trim(),
      })

      const trimmedPhone = phone.trim()
      const trimmedLicenseNumber = licenseNumber.trim()
      queryClient.setQueryData<CurrentUserContext>(["current-user"], (existing) =>
        existing
          ? {
            ...existing,
            phone: trimmedPhone,
            licenseNumber: trimmedLicenseNumber,
            driverProfileComplete: true,
          }
          : existing,
      )

      await queryClient.invalidateQueries({ queryKey: ["shipments", "driver-current"] })
      toast({
        title: t("driver.profile.savedTitle"),
        description: t("driver.profile.savedDescription"),
      })

      router.replace("/driver")
    } catch (err) {
      const message = toActionErrorMessage(err, t("driver.profile.saveError"))
      toast({
        title: t("driver.profile.saveFailedTitle"),
        description: message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !profile) {
    if (!isLoading && !profile) {
      return (
        <div className="max-w-lg mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{loadError ?? t("driver.profile.loadError")}</AlertDescription>
          </Alert>
        </div>
      )
    }

    return (
      <SectionLoader label={t("driver.profile.loading")} />
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{profile.driverProfileComplete ? t("driver.profile.title") : t("driver.profile.completeTitle")}</h1>
        <p className="text-muted-foreground">{t("driver.profile.subtitle")}</p>
      </div>

      {isForcedCompletion && !profile.driverProfileComplete && (
        <Alert>
          <BadgeAlert className="h-4 w-4" />
          <AlertDescription>{t("driver.profile.forceCompleteMessage")}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <UserIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-xl font-bold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{t("shipments.driver")}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <Label className="text-muted-foreground">{t("employees.table.email")}</Label>
              <p className="mt-1">{profile.email}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="driver-phone">{t("employees.table.phone")}</Label>
            <div className="relative mt-1.5">
              <Phone className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="driver-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-9"
                placeholder="+49 151 12345678"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="driver-license">{t("driver.profile.licenseNumber")}</Label>
            <Input
              id="driver-license"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="mt-1.5"
              placeholder="DE-DRV-123456"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving ? t("driver.profile.saving") : profile.driverProfileComplete ? t("driver.profile.updateAction") : t("driver.profile.completeAction")}
        </Button>
      </Card>
    </div>
  )
}
