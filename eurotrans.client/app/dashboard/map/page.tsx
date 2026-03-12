"use client"

import { useCallback, useMemo, useState, Suspense } from "react"
import dynamic from "next/dynamic"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import type { LiveMapPin } from "@/lib/types"
import { getStatusColor, formatDate } from "@/lib/utils/format"
import { getStatusLabel } from "@/lib/shipment-rules"
import { useInfiniteLiveMap } from "@/hooks/use-transport-data"
import { PageErrorState, SectionLoader } from "@/components/ui/page-state"
import { PageHeading, PageShell, PageSurface } from "@/components/ui/page-shell"
import { useI18n } from "@/components/providers/i18n-provider"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

const LiveMap = dynamic(() => import("@/components/maps/live-map").then((module) => module.LiveMap), {
  ssr: false,
})

function MapContent() {
  const [selectedPin, setSelectedPin] = useState<LiveMapPin | null>(null)
  const { t } = useI18n()

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useInfiniteLiveMap({ pageSize: 12 })

  const pins = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data?.pages])
  const hasMorePins = Boolean(hasNextPage)

  const loadMorePins = useCallback(() => {
    if (!hasMorePins || isFetchingNextPage) return
    void fetchNextPage()
  }, [fetchNextPage, hasMorePins, isFetchingNextPage])

  const loadMoreRef = useInfiniteScroll({
    hasMore: hasMorePins,
    enabled: pins.length > 0,
    onLoadMore: loadMorePins,
  })

  if (isLoading) {
    return <SectionLoader label={t("map.loadingData")} />
  }

  if (error) {
    return (
      <PageErrorState
        title={t("map.errorTitle")}
        message={error instanceof Error ? error.message : t("map.errorMessage")}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <PageSurface className="lg:col-span-2 panel-muted p-6 min-h-[600px]">
        {pins.length === 0 ? (
          <div className="h-full min-h-[540px] flex items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/70 p-8 shadow-sm backdrop-blur-sm">
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <p className="text-lg font-semibold">{t("map.emptyTitle")}</p>
              <p className="text-sm text-muted-foreground">{t("map.emptyDescription")}</p>
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
        <h2 className="text-lg font-semibold">{t("map.activeShipments")}</h2>

        {pins.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("map.noActiveShipments")}</p>
        ) : (
          <div className="max-h-[540px] space-y-3 overflow-y-auto pr-1">
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
                          {t("map.badge.stale")}
                        </Badge>
                      )}
                      <Badge className={`${getStatusColor(pin.status)} text-xs`}>{getStatusLabel(pin.status, t)}</Badge>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {t("map.driverLabel")}: {pin.driverName}
                    </p>
                    <p className="truncate">{pin.cargo}</p>
                    <p>
                      {t("map.updatedLabel")}: {formatDate(pin.lastUpdate)}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            {(hasMorePins || pins.length > 0) && (
              <div ref={loadMoreRef} className="py-2 text-center text-xs text-muted-foreground">
                {isFetchingNextPage ? t("map.loadingMore") : hasMorePins ? t("map.scrollMore") : t("map.endOfList")}
              </div>
            )}
          </div>
        )}
      </PageSurface>
    </div>
  )
}

export default function LiveMapPage() {
  const { t } = useI18n()

  return (
    <PageShell>
      <PageHeading title={t("map.title")} description={t("map.description")} />

      <Suspense fallback={<SectionLoader label={t("map.loadingData")} />}>
        <MapContent />
      </Suspense>
    </PageShell>
  )
}
