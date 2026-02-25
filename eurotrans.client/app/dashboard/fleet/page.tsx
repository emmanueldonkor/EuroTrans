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
import type { Truck as TruckType } from "@/lib/types"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTruckMutations, useTrucks } from "@/hooks/use-transport-data"
import { PageErrorState, SectionLoader } from "@/components/ui/page-state"
import { PageHeader, PageHeading, PageShell, PageSurface } from "@/components/ui/page-shell"

export default function FleetPage() {
  const { data: trucks = [], isLoading, error: queryError, refetch } = useTrucks()
  const { createTruck, updateTruck, deleteTruck } = useTruckMutations()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedTruck, setSelectedTruck] = useState<TruckType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    plateNumber: "",
    model: "",
    capacity: "",
    status: "available" as TruckType["status"],
  })

  const handleCreate = async () => {
    setError(null)
    try {
      await createTruck.mutateAsync({
        plateNumber: formData.plateNumber,
        model: formData.model,
        capacity: Number(formData.capacity),
        status: formData.status,
      })
      setShowCreateDialog(false)
      setFormData({ plateNumber: "", model: "", capacity: "", status: "available" })
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      console.error(err)
    }
  }

  const handleEdit = async () => {
    if (!selectedTruck) return
    setError(null)

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
        setError(result.error || "Failed to update truck")
        return
      }

      setShowEditDialog(false)
      setSelectedTruck(null)
      setFormData({ plateNumber: "", model: "", capacity: "", status: "available" })
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!selectedTruck) return
    setError(null)

    try {
      const result = await deleteTruck.mutateAsync(selectedTruck.id)

      if (!result.success) {
        setError(result.error || "Failed to delete truck")
        setShowDeleteDialog(false)
        return
      }

      setShowDeleteDialog(false)
      setSelectedTruck(null)
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      console.error(err)
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
    setError(null)
    setShowEditDialog(true)
  }

  const openDeleteDialog = (truck: TruckType) => {
    setSelectedTruck(truck)
    setError(null)
    setShowDeleteDialog(true)
  }

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

  if (isLoading) {
    return <SectionLoader label="Loading trucks..." />
  }

  if (queryError) {
    return (
      <PageErrorState
        title="Could not load fleet"
        message={queryError instanceof Error ? queryError.message : "Unexpected error while loading fleet."}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  return (
    <PageShell>
      <PageHeader>
        <PageHeading title="Fleet" description="Manage your truck fleet" />
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Truck
        </Button>
      </PageHeader>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <PageSurface className="table-shell">
        <Table>
          <TableHeader className="table-head-sticky">
            <TableRow>
              <TableHead>Plate Number</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trucks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No trucks found
                </TableCell>
              </TableRow>
            ) : (
              trucks.map((truck) => (
                <TableRow key={truck.id} className="table-row-interactive">
                  <TableCell className="font-medium">{truck.plateNumber}</TableCell>
                  <TableCell>{truck.model}</TableCell>
                  <TableCell>{truck.capacity.toLocaleString()} kg</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(truck.status)}>{truck.status}</Badge>
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

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="panel">
          <DialogHeader>
            <DialogTitle>Add New Truck</DialogTitle>
            <DialogDescription>Create a new truck in your fleet</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="plateNumber">Plate Number</Label>
              <Input
                id="plateNumber"
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                placeholder="e.g. B-TR-1234"
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g. Mercedes Actros 2545"
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacity (kg)</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="e.g. 25000"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as TruckType["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in-use">In Use</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={createTruck.isPending}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createTruck.isPending}>
              {createTruck.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {createTruck.isPending ? "Creating..." : "Create Truck"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="panel">
          <DialogHeader>
            <DialogTitle>Edit Truck</DialogTitle>
            <DialogDescription>Update truck information (only if not in use)</DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-plateNumber">Plate Number</Label>
              <Input
                id="edit-plateNumber"
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-model">Model</Label>
              <Input
                id="edit-model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-capacity">Capacity (kg)</Label>
              <Input
                id="edit-capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as TruckType["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in-use">In Use</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={updateTruck.isPending}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updateTruck.isPending}>
              {updateTruck.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {updateTruck.isPending ? "Updating..." : "Update Truck"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="panel">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Truck</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete truck {selectedTruck?.plateNumber}? This action cannot be undone. The
              truck can only be deleted if it is not assigned to any active shipments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)} disabled={deleteTruck.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteTruck.isPending}>
              {deleteTruck.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deleteTruck.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  )
}
