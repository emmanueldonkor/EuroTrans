"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import { api } from "@/lib/api"
import type { LiveMapPin } from "@/lib/types"
import { getStatusColor, formatDate } from "@/lib/utils/format"

export default function LiveMapPage() {
  const [pins, setPins] = useState<LiveMapPin[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPin, setSelectedPin] = useState<LiveMapPin | null>(null)

  useEffect(() => {
    loadPins()
    const interval = setInterval(loadPins, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadPins = async () => {
    try {
      const data = await api.getLiveMapPins()
      setPins(data)
    } catch (error) {
      console.error("Failed to load map pins:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Map</h1>
        <p className="text-muted-foreground">Real-time tracking of in-transit shipments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <Card className="lg:col-span-2 p-6 min-h-[600px] flex items-center justify-center bg-muted/20">
          <div className="text-center space-y-4">
            <MapPin className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">Interactive Map Coming Soon</p>
              <p className="text-sm text-muted-foreground">
                Leaflet integration will show real-time positions of all in-transit shipments
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {pins.length} active shipment{pins.length !== 1 ? "s" : ""}
            </div>
          </div>
        </Card>

        {/* Active Shipments List */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Active Shipments</h2>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : pins.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active shipments</p>
          ) : (
            <div className="space-y-3">
              {pins.map((pin) => (
                <button
                  key={pin.id}
                  onClick={() => setSelectedPin(pin)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedPin?.id === pin.id ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{pin.trackingId}</p>
                      <Badge className={`${getStatusColor(pin.status)} text-xs`}>{pin.status.replace("-", " ")}</Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Driver: {pin.driverName}
                      </p>
                      <p className="truncate">{pin.cargo}</p>
                      <p>Updated: {formatDate(pin.lastUpdate)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
