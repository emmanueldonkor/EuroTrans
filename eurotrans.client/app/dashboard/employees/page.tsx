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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Driver } from "@/lib/types"
import { User, Loader2 } from "lucide-react"
import { useDriverMutations, useDrivers } from "@/hooks/use-transport-data"
import { useToast } from "@/hooks/use-toast"
import { PageErrorState, SectionLoader } from "@/components/ui/page-state"
import { PageHeading, PageShell, PageSurface } from "@/components/ui/page-shell"
import { toActionErrorMessage } from "@/lib/utils/error"
import { useI18n } from "@/components/providers/i18n-provider"

export default function EmployeesPage() {
  const { data: drivers = [], isLoading, error: queryError, refetch } = useDrivers()
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
            .replace("{status}", newStatus.replace("-", " ")),
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
                      {driver.status === "available"
                        ? t("employees.status.available")
                        : driver.status === "on-duty"
                          ? t("employees.status.onDuty")
                          : t("employees.status.offDuty")}
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
