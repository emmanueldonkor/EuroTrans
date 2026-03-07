"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock3, MapPin } from "lucide-react"
import type { LiveMapPin } from "@/lib/types"
import { getStatusColor, formatDate } from "@/lib/utils/format"
import { useInfiniteLiveMap } from "@/hooks/use-transport-data"
import { EmptyStateCard, PageErrorState, SectionLoader } from "@/components/ui/page-state"
import { PageHeading, PageShell, PageSurface } from "@/components/ui/page-shell"
import { useI18n } from "@/components/providers/i18n-provider"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

function MapCanvasSkeleton() {
  return (
    <div className="h-[540px] rounded-2xl border border-border/60 bg-gradient-to-br from-[var(--surface-1)] to-[var(--surface-2)] p-4">
      <div className="grid h-full gap-3">
        <div className="shimmer h-10 rounded-2xl bg-muted/70" />
        <div className="shimmer flex-1 rounded-[1.75rem] bg-muted/60" />
        <div className="grid gap-3 md:grid-cols-3">
          <div className="shimmer h-16 rounded-2xl bg-muted/70" />
          <div className="shimmer h-16 rounded-2xl bg-muted/70" />
          <div className="shimmer h-16 rounded-2xl bg-muted/70" />
        </div>
      </div>
    </div>
  )
}

const LiveMap = dynamic(() => import("@/components/maps/live-map").then((module) => module.LiveMap), {
  ssr: false,
  loading: () => <MapCanvasSkeleton />,
})

export default function LiveMapPage() {
  const [selectedPin, setSelectedPin] = useState<LiveMapPin | null>(null)
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useInfiniteLiveMap({ pageSize: 12 })
  const { t } = useI18n()

  const pins = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data?.pages])
  const hasMorePins = Boolean(hasNextPage)
  const stalePinsCount = useMemo(() => pins.filter((pin) => pin.isStale).length, [pins])
  const inTransitCount = useMemo(() => pins.filter((pin) => pin.status === "in-transit").length, [pins])

  useEffect(() => {
    if (pins.length === 0) {
      if (selectedPin) {
        setSelectedPin(null)
      }
      return
    }

    if (!selectedPin || !pins.some((pin) => pin.id === selectedPin.id)) {
      setSelectedPin(pins[0])
    }
  }, [pins, selectedPin])

  const loadMorePins = useCallback(() => {
    if (!hasMorePins || isFetchingNextPage) return
    void fetchNextPage()
  }, [fetchNextPage, hasMorePins, isFetchingNextPage])

  const loadMoreRef = useInfiniteScroll({
    hasMore: hasMorePins,
    enabled: pins.length > 0,
    onLoadMore: loadMorePins,
  })

  const getShipmentStatusLabel = (status: LiveMapPin["status"]) => {
    switch (status) {
      case "unassigned":
        return t("status.unassigned")
      case "in-transit":
        return t("status.inTransit")
      case "delivered":
        return t("status.delivered")
      default:
        return status.replace("-", " ")
    }
  }

  const formatPosition = (pin: LiveMapPin) => `${pin.position.lat.toFixed(4)}, ${pin.position.lng.toFixed(4)}`

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
    <PageShell>
      <PageHeading title={t("map.title")} description={t("map.description")} />

      <div className="grid gap-4 md:grid-cols-3">
        <PageSurface className="panel-muted p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("map.activeShipments")}</p>
              <p className="text-2xl font-semibold">{pins.length}</p>
            </div>
          </div>
        </PageSurface>
        <PageSurface className="panel-muted p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warning/15 text-warning">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("status.inTransit")}</p>
              <p className="text-2xl font-semibold">{inTransitCount}</p>
            </div>
          </div>
        </PageSurface>
        <PageSurface className="panel-muted p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("map.badge.stale")}</p>
              <p className="text-2xl font-semibold">{stalePinsCount}</p>
            </div>
          </div>
        </PageSurface>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.95fr)]">
        <PageSurface className="panel-muted p-6 min-h-[600px]">
          {pins.length === 0 ? (
            <EmptyStateCard
              icon={MapPin}
              title={t("map.emptyTitle")}
              description={t("map.emptyDescription")}
              className="min-h-[540px] border-dashed bg-card/70 shadow-none"
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{t("map.title")}</h2>
                  <p className="text-sm text-muted-foreground">{t("map.description")}</p>
                </div>
                {selectedPin ? (
                  <Badge className={getStatusColor(selectedPin.status)}>{getShipmentStatusLabel(selectedPin.status)}</Badge>
                ) : null}
              </div>

              <div className="h-[540px] overflow-hidden rounded-2xl border border-border/50 shadow-sm">
                <LiveMap pins={pins} selectedPinId={selectedPin?.id} onSelectPin={setSelectedPin} />
              </div>
            </div>
          )}
        </PageSurface>

        <div className="space-y-6">
          <PageSurface className="p-5">
            {selectedPin ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("shipments.trackingId")}</p>
                    <h2 className="text-xl font-semibold">{selectedPin.trackingId}</h2>
                  </div>
                  {selectedPin.isStale ? (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                      {t("map.badge.stale")}
                    </Badge>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("map.positionLabel")}</p>
                    <p className="mt-2 text-sm font-medium">{formatPosition(selectedPin)}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("map.driverLabel")}</p>
                    <p className="mt-2 text-sm font-medium">{selectedPin.driverName}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 sm:col-span-2 xl:col-span-1">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("driver.home.cargo")}</p>
                    <p className="mt-2 text-sm font-medium">{selectedPin.cargo}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 sm:col-span-2 xl:col-span-1">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("map.updatedLabel")}</p>
                    <p className="mt-2 text-sm font-medium">{formatDate(selectedPin.lastUpdate)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyStateCard
                icon={MapPin}
                title={t("map.noActiveShipments")}
                description={t("map.emptyDescription")}
                className="min-h-[280px] border-dashed bg-transparent shadow-none"
              />
            )}
          </PageSurface>

          <PageSurface className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{t("map.activeShipments")}</h2>
              <Badge variant="outline" className="rounded-full px-2.5 py-1 text-xs">
                {pins.length}
              </Badge>
            </div>

            {pins.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("map.noActiveShipments")}</p>
            ) : (
              <div className="max-h-[540px] space-y-3 overflow-y-auto pr-1">
                {pins.map((pin) => (
                  <button
                    key={pin.id}
                    onClick={() => setSelectedPin(pin)}
                    className={`w-full rounded-2xl border p-4 text-left motion-smooth ${
                      selectedPin?.id === pin.id
                        ? "border-primary/60 bg-primary/5 shadow-sm shadow-primary/10"
                        : "border-border/70 hover:bg-muted/40"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{pin.trackingId}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{pin.cargo}</p>
                      </div>
                        <div className="flex items-center gap-2">
                          {pin.isStale && (
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                              {t("map.badge.stale")}
                            </Badge>
                          )}
                          <Badge className={`${getStatusColor(pin.status)} text-xs`}>{getShipmentStatusLabel(pin.status)}</Badge>
                        </div>
                      </div>

                      <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                        <p className="truncate">
                          {t("map.driverLabel")}: {pin.driverName}
                        </p>
                        <p>{formatPosition(pin)}</p>
                        <p className="sm:col-span-2">
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
      </div>
    </PageShell>
  )
}
