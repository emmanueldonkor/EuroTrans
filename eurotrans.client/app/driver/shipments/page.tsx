"use client"

import { useCallback, useMemo } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Loader2, Package } from "lucide-react"
import { getStatusColor, formatDate } from "@/lib/utils/format"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useInfiniteShipments } from "@/hooks/use-transport-data"
import { EmptyStateCard, PageErrorState, SectionLoader } from "@/components/ui/page-state"
import { PageHeading, PageShell, PageSurface } from "@/components/ui/page-shell"
import { useI18n } from "@/components/providers/i18n-provider"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

export default function DriverShipmentsPage() {
  const { t } = useI18n()
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser()
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useInfiniteShipments(undefined, { pageSize: 10 })

  const shipments = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data?.pages])

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return
    void fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const loadMoreRef = useInfiniteScroll({
    hasMore: Boolean(hasNextPage),
    enabled: !isLoading,
    onLoadMore: loadMore,
  })

  if (isUserLoading || isLoading) {
    return <SectionLoader label={t("shipments.loading")} />
  }

  if (error) {
    return (
      <PageErrorState
        title={t("driver.shipments.errorTitle")}
        message={error instanceof Error ? error.message : t("driver.shipments.errorMessage")}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  if (!currentUser || currentUser.role !== "driver") {
    return <SectionLoader label={t("driver.home.redirecting")} />
  }

  return (
    <PageShell className="mx-auto max-w-3xl">
      <PageSurface className="panel-muted p-6 md:p-8">
        <PageHeading title={t("driver.shipments.title")} description={t("driver.shipments.description")} />
      </PageSurface>

      {shipments.length === 0 ? (
        <EmptyStateCard
          icon={Package}
          title={t("driver.shipments.emptyTitle")}
          description={t("driver.shipments.emptyDescription")}
          className="surface-hover"
        />
      ) : (
        <div className="space-y-3">
          {shipments.map((shipment) => (
            <Link key={shipment.id} href={`/driver/shipments/${shipment.id}`}>
              <Card className="panel p-5 motion-smooth hover:bg-muted/40 hover:shadow-md">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold">{shipment.trackingId}</p>
                      <p className="text-sm text-muted-foreground">{shipment.cargo.description}</p>
                    </div>
                    <Badge className={getStatusColor(shipment.status)}>{shipment.status.replace("-", " ")}</Badge>
                  </div>

                  <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <div>
                      <p>
                        {shipment.origin.city} -{">"} {shipment.destination.city}
                      </p>
                      <p className="mt-1 text-xs">
                        {t("map.updatedLabel")}: {formatDate(shipment.updatedAt)}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                      {t("driver.home.viewDetails")}
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}

          {(hasNextPage || isFetchingNextPage) && (
            <PageSurface className="border-dashed bg-card/70 p-4">
              <div ref={loadMoreRef} className="flex items-center justify-center text-sm text-muted-foreground">
                {isFetchingNextPage ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("driver.shipments.loadingMore")}
                  </span>
                ) : (
                  t("driver.shipments.scrollMore")
                )}
              </div>
            </PageSurface>
          )}
        </div>
      )}
    </PageShell>
  )
}
