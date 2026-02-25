"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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

export default function DriverProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isForcedCompletion = searchParams.get("complete") === "1"
  const { toast } = useToast()

  const [profile, setProfile] = useState<CurrentUserContext | null>(null)
  const [phone, setPhone] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoadError(null)
      try {
        const me = await api.getCurrentUserContext()
        setProfile(me)
        setPhone(me.phone ?? "")
        setLicenseNumber(me.licenseNumber ?? "")
      } catch (err) {
        setLoadError(toActionErrorMessage(err, "Failed to load driver profile."))
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const handleSave = async () => {
    if (!phone.trim() || !licenseNumber.trim()) {
      const message = "Phone and license number are required."
      toast({
        title: "Validation failed",
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

      const me = await api.getCurrentUserContext()
      setProfile(me)
      toast({
        title: "Profile saved",
        description: "Your driver profile was updated.",
      })

      if (me.driverProfileComplete) {
        router.push("/driver")
      }
    } catch (err) {
      const message = toActionErrorMessage(err, "Failed to update profile.")
      toast({
        title: "Save failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading || !profile) {
    if (!loading && !profile) {
      return (
        <div className="max-w-lg mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{loadError ?? "Failed to load driver profile."}</AlertDescription>
          </Alert>
        </div>
      )
    }

    return (
      <SectionLoader label="Loading profile..." />
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{profile.driverProfileComplete ? "Profile" : "Complete Profile"}</h1>
        <p className="text-muted-foreground">Your driver information</p>
      </div>

      {isForcedCompletion && !profile.driverProfileComplete && (
        <Alert>
          <BadgeAlert className="h-4 w-4" />
          <AlertDescription>
            Complete your driver profile to access shipments and the rest of the driver app.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <UserIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-xl font-bold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">Driver</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <Label className="text-muted-foreground">Email</Label>
              <p className="mt-1">{profile.email}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="driver-phone">Phone</Label>
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
            <Label htmlFor="driver-license">License Number</Label>
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
          {saving ? "Saving..." : profile.driverProfileComplete ? "Update Profile" : "Complete Profile"}
        </Button>
      </Card>
    </div>
  )
}
