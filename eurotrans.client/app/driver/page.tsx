"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, MapPin, ArrowRight, Play, Loader2 } from "lucide-react"
import { getStatusColor } from "@/lib/utils/format"
import { canStartShipment } from "@/lib/shipment-rules"
import { useToast } from "@/hooks/use-toast"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useDriverCurrentShipment, useShipmentMutations } from "@/hooks/use-transport-data"
import { PageErrorState, SectionLoader } from "@/components/ui/page-state"
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
  } = useDriverCurrentShipment(currentUser?.employeeId, {
    enabled: currentUser?.role === "driver",
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

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{`${t("driver.greeting")}, ${currentUser.name.split(" ")[0]}`}</h1>
        <p className="text-muted-foreground">{t("driver.home.welcomeBack")}</p>
      </div>

      {activeShipment ? (
        <Card className="panel p-6 space-y-6 surface-hover">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">{t("nav.currentJob")}</h2>
              <p className="text-sm text-muted-foreground">{activeShipment.trackingId}</p>
            </div>
            <Badge className={getStatusColor(activeShipment.status)}>{activeShipment.status.replace("-", " ")}</Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{t("driver.home.cargo")}</p>
                <p className="text-sm text-muted-foreground">{activeShipment.cargo.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeShipment.cargo.weight} kg | {activeShipment.cargo.volume} m3
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{t("shipments.route")}</p>
                <p className="text-sm text-muted-foreground">
                  {activeShipment.origin.city} -{">"} {activeShipment.destination.city}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{activeShipment.destination.address}</p>
              </div>
            </div>
          </div>

          {canStart && (
            <Button className="w-full h-12 text-base" onClick={handleStartJourney} disabled={startShipment.isPending}>
              {startShipment.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5" />}
              {startShipment.isPending ? t("driver.home.startingJourney") : t("driver.startJourney")}
            </Button>
          )}

          <Button
            variant={canStart ? "outline" : "default"}
            className="w-full h-12 text-base"
            onClick={() => router.push(`/driver/shipments/${activeShipment.id}`)}
          >
            {t("driver.home.viewDetails")}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Card>
      ) : (
        <Card className="panel p-12 flex flex-col items-center justify-center text-center surface-hover">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t("driver.home.noActiveJobsTitle")}</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {t("driver.home.noActiveJobsDescription")}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card className="panel p-4 surface-hover">
          <p className="text-sm text-muted-foreground mb-1">{t("driver.home.status")}</p>
          <p className="text-lg font-bold">{t("employees.status.onDuty")}</p>
        </Card>
        <Card className="panel p-4 surface-hover">
          <p className="text-sm text-muted-foreground mb-1">{t("driver.home.activeJobs")}</p>
          <p className="text-lg font-bold">{activeShipment ? "1" : "0"}</p>
        </Card>
      </div>
    </div>
  )
}
