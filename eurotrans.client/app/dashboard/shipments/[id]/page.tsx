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
import { ArrowLeft, Package, MapPin, Clock, User, TruckIcon, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"
import type { Shipment, Driver, Truck, Activity } from "@/lib/types"
import { formatDate } from "@/lib/utils/format"
import { getStatusBadgeColor, getStatusLabel, canAssignShipment, canDeleteShipment } from "@/lib/shipment-rules"

export default function ShipmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedDriverId, setSelectedDriverId] = useState<string>("")
  const [selectedTruckId, setSelectedTruckId] = useState<string>("")

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const shipmentId = String(params.id)
      const [shipmentData, driversData, trucksData, activitiesData] = await Promise.all([
        api.getShipment(shipmentId),
        api.getDrivers(),
        api.getTrucks(),
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
      setError(err instanceof Error ? err.message : "Failed to load shipment.")
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!shipment || !selectedDriverId || !selectedTruckId) return
    setAssigning(true)
    setError(null)

    try {
      await api.assignShipment(shipment.id, selectedDriverId, selectedTruckId)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign shipment.")
    } finally {
      setAssigning(false)
    }
  }

  const handleCancelShipment = async () => {
    if (!shipment) return
    setCancelling(true)
    setError(null)

    try {
      await api.deleteShipment(shipment.id)
      router.push("/dashboard/shipments")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel shipment.")
      setShowCancelDialog(false)
      setCancelling(false)
    }
  }

  if (loading || !shipment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading shipment...</div>
      </div>
    )
  }

  const assignedDriver = drivers.find((d) => d.id === shipment.driverId)
  const assignedTruck = trucks.find((t) => t.id === shipment.truckId)
  const canCancel = canDeleteShipment(shipment)

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/shipments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{shipment.trackingId}</h1>
          <p className="text-muted-foreground">Shipment details and management</p>
        </div>
        <Badge className={getStatusBadgeColor(shipment.status)}>{getStatusLabel(shipment.status)}</Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {shipment.status === "unassigned" && (
        <Alert>
          <AlertDescription>This shipment is ready for assignment.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Shipment Information
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Cargo Description</Label>
                <p className="mt-1">{shipment.cargo.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Weight</Label>
                  <p className="mt-1">{shipment.cargo.weight} kg</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Volume</Label>
                  <p className="mt-1">{shipment.cargo.volume} m3</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Route
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Origin</Label>
                <p className="mt-1">{shipment.origin.address}</p>
                <p className="text-sm text-muted-foreground">
                  {shipment.origin.city}, {shipment.origin.postalCode}, {shipment.origin.country}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">Destination</Label>
                <p className="mt-1">{shipment.destination.address}</p>
                <p className="text-sm text-muted-foreground">
                  {shipment.destination.city}, {shipment.destination.postalCode}, {shipment.destination.country}
                </p>
              </div>
            </div>
          </Card>

          {canAssignShipment(shipment) && (
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Assign Shipment</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="driver">Driver</Label>
                  <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                    <SelectTrigger id="driver" className="mt-1.5">
                      <SelectValue placeholder="Select driver" />
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
                  <Label htmlFor="truck">Truck</Label>
                  <Select value={selectedTruckId} onValueChange={setSelectedTruckId}>
                    <SelectTrigger id="truck" className="mt-1.5">
                      <SelectValue placeholder="Select truck" />
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
                  {assigning ? "Assigning..." : "Assign Shipment"}
                </Button>
              </div>
            </Card>
          )}

          {(shipment.status === "assigned" || shipment.status === "in-transit" || shipment.status === "delivered") && (
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Assignment Details</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label className="text-muted-foreground">Driver</Label>
                    <p className="mt-1">{shipment.driverName ?? assignedDriver?.name ?? "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{assignedDriver?.phone ?? "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TruckIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label className="text-muted-foreground">Truck</Label>
                    <p className="mt-1">{shipment.truckPlateNumber ?? assignedTruck?.plateNumber ?? "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{shipment.truckModel ?? assignedTruck?.model ?? "N/A"}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {canCancel && (
            <Card className="p-6 space-y-4 border-destructive/40">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-destructive">Cancel Shipment</h3>
                  <p className="text-sm text-muted-foreground">This shipment will be marked as cancelled.</p>
                </div>
                <Button variant="destructive" onClick={() => setShowCancelDialog(true)} disabled={cancelling}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="mt-1">{formatDate(shipment.createdAt)}</p>
              </div>
              {shipment.startedAt && (
                <div>
                  <Label className="text-muted-foreground">Started</Label>
                  <p className="mt-1">{formatDate(shipment.startedAt)}</p>
                </div>
              )}
              {shipment.deliveredAt && (
                <div>
                  <Label className="text-muted-foreground">Delivered</Label>
                  <p className="mt-1">{formatDate(shipment.deliveredAt)}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Activity</h2>

            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activities yet</p>
              ) : (
                activities
                  .slice()
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((activity) => (
                    <div key={activity.id} className="text-sm space-y-1">
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-muted-foreground text-xs">
                        {activity.userName || "Unknown"} - {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Shipment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel shipment {shipment.trackingId}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelShipment}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling ? "Cancelling..." : "Cancel Shipment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
