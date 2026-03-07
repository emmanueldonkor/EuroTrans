"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Driver } from "@/lib/types"
import { User, Loader2, Search } from "lucide-react"
import { useDriverMutations, useDriversPage } from "@/hooks/use-transport-data"
import { useToast } from "@/hooks/use-toast"
import { PageErrorState, SectionLoader } from "@/components/ui/page-state"
import { PageHeading, PageShell, PageSurface } from "@/components/ui/page-shell"
import { toActionErrorMessage } from "@/lib/utils/error"
import { useI18n } from "@/components/providers/i18n-provider"
import { DataPagination } from "@/components/ui/data-pagination"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | Driver["status"]>("all")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250)
  const { data: driversPage, isLoading, isFetching, error: queryError, refetch } = useDriversPage({
    search: debouncedSearchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    pageSize,
  })
  const drivers = driversPage?.items ?? []
  const totalCount = driversPage?.totalCount ?? 0
  const { updateStatus } = useDriverMutations()
  const { toast } = useToast()
  const { t } = useI18n()
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<"available" | "on-duty" | "off-duty">("available")
  const updating = updateStatus.isPending

  const getStatusColor = (status: string) => {
    const colors = {
      available:
        "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/30",
      "on-duty":
        "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-400/30",
      "off-duty":
        "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-400/30",
    }
    return colors[status as keyof typeof colors] || colors.available
  }

  const isDriverStatus = (value: string): value is Driver["status"] =>
    value === "available" || value === "on-duty" || value === "off-duty"

  const getDriverStatusLabel = (status: Driver["status"]) => {
    if (status === "available") return t("employees.status.available")
    if (status === "on-duty") return t("employees.status.onDuty")
    return t("employees.status.offDuty")
  }

  const handleUpdateStatus = (driver: Driver) => {
    setSelectedDriver(driver)
    setNewStatus(driver.status)
    setShowStatusDialog(true)
  }

  const confirmUpdateStatus = async () => {
    if (!selectedDriver) return

    try {
      const result = await updateStatus.mutateAsync({ id: selectedDriver.id, status: newStatus })

      if (result.success) {
        await refetch()
        setShowStatusDialog(false)
        setSelectedDriver(null)
        toast({
          title: t("employees.toast.statusUpdatedTitle"),
          description: t("employees.toast.statusUpdatedDescription")
            .replace("{name}", selectedDriver.name)
            .replace("{status}", getDriverStatusLabel(newStatus)),
        })
      } else {
        const message = result.error || t("employees.toast.updateFailedFallback")
        toast({
          title: t("employees.toast.updateFailedTitle"),
          description: message,
          variant: "destructive",
        })
      }
    } catch (err) {
      const message = toActionErrorMessage(err, t("employees.toast.updateErrorFallback"))
      toast({
        title: t("employees.toast.updateFailedTitle"),
        description: message,
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <SectionLoader label={t("employees.loading")} />
  }

  if (queryError) {
    return (
      <PageErrorState
        title={t("employees.errorTitle")}
        message={queryError instanceof Error ? queryError.message : t("employees.errorMessage")}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  return (
    <PageShell>
      <PageHeading title={t("employees.title")} description={t("employees.description")} />

      <PageSurface className="p-4 bg-gradient-to-r from-card to-muted/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              placeholder={t("employees.searchPlaceholder")}
              className="h-10 pl-9 bg-background/90"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as "all" | Driver["status"])
              setPage(1)
            }}
          >
            <SelectTrigger className="h-10 w-full sm:w-52 bg-background/90">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("employees.statusFilter.all")}</SelectItem>
              <SelectItem value="available">{t("employees.status.available")}</SelectItem>
              <SelectItem value="on-duty">{t("employees.status.onDuty")}</SelectItem>
              <SelectItem value="off-duty">{t("employees.status.offDuty")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageSurface>

      <PageSurface className="table-shell">
        <Table>
          <TableHeader className="table-head-sticky">
            <TableRow>
              <TableHead>{t("employees.table.name")}</TableHead>
              <TableHead>{t("employees.table.email")}</TableHead>
              <TableHead>{t("employees.table.phone")}</TableHead>
              <TableHead>{t("employees.table.license")}</TableHead>
              <TableHead>{t("employees.table.status")}</TableHead>
              <TableHead className="text-right">{t("employees.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {t("employees.table.empty")}
                </TableCell>
              </TableRow>
            ) : (
              drivers.map((driver) => (
                <TableRow key={driver.id} className="table-row-interactive">
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.email}</TableCell>
                  <TableCell>{driver.phone}</TableCell>
                  <TableCell className="font-mono text-sm">{driver.licenseNumber}</TableCell>
                  <TableCell>
                  <Badge className={getStatusColor(driver.status)}>
                      {getDriverStatusLabel(driver.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="bg-background/70" onClick={() => handleUpdateStatus(driver)}>
                      <User className="h-4 w-4 mr-2" />
                      {t("employees.updateStatus")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </PageSurface>

      <PageSurface className="p-4">
        <DataPagination page={page} pageSize={pageSize} totalCount={totalCount} onPageChange={setPage} disabled={isFetching} />
      </PageSurface>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="panel">
          <DialogHeader>
            <DialogTitle>{t("employees.dialog.title")}</DialogTitle>
            <DialogDescription>{t("employees.dialog.description").replace("{name}", selectedDriver?.name ?? "")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("employees.dialog.newStatus")}</Label>
              <RadioGroup
                value={newStatus}
                onValueChange={(v) => {
                  if (isDriverStatus(v)) {
                    setNewStatus(v)
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="available" id="available" />
                  <Label htmlFor="available" className="font-normal cursor-pointer">
                    {t("employees.status.available")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="on-duty" id="on-duty" />
                  <Label htmlFor="on-duty" className="font-normal cursor-pointer">
                    {t("employees.status.onDuty")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="off-duty" id="off-duty" />
                  <Label htmlFor="off-duty" className="font-normal cursor-pointer">
                    {t("employees.status.offDuty")}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)} disabled={updating}>
              {t("common.cancel")}
            </Button>
            <Button onClick={confirmUpdateStatus} disabled={updating || newStatus === selectedDriver?.status}>
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {updating ? t("employees.action.updating") : t("employees.updateStatus")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
