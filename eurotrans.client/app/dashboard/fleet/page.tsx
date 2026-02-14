"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
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
import { api } from "@/lib/api"
import type { Truck as TruckType } from "@/lib/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function FleetPage() {
  const [trucks, setTrucks] = useState<TruckType[]>([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    loadTrucks()
  }, [])

  const loadTrucks = async () => {
    try {
      const data = await api.getTrucks()
      setTrucks(data)
    } catch (error) {
      console.error("Failed to load trucks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    setError(null)
    try {
      await api.createTruck({
        plateNumber: formData.plateNumber,
        model: formData.model,
        capacity: Number(formData.capacity),
        status: formData.status,
      })
      setShowCreateDialog(false)
      setFormData({ plateNumber: "", model: "", capacity: "", status: "available" })
      loadTrucks()
    } catch (err) {
      setError("Failed to create truck")
      console.error(err)
    }
  }

  const handleEdit = async () => {
    if (!selectedTruck) return
    setError(null)

    try {
      const result = await api.updateTruck(selectedTruck.id, {
        plateNumber: formData.plateNumber,
        model: formData.model,
        capacity: Number(formData.capacity),
        status: formData.status,
      })

      if (!result.success) {
        setError(result.error || "Failed to update truck")
        return
      }

      setShowEditDialog(false)
      setSelectedTruck(null)
      setFormData({ plateNumber: "", model: "", capacity: "", status: "available" })
      loadTrucks()
    } catch (err) {
      setError("Failed to update truck")
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!selectedTruck) return
    setError(null)

    try {
      const result = await api.deleteTruck(selectedTruck.id)

      if (!result.success) {
        setError(result.error || "Failed to delete truck")
        setShowDeleteDialog(false)
        return
      }

      setShowDeleteDialog(false)
      setSelectedTruck(null)
      loadTrucks()
    } catch (err) {
      setError("Failed to delete truck")
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
      available: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      "in-use": "bg-teal-50 text-teal-700 border border-teal-200",
      maintenance: "bg-amber-50 text-amber-700 border border-amber-200",
    }
    return colors[status as keyof typeof colors] || colors.available
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet</h1>
          <p className="text-muted-foreground">Manage your truck fleet</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Truck
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plate Number</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading trucks...
                </TableCell>
              </TableRow>
            ) : trucks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No trucks found
                </TableCell>
              </TableRow>
            ) : (
              trucks.map((truck) => (
                <TableRow key={truck.id}>
                  <TableCell className="font-medium">{truck.plateNumber}</TableCell>
                  <TableCell>{truck.model}</TableCell>
                  <TableCell>{truck.capacity.toLocaleString()} kg</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(truck.status)}>{truck.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(truck)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openDeleteDialog(truck)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
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
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Truck</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
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
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Truck</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
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
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
