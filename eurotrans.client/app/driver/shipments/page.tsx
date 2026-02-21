"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"
import { api } from "@/lib/api"
import type { Shipment } from "@/lib/types"
import { getStatusColor, formatDate } from "@/lib/utils/format"

export default function DriverShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Backend already limits driver users to their own shipments.
      const data = await api.getShipments()
      setShipments(data)
    } catch (error) {
      console.error("Failed to load shipments:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading shipments...</div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Shipments</h1>
        <p className="text-muted-foreground">View all your assigned shipments</p>
      </div>

      {shipments.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Shipments</h3>
          <p className="text-sm text-muted-foreground">You have no shipments assigned yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {shipments.map((shipment) => (
            <Link key={shipment.id} href={`/driver/shipments/${shipment.id}`}>
              <Card className="p-4 hover:bg-muted/50 transition-colors">
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
