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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"
import type { Driver } from "@/lib/types"
import { AlertCircle, User } from "lucide-react"

export default function EmployeesPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<"available" | "on-duty" | "off-duty">("available")
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDrivers()
  }, [])

  const loadDrivers = async () => {
    try {
      const data = await api.getDrivers()
      setDrivers(data)
    } catch (error) {
      console.error("Failed to load drivers:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      available: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      "on-duty": "bg-teal-50 text-teal-700 border border-teal-200",
      "off-duty": "bg-slate-100 text-slate-500 border border-slate-200",
    }
    return colors[status as keyof typeof colors] || colors.available
  }

  const handleUpdateStatus = (driver: Driver) => {
    setSelectedDriver(driver)
    setNewStatus(driver.status)
    setError(null)
    setShowStatusDialog(true)
  }

  const confirmUpdateStatus = async () => {
    if (!selectedDriver) return

    setUpdating(true)
    setError(null)

    try {
      const result = await api.updateDriverStatus(selectedDriver.id, newStatus)

      if (result.success) {
        await loadDrivers()
        setShowStatusDialog(false)
        setSelectedDriver(null)
      } else {
        setError(result.error || "Failed to update status")
      }
    } catch (err) {
      setError("An error occurred while updating status")
      console.error("Failed to update driver status:", err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
        <p className="text-muted-foreground">Manage your driver workforce</p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading drivers...
                </TableCell>
              </TableRow>
            ) : drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No drivers found
                </TableCell>
              </TableRow>
            ) : (
              drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.email}</TableCell>
                  <TableCell>{driver.phone}</TableCell>
                  <TableCell className="font-mono text-sm">{driver.licenseNumber}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(driver.status)}>{driver.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(driver)}>
                      <User className="h-4 w-4 mr-2" />
                      Update Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Employee Status</DialogTitle>
            <DialogDescription>
              Change the status for {selectedDriver?.name}. Status can only be updated when the employee is not on duty
              or assigned to an active shipment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>New Status</Label>
              <RadioGroup value={newStatus} onValueChange={(v) => setNewStatus(v as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="available" id="available" />
                  <Label htmlFor="available" className="font-normal cursor-pointer">
                    Available
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="on-duty" id="on-duty" />
                  <Label htmlFor="on-duty" className="font-normal cursor-pointer">
                    On Duty
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="off-duty" id="off-duty" />
                  <Label htmlFor="off-duty" className="font-normal cursor-pointer">
                    Off Duty
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)} disabled={updating}>
              Cancel
            </Button>
            <Button onClick={confirmUpdateStatus} disabled={updating || newStatus === selectedDriver?.status}>
              {updating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
