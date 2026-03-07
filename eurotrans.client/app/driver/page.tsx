"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, MapPin, ArrowRight, Play, Loader2 } from "lucide-react"
import { getStatusColor } from "@/lib/utils/format"
import { canStartShipment } from "@/lib/shipment-rules"
import { useToast } from "@/hooks/use-toast"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useDriverCurrentShipment, useShipmentMutations } from "@/hooks/use-transport-data"
import { EmptyStateCard, PageErrorState, SectionLoader } from "@/components/ui/page-state"
import { PageHeading, PageShell, PageSurface } from "@/components/ui/page-shell"
import { useI18n } from "@/components/providers/i18n-provider"

export default function DriverHomePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useI18n()
  const { data: currentUser, isLoading: isUserLoading, error: userError } = useCurrentUser()
  const {
    data: activeShipment,
    isLoading: isShipmentsLoading,
    error: shipmentsError,
    refetch,
  } = useDriverCurrentShipment({
    enabled: currentUser?.role === "driver" && currentUser.driverProfileComplete,
    driverId: currentUser?.employeeId,
  })
  const { startShipment } = useShipmentMutations()

  const canStart = activeShipment ? canStartShipment(activeShipment) : false
  const isLoading = isUserLoading || isShipmentsLoading
  const error = userError ?? shipmentsError

  const handleStartJourney = async () => {
    if (!activeShipment) return

    try {
      await startShipment.mutateAsync(activeShipment.id)
      toast({
        title: t("driver.home.journeyStartedTitle"),
        description: t("driver.home.journeyStartedDescription"),
      })
      await refetch()
    } catch (err) {
      toast({
        title: t("common.error"),
        description: err instanceof Error ? err.message : t("driver.home.startJourneyError"),
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <SectionLoader label={t("driver.home.loadingAssignments")} />
  }

  if (error) {
    return (
      <PageErrorState
        title={t("driver.home.errorTitle")}
        message={error instanceof Error ? error.message : t("driver.home.errorMessage")}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  if (!currentUser || currentUser.role !== "driver") {
    return <SectionLoader label={t("driver.home.redirecting")} />
  }

  const firstName = currentUser.name.split(" ")[0]

  return (
    <PageShell className="mx-auto max-w-3xl">
      <PageSurface className="panel-muted p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <PageHeading title={`${t("driver.greeting")}, ${firstName}`} description={t("driver.home.welcomeBack")} />

          <div className="grid grid-cols-2 gap-3 md:min-w-[280px]">
            <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("driver.home.status")}</p>
              <p className="mt-2 text-lg font-semibold">{t("employees.status.onDuty")}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("driver.home.activeJobs")}</p>
              <p className="mt-2 text-lg font-semibold">{activeShipment ? "1" : "0"}</p>
            </div>
          </div>
        </div>
      </PageSurface>

      {activeShipment ? (
        <PageSurface className="p-6 space-y-6 surface-hover">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">{t("nav.currentJob")}</h2>
              <p className="text-sm text-muted-foreground">{activeShipment.trackingId}</p>
            </div>
            <Badge className={getStatusColor(activeShipment.status)}>{activeShipment.status.replace("-", " ")}</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <Package className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{t("driver.home.cargo")}</p>
                  <p className="text-sm text-muted-foreground">{activeShipment.cargo.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activeShipment.cargo.weight} kg | {activeShipment.cargo.volume} m3
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{t("shipments.route")}</p>
                  <p className="text-sm text-muted-foreground">
                    {activeShipment.origin.city} -{">"} {activeShipment.destination.city}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{activeShipment.destination.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {canStart && (
              <Button className="h-12 text-base" onClick={handleStartJourney} disabled={startShipment.isPending}>
                {startShipment.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5" />}
                {startShipment.isPending ? t("driver.home.startingJourney") : t("driver.startJourney")}
              </Button>
            )}

            <Button
              variant={canStart ? "outline" : "default"}
              className="h-12 text-base"
              onClick={() => router.push(`/driver/shipments/${activeShipment.id}`)}
            >
              {t("driver.home.viewDetails")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </PageSurface>
      ) : (
        <EmptyStateCard
          icon={Package}
          title={t("driver.home.noActiveJobsTitle")}
          description={t("driver.home.noActiveJobsDescription")}
          className="surface-hover"
        />
      )}
    </PageShell>
  )
}
