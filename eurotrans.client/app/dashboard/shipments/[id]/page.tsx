"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Package, MapPin, Clock, User, TruckIcon, Trash2, Loader2, CircleDot } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"
import type { Shipment, DriverOption, TruckOption, Activity } from "@/lib/types"
import { formatDate } from "@/lib/utils/format"
import { getStatusBadgeColor, getStatusLabel, canAssignShipment, canDeleteShipment } from "@/lib/shipment-rules"
import { PageErrorState, SectionLoader } from "@/components/ui/page-state"
import { useToast } from "@/hooks/use-toast"
import { toActionErrorMessage } from "@/lib/utils/error"
import { useI18n } from "@/components/providers/i18n-provider"

export default function ShipmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useI18n()
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [drivers, setDrivers] = useState<DriverOption[]>([])
  const [trucks, setTrucks] = useState<TruckOption[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [selectedDriverId, setSelectedDriverId] = useState<string>("")
  const [selectedTruckId, setSelectedTruckId] = useState<string>("")

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const loadData = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const shipmentId = String(params.id)
      const [shipmentData, driversData, trucksData, activitiesData] = await Promise.all([
        api.getShipment(shipmentId),
        api.getDriverOptions(),
        api.getTruckOptions(),
        api.getShipmentActivities(shipmentId),
      ])

      if (!shipmentData) {
        router.push("/dashboard/shipments")
        return
      }

      setShipment(shipmentData)
      setDrivers(driversData)
      setTrucks(trucksData)
      setActivities(activitiesData)
      setSelectedDriverId(shipmentData.driverId ?? "")
      setSelectedTruckId(shipmentData.truckId ?? "")
    } catch (err) {
      const message = toActionErrorMessage(err, t("shipments.detail.loadErrorFallback"))
      setLoadError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!shipment || !selectedDriverId || !selectedTruckId) return
    setAssigning(true)

    try {
      await api.assignShipment(shipment.id, selectedDriverId, selectedTruckId)
      await loadData()
      toast({
        title: t("shipments.detail.assignSuccessTitle"),
        description: t("shipments.detail.assignSuccessDescription"),
      })
    } catch (err) {
      const message = toActionErrorMessage(err, t("shipments.detail.assignErrorFallback"))
      toast({
        title: t("shipments.detail.assignErrorTitle"),
        description: message,
        variant: "destructive",
      })
    } finally {
      setAssigning(false)
    }
  }

  const handleCancelShipment = async () => {
    if (!shipment) return
    setCancelling(true)

    try {
      await api.deleteShipment(shipment.id)
      toast({
        title: t("shipments.detail.cancelSuccessTitle"),
        description: t("shipments.detail.cancelSuccessDescription").replace("{trackingId}", shipment.trackingId),
      })
      router.push("/dashboard/shipments")
    } catch (err) {
      const message = toActionErrorMessage(err, t("shipments.detail.cancelErrorFallback"))
      toast({
        title: t("shipments.detail.cancelErrorTitle"),
        description: message,
        variant: "destructive",
      })
      setShowCancelDialog(false)
      setCancelling(false)
    }
  }

  if (loading) {
    return <SectionLoader label={t("shipments.detail.loading")} />
  }

  if (!shipment) {
    return (
      <PageErrorState
        title={t("shipments.detail.loadErrorTitle")}
        message={loadError ?? t("shipments.detail.loadErrorFallback")}
        onRetry={() => {
          void loadData()
        }}
      />
    )
  }

  const assignedDriver = drivers.find((d) => d.id === shipment.driverId)
  const assignedTruck = trucks.find((t) => t.id === shipment.truckId)
  const canCancel = canDeleteShipment(shipment)
  const getShipmentStatusText = (status: Shipment["status"]) => {
    switch (status) {
      case "unassigned":
        return t("status.unassigned")
      case "assigned":
        return t("shipments.status.assigned")
      case "in-transit":
        return t("status.inTransit")
      case "delivered":
        return t("status.delivered")
      case "cancelled":
        return t("shipments.status.cancelled")
      default:
        return getStatusLabel(status, t)
    }
  }

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/shipments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{shipment.trackingId}</h1>
          <p className="text-muted-foreground">{t("shipments.detail.subtitle")}</p>
        </div>
        <Badge className={getStatusBadgeColor(shipment.status)}>{getShipmentStatusText(shipment.status)}</Badge>
      </div>

      {shipment.status === "unassigned" && (
        <Alert>
          <AlertDescription>{t("shipments.detail.readyForAssignment")}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="panel p-6 space-y-4 surface-hover">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t("shipments.detail.infoTitle")}
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">{t("shipments.detail.cargoDescription")}</Label>
                <p className="mt-1">{shipment.cargo.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t("shipments.detail.weight")}</Label>
                  <p className="mt-1">{shipment.cargo.weight} kg</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("shipments.detail.volume")}</Label>
                  <p className="mt-1">{shipment.cargo.volume} m3</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="panel p-6 space-y-4 surface-hover">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("shipments.detail.routeTitle")}
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">{t("shipments.detail.origin")}</Label>
                <p className="mt-1">{shipment.origin.address}</p>
                <p className="text-sm text-muted-foreground">
                  {shipment.origin.city}, {shipment.origin.postalCode}, {shipment.origin.country}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">{t("shipments.detail.destination")}</Label>
                <p className="mt-1">{shipment.destination.address}</p>
                <p className="text-sm text-muted-foreground">
                  {shipment.destination.city}, {shipment.destination.postalCode}, {shipment.destination.country}
                </p>
              </div>
            </div>
          </Card>

          {canAssignShipment(shipment) && (
            <Card className="panel p-6 space-y-4 surface-hover">
              <h2 className="text-xl font-semibold">{t("shipments.detail.assignTitle")}</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="driver">{t("shipments.detail.driver")}</Label>
                  <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                    <SelectTrigger id="driver" className="mt-1.5">
                      <SelectValue placeholder={t("shipments.detail.selectDriver")} />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers
                        .filter((d) => d.status === "available")
                        .map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="truck">{t("shipments.detail.truck")}</Label>
                  <Select value={selectedTruckId} onValueChange={setSelectedTruckId}>
                    <SelectTrigger id="truck" className="mt-1.5">
                      <SelectValue placeholder={t("shipments.detail.selectTruck")} />
                    </SelectTrigger>
                    <SelectContent>
                      {trucks
                        .filter((t) => t.status === "available")
                        .map((truck) => (
                          <SelectItem key={truck.id} value={truck.id}>
                            {truck.plateNumber} - {truck.model}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={handleAssign}
                  disabled={!selectedDriverId || !selectedTruckId || assigning}
                >
                  {assigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {assigning ? t("shipments.detail.assigning") : t("shipments.detail.assignAction")}
                </Button>
              </div>
            </Card>
          )}

          {(shipment.status === "assigned" || shipment.status === "in-transit" || shipment.status === "delivered") && (
            <Card className="panel p-6 space-y-4 surface-hover">
              <h2 className="text-xl font-semibold">{t("shipments.detail.assignmentTitle")}</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label className="text-muted-foreground">{t("shipments.detail.driver")}</Label>
                    <p className="mt-1">{shipment.driverName ?? assignedDriver?.name ?? t("shipments.detail.unknown")}</p>
                    <p className="text-sm text-muted-foreground">{assignedDriver?.phone ?? t("shipments.detail.na")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TruckIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label className="text-muted-foreground">{t("shipments.detail.truck")}</Label>
                    <p className="mt-1">{shipment.truckPlateNumber ?? assignedTruck?.plateNumber ?? t("shipments.detail.unknown")}</p>
                    <p className="text-sm text-muted-foreground">{shipment.truckModel ?? assignedTruck?.model ?? t("shipments.detail.na")}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {canCancel && (
            <Card className="panel p-6 space-y-4 border-destructive/40">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-destructive">{t("shipments.detail.cancelTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("shipments.detail.cancelDescription")}</p>
                </div>
                <Button variant="destructive" onClick={() => setShowCancelDialog(true)} disabled={cancelling}>
                  {cancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  {t("shipments.detail.cancelAction")}
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="panel p-6 space-y-4 surface-hover">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t("shipments.detail.timelineTitle")}
            </h2>

            <div className="space-y-4 text-sm rounded-xl border border-border/60 bg-muted/20 p-4">
              {[
                { label: t("shipments.detail.timeline.created"), value: shipment.createdAt },
                { label: t("shipments.detail.timeline.started"), value: shipment.startedAt },
                { label: t("shipments.detail.timeline.delivered"), value: shipment.deliveredAt },
              ]
                .filter((item) => Boolean(item.value))
                .map((item, index, source) => (
                  <div key={item.label} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <CircleDot className="h-4 w-4 text-primary mt-0.5" />
                      {index < source.length - 1 && <div className="mt-1 h-full w-px bg-border" />}
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{item.label}</Label>
                      <p className="mt-1">{formatDate(String(item.value))}</p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          <Card className="panel p-6 space-y-4 surface-hover">
            <h2 className="text-lg font-semibold">{t("shipments.detail.activityTitle")}</h2>

            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("shipments.detail.noActivities")}</p>
              ) : (
                activities
                  .slice()
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((activity) => (
                    <div key={activity.id} className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm space-y-1">
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-muted-foreground text-xs">
                        {activity.userName || t("shipments.detail.unknown")} - {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="panel">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("shipments.detail.cancelDialogTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("shipments.detail.cancelDialogDescription").replace("{trackingId}", shipment.trackingId)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>{t("shipments.detail.cancelDialogBack")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelShipment}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {cancelling ? t("shipments.detail.cancelling") : t("shipments.detail.cancelAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
