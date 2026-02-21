"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
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

export default function DocumentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const delivered = await api.getShipments({ status: "delivered" })
      const detailed = await Promise.all(delivered.map((shipment) => api.getShipment(shipment.id)))
      const deliveredWithProof = detailed.filter((s): s is Shipment => Boolean(s && s.proofOfDeliveryUrl))
      setShipments(deliveredWithProof)
    } catch (error) {
      console.error("Failed to load documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredShipments = shipments.filter((shipment) =>
    shipment.trackingId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">Access shipment documents and proof of delivery files</p>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by tracking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading documents...</div>
        </div>
      ) : filteredShipments.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center min-h-[400px]">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {searchTerm
              ? "No documents match your search criteria."
              : "Documents will appear here once shipments are delivered with proof of delivery."}
          </p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
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
                <TableRow key={shipment.id}>
                  <TableCell>
                    <Link href={`/dashboard/shipments/${shipment.id}`} className="font-medium hover:underline">
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
        </Card>
      )}

      {!loading && filteredShipments.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Documents</p>
              <p className="text-2xl font-bold">{filteredShipments.length}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
