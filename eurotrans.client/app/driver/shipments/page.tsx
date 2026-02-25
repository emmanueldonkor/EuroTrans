"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"
import { getStatusColor, formatDate } from "@/lib/utils/format"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useShipments } from "@/hooks/use-transport-data"
import { PageErrorState, SectionLoader } from "@/components/ui/page-state"

export default function DriverShipmentsPage() {
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser()
  const {
    data: shipments = [],
    isLoading,
    error,
    refetch,
  } = useShipments(
    currentUser?.role === "driver" ? { driverId: currentUser.employeeId } : undefined,
    { enabled: currentUser?.role === "driver" },
  )

  if (isUserLoading || isLoading) {
    return <SectionLoader label="Loading shipments..." />
  }

  if (error) {
    return (
      <PageErrorState
        title="Could not load shipments"
        message={error instanceof Error ? error.message : "Unexpected error while loading shipments."}
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
        <h1 className="text-3xl font-bold">My Shipments</h1>
        <p className="text-muted-foreground">View all your assigned shipments</p>
      </div>

      {shipments.length === 0 ? (
        <Card className="panel p-12 flex flex-col items-center justify-center text-center surface-hover">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Shipments</h3>
          <p className="text-sm text-muted-foreground">You have no shipments assigned yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {shipments.map((shipment) => (
            <Link key={shipment.id} href={`/driver/shipments/${shipment.id}`}>
              <Card className="panel p-4 motion-smooth hover:bg-muted/40 hover:shadow-md">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{shipment.trackingId}</p>
                      <p className="text-sm text-muted-foreground mt-1">{shipment.cargo.description}</p>
                    </div>
                    <Badge className={getStatusColor(shipment.status)}>{shipment.status.replace("-", " ")}</Badge>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>
                      {shipment.origin.city} -{">"} {shipment.destination.city}
                    </p>
                    <p className="text-xs mt-1">Updated: {formatDate(shipment.updatedAt)}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
