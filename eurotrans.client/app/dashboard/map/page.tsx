"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import type { LiveMapPin } from "@/lib/types"
import { getStatusColor, formatDate } from "@/lib/utils/format"
import { useLiveMap } from "@/hooks/use-transport-data"
import { PageErrorState, SectionLoader } from "@/components/ui/page-state"
import { PageHeading, PageShell, PageSurface } from "@/components/ui/page-shell"

export default function LiveMapPage() {
  const [selectedPin, setSelectedPin] = useState<LiveMapPin | null>(null)
  const { data: pins = [], isLoading, error, refetch } = useLiveMap()

  if (isLoading) {
    return <SectionLoader label="Loading map data..." />
  }

  if (error) {
    return (
      <PageErrorState
        title="Could not load live map"
        message={error instanceof Error ? error.message : "Unexpected error while loading map pins."}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  return (
    <PageShell>
      <PageHeading title="Live Map" description="Real-time tracking of in-transit shipments" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <PageSurface className="lg:col-span-2 panel-muted p-6 min-h-[600px] flex items-center justify-center">
          <div className="text-center space-y-4 rounded-2xl border border-dashed border-border/70 bg-card/70 p-8 shadow-sm backdrop-blur-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold">Interactive Map Coming Soon</p>
              <p className="text-sm text-muted-foreground">
                Leaflet integration will show real-time positions of all in-transit shipments
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {pins.length} active shipment{pins.length !== 1 ? "s" : ""}
            </div>
          </div>
        </PageSurface>

        {/* Active Shipments List */}
        <PageSurface className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Active Shipments</h2>

          {pins.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active shipments</p>
          ) : (
            <div className="space-y-3">
              {pins.map((pin) => (
                <button
                  key={pin.id}
                  onClick={() => setSelectedPin(pin)}
                  className={`w-full text-left p-3 rounded-lg border motion-smooth ${
                    selectedPin?.id === pin.id ? "bg-primary/5 border-primary shadow-sm" : "hover:bg-muted/50"
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
        </PageSurface>
      </div>
    </PageShell>
  )
}
