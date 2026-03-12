"use client"

import { useState, Suspense } from "react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import type { Truck as TruckType } from "@/lib/types"
import { Plus, Edit, Trash2, Loader2, Search } from "lucide-react"
import { useTruckMutations, useTrucksPage } from "@/hooks/use-transport-data"
import { useToast } from "@/hooks/use-toast"
import { PageErrorState, SectionLoader } from "@/components/ui/page-state"
import { PageHeader, PageHeading, PageShell, PageSurface } from "@/components/ui/page-shell"
import { toActionErrorMessage } from "@/lib/utils/error"
import { useI18n } from "@/components/providers/i18n-provider"
import { DataPagination } from "@/components/ui/data-pagination"

function FleetTableContent({
  searchTerm,
  statusFilter,
  page,
  setPage,
  pageSize
}: {
  searchTerm: string,
  statusFilter: "all" | TruckType["status"],
  page: number,
  setPage: (p: number) => void,
  pageSize: number
}) {
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250)
  const { data: trucksPage, isLoading, isFetching, error: queryError, refetch } = useTrucksPage({
    search: debouncedSearchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    pageSize,
  })
  
  const trucks = trucksPage?.items ?? []
  const totalCount = trucksPage?.totalCount ?? 0
  const { createTruck, updateTruck, deleteTruck } = useTruckMutations()
  const { toast } = useToast()
  const { t } = useI18n()
  
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedTruck, setSelectedTruck] = useState<TruckType | null>(null)
  const [formData, setFormData] = useState({
    plateNumber: "",
    model: "",
    capacity: "",
    status: "available" as TruckType["status"],
  })

  const getStatusColor = (status: string) => {
    const colors = {
      available:
        "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/30",
      "in-use":
        "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-400/30",
      maintenance:
        "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-400/30",
    }
    return colors[status as keyof typeof colors] || colors.available
  }

  const getTruckStatusLabel = (status: TruckType["status"]) => {
    if (status === "available") return t("fleet.status.available")
    if (status === "in-use") return t("fleet.status.inUse")
    return t("fleet.status.maintenance")
  }

  const handleEdit = async () => {
    if (!selectedTruck) return

    try {
      const result = await updateTruck.mutateAsync({
        id: selectedTruck.id,
        data: {
        plateNumber: formData.plateNumber,
        model: formData.model,
        capacity: Number(formData.capacity),
        status: formData.status,
        },
      })

      if (!result.success) {
        toast({
          title: t("fleet.toast.updateErrorTitle"),
          description: result.error || t("fleet.toast.updateResultFallback"),
          variant: "destructive",
        })
        return
      }

      setShowEditDialog(false)
      setSelectedTruck(null)
      setFormData({ plateNumber: "", model: "", capacity: "", status: "available" })
      await refetch()
      toast({
        title: t("fleet.toast.updateTitle"),
        description: t("fleet.toast.updateDescription").replace("{plateNumber}", selectedTruck.plateNumber),
      })
    } catch (err) {
      const message = toActionErrorMessage(err, t("fleet.toast.updateErrorFallback"))
      toast({
        title: t("fleet.toast.updateErrorTitle"),
        description: message,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedTruck) return

    try {
      const result = await deleteTruck.mutateAsync(selectedTruck.id)

      if (!result.success) {
        toast({
          title: t("fleet.toast.deleteErrorTitle"),
          description: result.error || t("fleet.toast.deleteResultFallback"),
          variant: "destructive",
        })
        setShowDeleteDialog(false)
        return
      }

      setShowDeleteDialog(false)
      setSelectedTruck(null)
      await refetch()
      toast({
        title: t("fleet.toast.deleteTitle"),
        description: t("fleet.toast.deleteDescription"),
      })
    } catch (err) {
      const message = toActionErrorMessage(err, t("fleet.toast.deleteErrorFallback"))
      toast({
        title: t("fleet.toast.deleteErrorTitle"),
        description: message,
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (truck: TruckType) => {
    setSelectedTruck(truck)
    setFormData({
      plateNumber: truck.plateNumber,
      model: truck.model,
      capacity: String(truck.capacity),
      status: truck.status,
    })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (truck: TruckType) => {
    setSelectedTruck(truck)
    setShowDeleteDialog(true)
  }

  if (isLoading) {
    return <SectionLoader label={t("fleet.loading")} />
  }

  if (queryError) {
    return (
      <PageErrorState
        title={t("fleet.errorTitle")}
        message={queryError instanceof Error ? queryError.message : t("fleet.errorMessage")}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  return (
    <>
      <PageSurface className="table-shell">
        <Table>
          <TableHeader className="table-head-sticky">
            <TableRow>
              <TableHead>{t("fleet.table.plateNumber")}</TableHead>
              <TableHead>{t("fleet.table.model")}</TableHead>
              <TableHead>{t("fleet.table.capacity")}</TableHead>
              <TableHead>{t("fleet.table.status")}</TableHead>
              <TableHead className="text-right">{t("fleet.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trucks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {t("fleet.table.empty")}
                </TableCell>
              </TableRow>
            ) : (
              trucks.map((truck) => (
                <TableRow key={truck.id} className="table-row-interactive">
                  <TableCell className="font-medium">{truck.plateNumber}</TableCell>
                  <TableCell>{truck.model}</TableCell>
                  <TableCell>{truck.capacity.toLocaleString()} kg</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(truck.status)}>{getTruckStatusLabel(truck.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" className="bg-background/70" onClick={() => openEditDialog(truck)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="bg-background/70" onClick={() => openDeleteDialog(truck)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </PageSurface>

      <PageSurface className="p-4 mt-6">
        <DataPagination page={page} pageSize={pageSize} totalCount={totalCount} onPageChange={setPage} disabled={isFetching} />
      </PageSurface>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="panel">
          <DialogHeader>
            <DialogTitle>{t("fleet.dialog.editTitle")}</DialogTitle>
            <DialogDescription>{t("fleet.dialog.editDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-plateNumber">{t("fleet.form.plateNumber")}</Label>
              <Input
                id="edit-plateNumber"
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-model">{t("fleet.form.model")}</Label>
              <Input
                id="edit-model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">{t("fleet.form.capacity")}</Label>
              <Input
                id="edit-capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">{t("fleet.form.status")}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as TruckType["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">{t("fleet.status.available")}</SelectItem>
                  <SelectItem value="in-use">{t("fleet.status.inUse")}</SelectItem>
                  <SelectItem value="maintenance">{t("fleet.status.maintenance")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={updateTruck.isPending}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleEdit} disabled={updateTruck.isPending}>
              {updateTruck.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {updateTruck.isPending ? t("fleet.action.updating") : t("fleet.action.update")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="panel">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("fleet.dialog.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("fleet.dialog.deleteDescription").replace("{plateNumber}", selectedTruck?.plateNumber ?? "")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)} disabled={deleteTruck.isPending}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteTruck.isPending}>
              {deleteTruck.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deleteTruck.isPending ? t("fleet.action.deleting") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default function FleetPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | TruckType["status"]>("all")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const { t } = useI18n()
  
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { createTruck } = useTruckMutations()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    plateNumber: "",
    model: "",
    capacity: "",
    status: "available" as TruckType["status"],
  })

  const handleCreate = async () => {
    try {
      await createTruck.mutateAsync({
        plateNumber: formData.plateNumber,
        model: formData.model,
        capacity: Number(formData.capacity),
        status: formData.status,
      })
      setShowCreateDialog(false)
      setFormData({ plateNumber: "", model: "", capacity: "", status: "available" })
      toast({
        title: t("fleet.toast.createTitle"),
        description: t("fleet.toast.createDescription"),
      })
      window.location.reload(); // Quick hack to refresh after create while avoiding complex prop drilling
    } catch (err) {
      const message = toActionErrorMessage(err, t("fleet.toast.createErrorFallback"))
      toast({
        title: t("fleet.toast.createErrorTitle"),
        description: message,
        variant: "destructive",
      })
    }
  }

  return (
    <PageShell>
      <PageHeader>
        <PageHeading title={t("fleet.title")} description={t("fleet.description")} />
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("fleet.addTruck")}
        </Button>
      </PageHeader>

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
              placeholder={t("fleet.searchPlaceholder")}
              className="h-10 pl-9 bg-background/90"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as "all" | TruckType["status"])
              setPage(1)
            }}
          >
            <SelectTrigger className="h-10 w-full sm:w-52 bg-background/90">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("fleet.statusFilter.all")}</SelectItem>
              <SelectItem value="available">{t("fleet.status.available")}</SelectItem>
              <SelectItem value="in-use">{t("fleet.status.inUse")}</SelectItem>
              <SelectItem value="maintenance">{t("fleet.status.maintenance")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageSurface>

      <Suspense fallback={<SectionLoader label={t("fleet.loading")} />}>
        <FleetTableContent 
          searchTerm={searchTerm} 
          statusFilter={statusFilter} 
          page={page} 
          setPage={setPage} 
          pageSize={pageSize} 
        />
      </Suspense>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="panel">
          <DialogHeader>
            <DialogTitle>{t("fleet.dialog.createTitle")}</DialogTitle>
            <DialogDescription>{t("fleet.dialog.createDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plateNumber">{t("fleet.form.plateNumber")}</Label>
              <Input
                id="plateNumber"
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                placeholder={t("fleet.form.placeholder.plateNumber")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">{t("fleet.form.model")}</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder={t("fleet.form.placeholder.model")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">{t("fleet.form.capacity")}</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder={t("fleet.form.placeholder.capacity")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">{t("fleet.form.status")}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as TruckType["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">{t("fleet.status.available")}</SelectItem>
                  <SelectItem value="in-use">{t("fleet.status.inUse")}</SelectItem>
                  <SelectItem value="maintenance">{t("fleet.status.maintenance")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={createTruck.isPending}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleCreate} disabled={createTruck.isPending}>
              {createTruck.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {createTruck.isPending ? t("fleet.action.creating") : t("fleet.action.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
