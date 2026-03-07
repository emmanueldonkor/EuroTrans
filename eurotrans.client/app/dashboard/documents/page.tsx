"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Download, Search, Package } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils/format"
import { getStatusBadgeColor, getStatusLabel } from "@/lib/shipment-rules"
import Link from "next/link"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { PageErrorState, SectionLoader } from "@/components/ui/page-state"
import { PageHeading, PageShell, PageSurface } from "@/components/ui/page-shell"
import { useI18n } from "@/components/providers/i18n-provider"
import { useShipmentsPage } from "@/hooks/use-transport-data"
import { DataPagination } from "@/components/ui/data-pagination"

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250)
  const { t } = useI18n()

  const {
    data: shipmentsPage,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useShipmentsPage({
    status: "delivered",
    hasProofOfDelivery: true,
    search: debouncedSearchTerm || undefined,
    page,
    pageSize,
  })
  const shipments = shipmentsPage?.items ?? []
  const totalCount = shipmentsPage?.totalCount ?? 0

  if (isLoading) {
    return <SectionLoader label={t("documents.loading")} />
  }

  if (error) {
    return (
      <PageErrorState
        title={t("documents.errorTitle")}
        message={error instanceof Error ? error.message : t("documents.errorMessage")}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  return (
    <PageShell>
      <PageHeading title={t("documents.title")} description={t("documents.description")} />

      <PageSurface className="p-4 bg-gradient-to-r from-card to-muted/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("documents.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
            className="h-10 pl-9 bg-background/90"
          />
        </div>
      </PageSurface>

      {shipments.length === 0 ? (
        <PageSurface className="panel-muted p-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">{t("documents.emptyTitle")}</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {searchTerm
              ? t("documents.emptySearch")
              : t("documents.emptyDefault")}
          </p>
        </PageSurface>
      ) : (
        <PageSurface className="table-shell">
          <Table>
            <TableHeader className="table-head-sticky">
              <TableRow>
                <TableHead>{t("documents.table.trackingId")}</TableHead>
                <TableHead>{t("documents.table.status")}</TableHead>
                <TableHead>{t("documents.table.route")}</TableHead>
                <TableHead>{t("documents.table.delivered")}</TableHead>
                <TableHead>{t("documents.table.document")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((shipment) => (
                <TableRow key={shipment.id} className="table-row-interactive">
                  <TableCell>
                    <Link href={`/dashboard/shipments/${shipment.id}`} className="font-medium hover:underline underline-offset-4">
                      {shipment.trackingId}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(shipment.status)}>{getStatusLabel(shipment.status, t)}</Badge>
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
                          {t("documents.table.pod")}
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

      {totalCount > 0 && (
        <PageSurface className="p-6 surface-hover">
          <div className="flex items-center gap-4">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">{t("documents.totalDocuments")}</p>
              <p className="text-2xl font-bold">{totalCount}</p>
            </div>
          </div>
        </PageSurface>
      )}

      <PageSurface className="p-4">
        <DataPagination page={page} pageSize={pageSize} totalCount={totalCount} onPageChange={setPage} disabled={isFetching} />
      </PageSurface>
    </PageShell>
  )
}
