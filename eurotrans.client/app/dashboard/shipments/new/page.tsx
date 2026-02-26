"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import type { Location } from "@/lib/types"
import { validateShipmentData } from "@/lib/shipment-rules"
import { useToast } from "@/hooks/use-toast"
import { toActionErrorMessage } from "@/lib/utils/error"
import { useI18n } from "@/components/providers/i18n-provider"

export default function NewShipmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const [cargo, setCargo] = useState({
    description: "",
    weight: "",
    volume: "",
  })
  const [origin, setOrigin] = useState<Partial<Location>>({
    address: "",
    city: "",
    country: "",
    postalCode: "",
    lat: 0,
    lng: 0,
  })
  const [destination, setDestination] = useState<Partial<Location>>({
    address: "",
    city: "",
    country: "",
    postalCode: "",
    lat: 0,
    lng: 0,
  })

  const handleSubmit = async () => {
    const validation = validateShipmentData({
      cargo: {
        description: cargo.description,
        weight: Number.parseFloat(cargo.weight),
        volume: Number.parseFloat(cargo.volume),
      },
      origin,
      destination,
    })

    if (!validation.valid) {
      toast({
        title: t("shipments.new.validationFailedTitle"),
        description: validation.errors[0] ?? t("shipments.new.validationFailedDescription"),
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const newShipment = await api.createShipment({
        cargo: {
          description: cargo.description,
          weight: Number.parseFloat(cargo.weight),
          volume: Number.parseFloat(cargo.volume),
        },
        origin: {
          ...origin,
          lat: origin.lat ?? 0,
          lng: origin.lng ?? 0,
        } as Location,
        destination: {
          ...destination,
          lat: destination.lat ?? 0,
          lng: destination.lng ?? 0,
        } as Location,
      })

      toast({
        title: t("shipments.new.createdTitle"),
        description: t("shipments.new.createdDescription"),
      })
      router.push(`/dashboard/shipments/${newShipment.id}`)
    } catch (error) {
      const fullMessage = toActionErrorMessage(error, t("shipments.new.createErrorFallback"))
      toast({
        title: t("shipments.new.createErrorTitle"),
        description: fullMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/shipments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("shipments.create")}</h1>
          <p className="text-muted-foreground">{t("shipments.new.stepProgress").replace("{step}", String(step))}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 panel p-3">
        {[
          { index: 1, label: t("shipments.new.step.cargo") },
          { index: 2, label: t("shipments.new.step.route") },
          { index: 3, label: t("shipments.new.step.review") },
        ].map((item) => {
          const isActive = step === item.index
          const isComplete = step > item.index

          return (
            <div key={item.index} className="space-y-2">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full motion-smooth ${isComplete || isActive ? "w-full bg-primary" : "w-0 bg-primary"}`}
                />
              </div>
              <p className={`text-xs font-medium ${isComplete || isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {item.label}
              </p>
            </div>
          )
        })}
      </div>

      {step === 1 && (
        <Card className="panel p-6 space-y-6 surface-hover">
          <h2 className="text-xl font-semibold">{t("shipments.new.cargoDetails")}</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="description">{t("shipments.new.description")}</Label>
              <Textarea
                id="description"
                placeholder={t("shipments.new.descriptionPlaceholder")}
                value={cargo.description}
                onChange={(e) => setCargo({ ...cargo, description: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">{t("shipments.new.weight")}</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="450"
                  value={cargo.weight}
                  onChange={(e) => setCargo({ ...cargo, weight: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="volume">{t("shipments.new.volume")}</Label>
                <Input
                  id="volume"
                  type="number"
                  step="0.1"
                  placeholder="2.5"
                  value={cargo.volume}
                  onChange={(e) => setCargo({ ...cargo, volume: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <Button onClick={() => setStep(2)} className="w-full">
            {t("shipments.new.nextRoute")}
          </Button>
        </Card>
      )}

      {step === 2 && (
        <Card className="panel p-6 space-y-6 surface-hover">
          <h2 className="text-xl font-semibold">{t("shipments.new.routeInformation")}</h2>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("shipments.new.origin")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="origin-address">{t("shipments.new.address")}</Label>
                  <Input
                    id="origin-address"
                    placeholder="Logistics Hub 1"
                    value={origin.address}
                    onChange={(e) => setOrigin({ ...origin, address: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="origin-city">{t("shipments.new.city")}</Label>
                  <Input
                    id="origin-city"
                    placeholder="Berlin"
                    value={origin.city}
                    onChange={(e) => setOrigin({ ...origin, city: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="origin-postal">{t("shipments.new.postalCode")}</Label>
                  <Input
                    id="origin-postal"
                    placeholder="10115"
                    value={origin.postalCode}
                    onChange={(e) => setOrigin({ ...origin, postalCode: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="origin-country">{t("shipments.new.country")}</Label>
                  <Input
                    id="origin-country"
                    placeholder="Germany"
                    value={origin.country}
                    onChange={(e) => setOrigin({ ...origin, country: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("shipments.new.destination")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="dest-address">{t("shipments.new.address")}</Label>
                  <Input
                    id="dest-address"
                    placeholder="Distribution Center"
                    value={destination.address}
                    onChange={(e) => setDestination({ ...destination, address: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="dest-city">{t("shipments.new.city")}</Label>
                  <Input
                    id="dest-city"
                    placeholder="Paris"
                    value={destination.city}
                    onChange={(e) => setDestination({ ...destination, city: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="dest-postal">{t("shipments.new.postalCode")}</Label>
                  <Input
                    id="dest-postal"
                    placeholder="75001"
                    value={destination.postalCode}
                    onChange={(e) => setDestination({ ...destination, postalCode: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="dest-country">{t("shipments.new.country")}</Label>
                  <Input
                    id="dest-country"
                    placeholder="France"
                    value={destination.country}
                    onChange={(e) => setDestination({ ...destination, country: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              {t("shipments.new.back")}
            </Button>
            <Button onClick={() => setStep(3)} className="flex-1">
              {t("shipments.new.nextReview")}
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="panel p-6 space-y-6 surface-hover">
          <div>
            <h2 className="text-xl font-semibold mb-4">{t("shipments.new.reviewTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("shipments.new.reviewDescription")}</p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("shipments.new.step.cargo")}</h3>
              <p className="text-base">{cargo.description}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {cargo.weight} kg | {cargo.volume} m3
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("shipments.new.origin")}</h3>
              <p className="text-base">{origin.address}</p>
              <p className="text-sm text-muted-foreground">
                {origin.city}, {origin.postalCode}, {origin.country}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("shipments.new.destination")}</h3>
              <p className="text-base">{destination.address}</p>
              <p className="text-sm text-muted-foreground">
                {destination.city}, {destination.postalCode}, {destination.country}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={loading}>
              {t("shipments.new.back")}
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? t("shipments.new.creating") : t("shipments.create")}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
