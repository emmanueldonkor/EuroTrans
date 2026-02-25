"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search } from "lucide-react"
import { useShipments, useDrivers } from "@/hooks/use-transport-data"
import { getStatusColor, formatDate } from "@/lib/utils/format"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ShipmentStatus } from "@/lib/types"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { SectionLoader } from "@/components/ui/page-state"
import { PageHeader, PageHeading, PageShell, PageSurface } from "@/components/ui/page-shell"

export default function ShipmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [driverFilter, setDriverFilter] = useState<string>("all")
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300)

  const {
    data: shipments = [],
    isLoading: shipmentsLoading,
    isFetching: shipmentsFetching,
    error: shipmentsError,
  } = useShipments({
    status: statusFilter !== "all" ? (statusFilter as ShipmentStatus) : undefined,
    driverId: driverFilter !== "all" ? driverFilter : undefined,
    search: debouncedSearchTerm || undefined,
  })

  const { data: drivers = [], isLoading: driversLoading } = useDrivers()
  const isLoading = shipmentsLoading || driversLoading

  const getDriverName = (driverId?: string, driverName?: string) => {
    if (driverName) return driverName
    if (!driverId) return "N/A"
    const driver = drivers.find((d) => d.id === driverId)
    return driver?.name || "Unknown"
  }

  if (isLoading && shipments.length === 0) {
    return <SectionLoader label="Loading shipments..." />
  }

  return (
    <PageShell>
      <PageHeader>
        <PageHeading
          title="Shipments"
          description={
            <>
              Manage and track all shipments
              {shipmentsFetching && <span className="ml-2 text-xs">Refreshing...</span>}
            </>
          }
        />
        <Link href="/dashboard/shipments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Shipment
          </Button>
        </Link>
      </PageHeader>

      {shipmentsError && (
        <Alert variant="destructive">
          <AlertDescription>{shipmentsError instanceof Error ? shipmentsError.message : "Error loading shipments."}</AlertDescription>
        </Alert>
      )}

      <PageSurface className="p-4 bg-gradient-to-r from-card to-muted/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by tracking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-9 bg-background/90"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-full sm:w-44 bg-background/90">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in-transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={driverFilter} onValueChange={setDriverFilter}>
            <SelectTrigger className="h-10 w-full sm:w-44 bg-background/90">
              <SelectValue placeholder="Driver" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Drivers</SelectItem>
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageSurface>

      <PageSurface className="table-shell">
        <Table>
          <TableHeader className="table-head-sticky">
            <TableRow>
              <TableHead>Tracking ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Last Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {shipmentsError ? "Could not load shipments." : "No shipments found"}
                </TableCell>
              </TableRow>
            ) : (
              shipments.map((shipment) => (
                <TableRow key={shipment.id} className="cursor-pointer table-row-interactive">
                  <TableCell>
                    <Link href={`/dashboard/shipments/${shipment.id}`} className="font-medium hover:underline underline-offset-4">
                      {shipment.trackingId}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(shipment.status)}>{shipment.status.replace("-", " ")}</Badge>
                  </TableCell>
                  <TableCell>{getDriverName(shipment.driverId, shipment.driverName)}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {shipment.origin.city} -{">"} {shipment.destination.city}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(shipment.updatedAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </PageSurface>
    </PageShell>
  )
}
