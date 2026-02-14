"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Package, MapPin, Upload, CheckCircle, Play, Navigation, Flag, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import type { Shipment, Location, ShipmentStatus } from "@/lib/types"
import { getStatusColor } from "@/lib/utils/format"
import { useToast } from "@/hooks/use-toast"

export default function DriverShipmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [uploadingProof, setUploadingProof] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)

  const [showLocationDialog, setShowLocationDialog] = useState(false)
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [locationData, setLocationData] = useState({
    city: "",
    address: "",
    country: "",
    postalCode: "",
  })
  const [milestoneData, setMilestoneData] = useState({
    type: "checkpoint" as const,
    note: "",
  })
  const [selectedStatus, setSelectedStatus] = useState<ShipmentStatus>("in-transit")

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    setLoading(true)
    try {
      const shipmentData = await api.getShipment(params.id as string)

      if (!shipmentData) {
        router.push("/driver/shipments")
        return
      }

      setShipment(shipmentData)
      setSelectedStatus(shipmentData.status)
    } catch (error) {
      console.error("Failed to load shipment:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartJourney = async () => {
    if (!shipment) return

    setActionLoading(true)

    try {
      await api.startShipment(shipment.id)

      toast({
        title: "Journey Started",
        description: "Your shipment journey has begun.",
      })
      await loadData()
    } catch (error) {
      console.error("Failed to start journey:", error)
      toast({
        title: "Error",
        description: "Failed to start journey. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      })
      return
    }

    setGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Use reverse geocoding or set coordinates directly
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            city: "Current Location",
            address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
            country: "",
            postalCode: "",
          }

          if (shipment) {
            await api.updateShipmentLocation(shipment.id, location)
            toast({
              title: "Location Updated",
              description: "Your current location has been recorded.",
            })
            await loadData()
          }
        } catch (error) {
          console.error("Failed to update location:", error)
          toast({
            title: "Error",
            description: "Failed to update location.",
            variant: "destructive",
          })
        } finally {
          setGettingLocation(false)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        setGettingLocation(false)
        toast({
          title: "Location Error",
          description: "Unable to get your current location. Please enable location services.",
          variant: "destructive",
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  const handleUpdateLocation = async () => {
    if (!shipment) return

    setActionLoading(true)

    try {
      const location: Location = {
        ...locationData,
        lat: 50.0 + Math.random() * 5,
        lng: 5.0 + Math.random() * 5,
      }

      await api.updateShipmentLocation(shipment.id, location)

      toast({
        title: "Location Updated",
        description: `Current location: ${locationData.city}`,
      })

      setShowLocationDialog(false)
      setLocationData({ city: "", address: "", country: "", postalCode: "" })
      await loadData()
    } catch (error) {
      console.error("Failed to update location:", error)
      toast({
        title: "Error",
        description: "Failed to update location.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddMilestone = async () => {
    if (!shipment || !milestoneData.note.trim()) return

    setActionLoading(true)

    try {
      const milestone = {
        type: milestoneData.type,
        note: milestoneData.note,
        location: shipment.currentLocation || shipment.origin,
      }

      await api.addShipmentMilestone(shipment.id, milestone)

      toast({
        title: "Milestone Added",
        description: milestoneData.note,
      })

      setShowMilestoneDialog(false)
      setMilestoneData({ type: "checkpoint", note: "" })
      await loadData()
    } catch (error) {
      console.error("Failed to add milestone:", error)
      toast({
        title: "Error",
        description: "Failed to add milestone.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!shipment) return

    setActionLoading(true)

    try {
      await api.updateShipment(shipment.id, { status: selectedStatus })

      toast({
        title: "Status Updated",
        description: `Shipment status changed to ${selectedStatus}`,
      })

      setShowStatusDialog(false)
      await loadData()
    } catch (error) {
      console.error("Failed to update status:", error)
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUploadProof = async () => {
    if (!shipment || !selectedFile) return

    setUploadingProof(true)

    try {
      const proofUrl = await api.uploadProofOfDelivery(selectedFile)

      await api.deliverShipment(shipment.id, proofUrl)

      toast({
        title: "Delivery Confirmed",
        description: "Proof of delivery uploaded successfully.",
      })

      await loadData()
      setSelectedFile(null)
    } catch (error) {
      console.error("Failed to upload proof:", error)
      toast({
        title: "Error",
        description: "Failed to upload proof. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingProof(false)
    }
  }

  if (loading || !shipment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading shipment...</div>
      </div>
    )
  }

  const canStart = shipment.status === "in-transit" && !shipment.startedAt
  const canUpdateLocation = shipment.status === "in-transit" && shipment.startedAt
  const canDeliver = shipment.status === "in-transit" && shipment.startedAt
  const isDelivered = shipment.status === "delivered"

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/driver/shipments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{shipment.trackingId}</h1>
        </div>
        <Badge className={getStatusColor(shipment.status)}>{shipment.status.replace("-", " ")}</Badge>
      </div>

      {/* Cargo Info */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Package className="h-5 w-5" />
          Cargo Details
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-muted-foreground">Description</Label>
            <p className="mt-1">{shipment.cargo.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Weight</Label>
              <p className="mt-1">{shipment.cargo.weight} kg</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Volume</Label>
              <p className="mt-1">{shipment.cargo.volume} m³</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Route Info */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <MapPin className="h-5 w-5" />
          Delivery Route
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Origin</Label>
            <p className="mt-1 font-medium">{shipment.origin.address}</p>
            <p className="text-sm text-muted-foreground">
              {shipment.origin.city}, {shipment.origin.postalCode}
            </p>
          </div>

          {shipment.currentLocation && (
            <>
              <div className="border-l-2 border-primary/30 h-6 ml-3" />
              <div className="bg-muted/50 p-3 rounded-lg">
                <Label className="text-muted-foreground">Current Location</Label>
                <p className="mt-1 font-medium">{shipment.currentLocation.city}</p>
                <p className="text-xs text-muted-foreground">{shipment.currentLocation.address}</p>
              </div>
            </>
          )}

          <div className="border-l-2 border-primary/30 h-8 ml-3" />

          <div>
            <Label className="text-muted-foreground">Destination</Label>
            <p className="mt-1 font-medium">{shipment.destination.address}</p>
            <p className="text-sm text-muted-foreground">
              {shipment.destination.city}, {shipment.destination.postalCode}
            </p>
          </div>
        </div>
      </Card>

      {shipment.milestones && shipment.milestones.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Flag className="h-5 w-5" />
            Journey Milestones
          </div>
          <div className="space-y-3">
            {shipment.milestones.map((milestone) => (
              <div key={milestone.id} className="border-l-2 border-muted pl-4 py-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{milestone.type}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(milestone.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{milestone.note}</p>
                <p className="text-xs text-muted-foreground mt-1">{milestone.location.city}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!isDelivered && (
        <div className="space-y-3">
          {canStart && (
            <Button className="w-full h-14 text-lg" onClick={handleStartJourney} disabled={actionLoading}>
              <Play className="mr-2 h-5 w-5" />
              {actionLoading ? "Starting..." : "Start Transit"}
            </Button>
          )}

          {canUpdateLocation && (
            <>
              <Button className="w-full h-14 text-lg" onClick={handleGetCurrentLocation} disabled={gettingLocation}>
                {gettingLocation ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="mr-2 h-5 w-5" />
                    Update Location (GPS)
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full h-14 text-lg bg-transparent"
                onClick={() => setShowLocationDialog(true)}
              >
                <MapPin className="mr-2 h-5 w-5" />
                Update Location (Manual)
              </Button>

              <Button
                variant="outline"
                className="w-full h-14 text-lg bg-transparent"
                onClick={() => setShowMilestoneDialog(true)}
              >
                <Flag className="mr-2 h-5 w-5" />
                Add Milestone
              </Button>

              <Button
                variant="outline"
                className="w-full h-14 text-lg bg-transparent"
                onClick={() => setShowStatusDialog(true)}
              >
                <Package className="mr-2 h-5 w-5" />
                Update Status
              </Button>
            </>
          )}

          {canDeliver && !selectedFile && (
            <Button className="w-full h-14 text-lg" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-5 w-5" />
              Upload POD
            </Button>
          )}

          {canDeliver && selectedFile && (
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                  Remove
                </Button>
              </div>
              <Button className="w-full h-12 text-base" onClick={handleUploadProof} disabled={uploadingProof}>
                {uploadingProof ? "Uploading..." : "Mark Delivered"}
              </Button>
            </Card>
          )}

          <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileSelect} />
        </div>
      )}

      {isDelivered && (
        <Card className="p-6 flex flex-col items-center text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Delivery Complete</h3>
          <p className="text-sm text-muted-foreground">This shipment has been successfully delivered.</p>
        </Card>
      )}

      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Location</DialogTitle>
            <DialogDescription>Manually enter your current location for this shipment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>City</Label>
              <Input
                value={locationData.city}
                onChange={(e) => setLocationData({ ...locationData, city: e.target.value })}
                placeholder="e.g. Munich"
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={locationData.address}
                onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                placeholder="e.g. Highway A8 Rest Area"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Country</Label>
                <Input
                  value={locationData.country}
                  onChange={(e) => setLocationData({ ...locationData, country: e.target.value })}
                  placeholder="Germany"
                />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input
                  value={locationData.postalCode}
                  onChange={(e) => setLocationData({ ...locationData, postalCode: e.target.value })}
                  placeholder="80331"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLocationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLocation} disabled={actionLoading || !locationData.city}>
              Update Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
            <DialogDescription>Record an important event during your journey</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Milestone Type</Label>
              <Select
                value={milestoneData.type}
                onValueChange={(value: any) => setMilestoneData({ ...milestoneData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkpoint">Checkpoint</SelectItem>
                  <SelectItem value="delay">Delay</SelectItem>
                  <SelectItem value="rest">Rest Stop</SelectItem>
                  <SelectItem value="refuel">Refuel</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Note</Label>
              <Textarea
                value={milestoneData.note}
                onChange={(e) => setMilestoneData({ ...milestoneData, note: e.target.value })}
                placeholder="Describe what happened..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMilestoneDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMilestone} disabled={actionLoading || !milestoneData.note.trim()}>
              Add Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Shipment Status</DialogTitle>
            <DialogDescription>Change the current status of this shipment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Status</Label>
              <Select value={selectedStatus} onValueChange={(value: ShipmentStatus) => setSelectedStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={actionLoading}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
