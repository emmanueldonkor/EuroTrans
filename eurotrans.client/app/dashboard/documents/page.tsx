"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Download, Search, Package } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/api"
import type { Shipment } from "@/lib/types"
import { formatDate } from "@/lib/utils/format"
import { getStatusBadgeColor, getStatusLabel } from "@/lib/shipment-rules"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { PageErrorState, SectionLoader } from "@/components/ui/page-state"
import { PageHeading, PageShell, PageSurface } from "@/components/ui/page-shell"

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250)

  const {
    data: shipments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["documents", "delivered-with-pod"],
    queryFn: async () => {
      const delivered = await api.getShipments({ status: "delivered" })
      const detailed = await Promise.all(delivered.map((shipment) => api.getShipment(shipment.id)))
      return detailed.filter((s): s is Shipment => Boolean(s && s.proofOfDeliveryUrl))
    },
    staleTime: 60_000,
  })

  const filteredShipments = useMemo(
    () => shipments.filter((shipment) => shipment.trackingId.toLowerCase().includes(debouncedSearchTerm.toLowerCase())),
    [debouncedSearchTerm, shipments],
  )

  if (isLoading) {
    return <SectionLoader label="Loading documents..." />
  }

  if (error) {
    return (
      <PageErrorState
        title="Could not load documents"
        message={error instanceof Error ? error.message : "Unexpected error while loading documents."}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  return (
    <PageShell>
      <PageHeading title="Documents" description="Access shipment documents and proof of delivery files" />

      <PageSurface className="p-4 bg-gradient-to-r from-card to-muted/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by tracking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 pl-9 bg-background/90"
          />
        </div>
      </PageSurface>

      {filteredShipments.length === 0 ? (
        <PageSurface className="panel-muted p-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {searchTerm
              ? "No documents match your search criteria."
              : "Documents will appear here once shipments are delivered with proof of delivery."}
          </p>
        </PageSurface>
      ) : (
        <PageSurface className="table-shell">
          <Table>
            <TableHeader className="table-head-sticky">
              <TableRow>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Document</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments.map((shipment) => (
                <TableRow key={shipment.id} className="table-row-interactive">
                  <TableCell>
                    <Link href={`/dashboard/shipments/${shipment.id}`} className="font-medium hover:underline underline-offset-4">
                      {shipment.trackingId}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(shipment.status)}>{getStatusLabel(shipment.status)}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {shipment.origin.city} -{">"} {shipment.destination.city}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {shipment.deliveredAt ? formatDate(shipment.deliveredAt) : "-"}
                  </TableCell>
                  <TableCell>
                    {shipment.proofOfDeliveryUrl ? (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={shipment.proofOfDeliveryUrl} download>
                          <Download className="h-4 w-4 mr-2" />
                          POD
                        </a>
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </PageSurface>
      )}

      {filteredShipments.length > 0 && (
        <PageSurface className="p-6 surface-hover">
          <div className="flex items-center gap-4">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Documents</p>
              <p className="text-2xl font-bold">{filteredShipments.length}</p>
            </div>
          </div>
        </PageSurface>
      )}
    </PageShell>
  )
}
