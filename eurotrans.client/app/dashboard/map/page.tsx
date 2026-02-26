"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import type { LiveMapPin } from "@/lib/types"
import { getStatusColor, formatDate } from "@/lib/utils/format"
import { useLiveMap } from "@/hooks/use-transport-data"
import { PageErrorState, SectionLoader } from "@/components/ui/page-state"
import { PageHeading, PageShell, PageSurface } from "@/components/ui/page-shell"

const LiveMap = dynamic(() => import("@/components/maps/live-map").then((module) => module.LiveMap), {
  ssr: false,
})

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
        <PageSurface className="lg:col-span-2 panel-muted p-6 min-h-[600px]">
          {pins.length === 0 ? (
            <div className="h-full min-h-[540px] flex items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/70 p-8 shadow-sm backdrop-blur-sm">
              <div className="text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <MapPin className="h-7 w-7 text-primary" />
                </div>
                <p className="text-lg font-semibold">No live locations yet</p>
                <p className="text-sm text-muted-foreground">
                  Start transit and send at least one location update to place a shipment on the map.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[540px] overflow-hidden rounded-2xl border border-border/50">
              <LiveMap pins={pins} selectedPinId={selectedPin?.id} onSelectPin={setSelectedPin} />
            </div>
          )}
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
                      <div className="flex items-center gap-2">
                        {pin.isStale && (
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                            Stale
                          </Badge>
                        )}
                        <Badge className={`${getStatusColor(pin.status)} text-xs`}>{pin.status.replace("-", " ")}</Badge>
                      </div>
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
