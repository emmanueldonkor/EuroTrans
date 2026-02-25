"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, MapPin, ArrowRight, Play, Loader2 } from "lucide-react"
import { getStatusColor } from "@/lib/utils/format"
import { canStartShipment } from "@/lib/shipment-rules"
import { useToast } from "@/hooks/use-toast"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useShipmentMutations, useShipments } from "@/hooks/use-transport-data"
import { PageErrorState, SectionLoader } from "@/components/ui/page-state"

export default function DriverHomePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: currentUser, isLoading: isUserLoading, error: userError } = useCurrentUser()
  const {
    data: shipments = [],
    isLoading: isShipmentsLoading,
    error: shipmentsError,
    refetch,
  } = useShipments(
    currentUser?.role === "driver" ? { driverId: currentUser.employeeId } : undefined,
    { enabled: currentUser?.role === "driver" },
  )
  const { startShipment } = useShipmentMutations()

  const activeShipment = useMemo(
    () => shipments.find((shipment) => shipment.status !== "delivered" && shipment.status !== "cancelled") ?? null,
    [shipments],
  )

  const canStart = activeShipment ? canStartShipment(activeShipment) : false
  const isLoading = isUserLoading || isShipmentsLoading
  const error = userError ?? shipmentsError

  const handleStartJourney = async () => {
    if (!activeShipment) return

    try {
      await startShipment.mutateAsync(activeShipment.id)
      toast({
        title: "Journey Started",
        description: "Your shipment journey has begun.",
      })
      await refetch()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to start journey. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <SectionLoader label="Loading your assignments..." />
  }

  if (error) {
    return (
      <PageErrorState
        title="Could not load driver home"
        message={error instanceof Error ? error.message : "Unexpected error while loading your dashboard."}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  if (!currentUser || currentUser.role !== "driver") {
    return <SectionLoader label="Redirecting..." />
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hello, {currentUser.name.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Welcome back to your driver portal</p>
      </div>

      {activeShipment ? (
        <Card className="panel p-6 space-y-6 surface-hover">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Current Job</h2>
              <p className="text-sm text-muted-foreground">{activeShipment.trackingId}</p>
            </div>
            <Badge className={getStatusColor(activeShipment.status)}>{activeShipment.status.replace("-", " ")}</Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Cargo</p>
                <p className="text-sm text-muted-foreground">{activeShipment.cargo.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeShipment.cargo.weight} kg | {activeShipment.cargo.volume} m3
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Route</p>
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
              {startShipment.isPending ? "Starting Journey..." : "Start Journey"}
            </Button>
          )}

          <Button
            variant={canStart ? "outline" : "default"}
            className="w-full h-12 text-base"
            onClick={() => router.push(`/driver/shipments/${activeShipment.id}`)}
          >
            View Details
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Card>
      ) : (
        <Card className="panel p-12 flex flex-col items-center justify-center text-center surface-hover">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Active Jobs</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            You currently have no shipments assigned. Check back later or contact dispatch.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card className="panel p-4 surface-hover">
          <p className="text-sm text-muted-foreground mb-1">Status</p>
          <p className="text-lg font-bold">On Duty</p>
        </Card>
        <Card className="panel p-4 surface-hover">
          <p className="text-sm text-muted-foreground mb-1">Active Jobs</p>
          <p className="text-lg font-bold">{activeShipment ? "1" : "0"}</p>
        </Card>
      </div>
    </div>
  )
}
