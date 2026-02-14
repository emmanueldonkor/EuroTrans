"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search } from "lucide-react"
import { useShipments, useDrivers } from "@/hooks/use-transport-data"
import { getStatusColor } from "@/lib/utils/format"
import { formatDate } from "@/lib/utils/format"

export default function ShipmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [driverFilter, setDriverFilter] = useState<string>("all")

  // Use TanStack Query hooks
  const { data: shipments = [], isLoading: shipmentsLoading, error: shipmentsError } = useShipments({
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    driverId: driverFilter !== "all" ? driverFilter : undefined,
    search: searchTerm || undefined,
  })

  const { data: drivers = [], isLoading: driversLoading } = useDrivers()

  const isLoading = shipmentsLoading || driversLoading

  // Enhance filtering logic if API doesn't fully support all filters yet (mock API does basic filtering)
  const filteredShipments = shipments.filter((shipment) => {
    // Client-side filtering as a fallback or enhancement
    const matchesSearch = !searchTerm || shipment.trackingId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter
    const matchesDriver = driverFilter === "all" || shipment.driverId === driverFilter
    return matchesSearch && matchesStatus && matchesDriver
  })

  const getDriverName = (driverId?: string) => {
    if (!driverId) return "—"
    const driver = drivers.find((d) => d.id === driverId)
    return driver?.name || "Unknown"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading shipments...</div>
      </div>
    )
  }

  if (shipmentsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">Error loading shipments. Please try again.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipments</h1>
          <p className="text-muted-foreground">Manage and track all shipments</p>
        </div>
        <Link href="/dashboard/shipments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Shipment
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by tracking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem value="in-transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
          <Select value={driverFilter} onValueChange={setDriverFilter}>
            <SelectTrigger className="w-full sm:w-40">
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
      </Card>

      {/* Shipments Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Last Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No shipments found
                </TableCell>
              </TableRow>
            ) : (
              filteredShipments.map((shipment) => (
                <TableRow key={shipment.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Link href={`/dashboard/shipments/${shipment.id}`} className="font-medium hover:underline">
                      {shipment.trackingId}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(shipment.status)}>{shipment.status.replace("-", " ")}</Badge>
                  </TableCell>
                  <TableCell>{getDriverName(shipment.driverId)}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {shipment.origin.city} → {shipment.destination.city}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(shipment.updatedAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
