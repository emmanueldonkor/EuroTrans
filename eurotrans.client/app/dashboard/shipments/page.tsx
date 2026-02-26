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
import { useI18n } from "@/components/providers/i18n-provider"

export default function ShipmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [driverFilter, setDriverFilter] = useState<string>("all")
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300)
  const { t } = useI18n()

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
    if (!driverId) return t("shipments.driverNotAssigned")
    const driver = drivers.find((d) => d.id === driverId)
    return driver?.name || t("shipments.driverUnknown")
  }

  if (isLoading && shipments.length === 0) {
    return <SectionLoader label={t("shipments.loading")} />
  }

  return (
    <PageShell>
      <PageHeader>
        <PageHeading
          title={t("shipments.title")}
          description={
            <>
              {t("shipments.description")}
              {shipmentsFetching && <span className="ml-2 text-xs">{t("shipments.refreshing")}</span>}
            </>
          }
        />
        <Link href="/dashboard/shipments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("shipments.create")}
          </Button>
        </Link>
      </PageHeader>

      {shipmentsError && (
        <Alert variant="destructive">
          <AlertDescription>{shipmentsError instanceof Error ? shipmentsError.message : t("shipments.errorLoad")}</AlertDescription>
        </Alert>
      )}

      <PageSurface className="p-4 bg-gradient-to-r from-card to-muted/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("shipments.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-9 bg-background/90"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-full sm:w-44 bg-background/90">
              <SelectValue placeholder={t("shipments.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("shipments.allStatus")}</SelectItem>
              <SelectItem value="unassigned">{t("status.unassigned")}</SelectItem>
              <SelectItem value="assigned">{t("shipments.status.assigned")}</SelectItem>
              <SelectItem value="in-transit">{t("status.inTransit")}</SelectItem>
              <SelectItem value="delivered">{t("status.delivered")}</SelectItem>
              <SelectItem value="cancelled">{t("shipments.status.cancelled")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={driverFilter} onValueChange={setDriverFilter}>
            <SelectTrigger className="h-10 w-full sm:w-44 bg-background/90">
              <SelectValue placeholder={t("shipments.driver")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("shipments.allDrivers")}</SelectItem>
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
              <TableHead>{t("shipments.trackingId")}</TableHead>
              <TableHead>{t("shipments.status")}</TableHead>
              <TableHead>{t("shipments.driver")}</TableHead>
              <TableHead>{t("shipments.route")}</TableHead>
              <TableHead>{t("shipments.lastUpdate")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {shipmentsError ? t("shipments.errorLoad") : t("shipments.noResults")}
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
                    <Badge className={getStatusColor(shipment.status)}>
                      {shipment.status === "unassigned"
                        ? t("status.unassigned")
                        : shipment.status === "assigned"
                          ? t("shipments.status.assigned")
                          : shipment.status === "in-transit"
                            ? t("status.inTransit")
                            : shipment.status === "delivered"
                              ? t("status.delivered")
                              : t("shipments.status.cancelled")}
                    </Badge>
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
