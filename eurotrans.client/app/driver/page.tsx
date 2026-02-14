"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, MapPin, ArrowRight, Play } from "lucide-react"
import { api } from "@/lib/api"
import type { Shipment, User } from "@/lib/types"
import { getStatusColor } from "@/lib/utils/format"
import { getSessionUser } from "@/lib/auth"
import { canStartShipment } from "@/lib/shipment-rules"
import { useToast } from "@/hooks/use-toast"

export default function DriverHomePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [activeShipment, setActiveShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const userData = await getSessionUser()

      if (!userData) {
        window.location.href = "/api/auth/login"
        return
      }

      if (userData.role === "manager") {
        router.push("/dashboard")
        return
      }

      if (userData.role === "guest") {
        router.push("/access-denied")
        return
      }

      setUser(userData)

      if (userData) {
        const shipments = await api.getShipments()
        const active = shipments.find((s) => s.driverId === userData.id && s.status !== "delivered")
        setActiveShipment(active || null)
      }
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartJourney = async () => {
    if (!activeShipment) return

    setStarting(true)

    try {
      await api.startShipment(activeShipment.id)

      toast({
        title: "Journey Started",
        description: "Your shipment journey has begun.",
      })

      await loadData()
    } catch (error) {
      console.error("Failed to start journey:", error)
      toast({
        title: "Error",
        description: "Failed to start journey. Please try again.",
        variant: "destructive",
      })
    } finally {
      setStarting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const canStart = activeShipment ? canStartShipment(activeShipment) : false

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold">Hello, {user?.name.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Welcome back to your driver portal</p>
      </div>

      {/* Active Shipment Card */}
      {activeShipment ? (
        <Card className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Current Job</h2>
              <p className="text-sm text-muted-foreground">{activeShipment.trackingId}</p>
            </div>
            <Badge className={getStatusColor(activeShipment.status)}>{activeShipment.status.replace("-", " ")}</Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Cargo</p>
                <p className="text-sm text-muted-foreground">{activeShipment.cargo.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeShipment.cargo.weight} kg • {activeShipment.cargo.volume} m³
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Route</p>
                <p className="text-sm text-muted-foreground">
                  {activeShipment.origin.city} → {activeShipment.destination.city}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{activeShipment.destination.address}</p>
              </div>
            </div>
          </div>

          {canStart && (
            <Button className="w-full h-12 text-base" onClick={handleStartJourney} disabled={starting}>
              <Play className="mr-2 h-5 w-5" />
              {starting ? "Starting Journey..." : "Start Journey"}
            </Button>
          )}

          <Button
            variant={canStart ? "outline" : "default"}
            className="w-full h-12 text-base"
            onClick={() => router.push(`/driver/shipments/${activeShipment.id}`)}
          >
            View Details
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Card>
      ) : (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Active Jobs</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            You currently have no shipments assigned. Check back later or contact dispatch.
          </p>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Status</p>
          <p className="text-lg font-bold">On Duty</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Jobs</p>
          <p className="text-lg font-bold">{activeShipment ? "1" : "0"}</p>
        </Card>
      </div>
    </div>
  )
}
