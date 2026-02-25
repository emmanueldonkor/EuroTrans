"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { api } from "@/lib/api"
import type { Location } from "@/lib/types"
import { validateShipmentData } from "@/lib/shipment-rules"

export default function NewShipmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<string[]>([])

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
      setErrors(validation.errors)
      return
    }

    setLoading(true)
    setErrors([])

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

      router.push(`/dashboard/shipments/${newShipment.id}`)
    } catch (error) {
      const fullMessage = error instanceof Error ? error.message : String(error)
      setErrors([fullMessage || "Unknown error"])
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
          <h1 className="text-3xl font-bold tracking-tight">Create Shipment</h1>
          <p className="text-muted-foreground">Step {step} of 3</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 panel p-3">
        {[
          { index: 1, label: "Cargo" },
          { index: 2, label: "Route" },
          { index: 3, label: "Review" },
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

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {step === 1 && (
        <Card className="panel p-6 space-y-6 surface-hover">
          <h2 className="text-xl font-semibold">Cargo Details</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Electronics - Laptops and accessories"
                value={cargo.description}
                onChange={(e) => setCargo({ ...cargo, description: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
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
                <Label htmlFor="volume">Volume (m3)</Label>
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
            Next: Origin and Destination
          </Button>
        </Card>
      )}

      {step === 2 && (
        <Card className="panel p-6 space-y-6 surface-hover">
          <h2 className="text-xl font-semibold">Route Information</h2>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Origin</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="origin-address">Address</Label>
                  <Input
                    id="origin-address"
                    placeholder="Logistics Hub 1"
                    value={origin.address}
                    onChange={(e) => setOrigin({ ...origin, address: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="origin-city">City</Label>
                  <Input
                    id="origin-city"
                    placeholder="Berlin"
                    value={origin.city}
                    onChange={(e) => setOrigin({ ...origin, city: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="origin-postal">Postal Code</Label>
                  <Input
                    id="origin-postal"
                    placeholder="10115"
                    value={origin.postalCode}
                    onChange={(e) => setOrigin({ ...origin, postalCode: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="origin-country">Country</Label>
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
              <h3 className="text-lg font-medium">Destination</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="dest-address">Address</Label>
                  <Input
                    id="dest-address"
                    placeholder="Distribution Center"
                    value={destination.address}
                    onChange={(e) => setDestination({ ...destination, address: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="dest-city">City</Label>
                  <Input
                    id="dest-city"
                    placeholder="Paris"
                    value={destination.city}
                    onChange={(e) => setDestination({ ...destination, city: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="dest-postal">Postal Code</Label>
                  <Input
                    id="dest-postal"
                    placeholder="75001"
                    value={destination.postalCode}
                    onChange={(e) => setDestination({ ...destination, postalCode: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="dest-country">Country</Label>
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
              Back
            </Button>
            <Button onClick={() => setStep(3)} className="flex-1">
              Next: Review
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="panel p-6 space-y-6 surface-hover">
          <div>
            <h2 className="text-xl font-semibold mb-4">Review and Create Shipment</h2>
            <p className="text-sm text-muted-foreground">Review the details and create this shipment.</p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Cargo</h3>
              <p className="text-base">{cargo.description}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {cargo.weight} kg | {cargo.volume} m3
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Origin</h3>
              <p className="text-base">{origin.address}</p>
              <p className="text-sm text-muted-foreground">
                {origin.city}, {origin.postalCode}, {origin.country}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Destination</h3>
              <p className="text-base">{destination.address}</p>
              <p className="text-sm text-muted-foreground">
                {destination.city}, {destination.postalCode}, {destination.country}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={loading}>
              Back
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating Shipment..." : "Create Shipment"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
