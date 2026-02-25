"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Package, MapPin, CheckCircle, Play, Navigation, Flag, Loader2, Truck } from "lucide-react"
import { api } from "@/lib/api"
import type { Shipment, Location, Milestone } from "@/lib/types"
import { getStatusColor } from "@/lib/utils/format"
import { useToast } from "@/hooks/use-toast"
import { SectionLoader } from "@/components/ui/page-state"

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
  const [gettingMilestoneGps, setGettingMilestoneGps] = useState(false)

  const [showLocationDialog, setShowLocationDialog] = useState(false)
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false)
  const [showDeliverPanel, setShowDeliverPanel] = useState(false)

  const [locationData, setLocationData] = useState({
    city: "",
    address: "",
    country: "",
    postalCode: "",
    lat: "",
    lng: "",
  })

  const [milestoneData, setMilestoneData] = useState({
    type: "checkpoint" as Milestone["type"],
    note: "",
    locationLabel: "",
    lat: "",
    lng: "",
  })

  const toErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message.trim().length > 0) return error.message
    return fallback
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const loadData = async () => {
    setLoading(true)
    try {
      const shipmentData = await api.getShipment(String(params.id))
      if (!shipmentData) {
        router.push("/driver/shipments")
        return
      }

      setShipment(shipmentData)
      if (shipmentData.status !== "in-transit") {
        setShowDeliverPanel(false)
      }
    } catch (error) {
      console.error("Failed to load shipment:", error)
      toast({
        title: "Error",
        description: toErrorMessage(error, "Failed to load shipment."),
        variant: "destructive",
      })
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
        description: toErrorMessage(error, "Failed to start journey. Please try again."),
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const updateLocationWithGps = () => {
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
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            city: "GPS Location",
            address: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
            country: "",
            postalCode: "",
          }

          if (shipment) {
            await api.updateShipmentLocation(shipment.id, location)
            toast({
              title: "Location Updated",
              description: "Current GPS location has been recorded.",
            })
            await loadData()
          }
        } catch (error) {
          console.error("Failed to update location:", error)
          toast({
            title: "Error",
            description: toErrorMessage(error, "Failed to update location."),
            variant: "destructive",
          })
        } finally {
          setGettingLocation(false)
        }
      },
      () => {
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

  const handleUpdateLocationManual = async () => {
    if (!shipment) return

    const lat = Number(locationData.lat)
    const lng = Number(locationData.lng)
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast({
        title: "Invalid Coordinates",
        description: "Latitude and longitude are required for manual updates.",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)
    try {
      const location: Location = {
        city: locationData.city,
        address: locationData.address,
        country: locationData.country,
        postalCode: locationData.postalCode,
        lat,
        lng,
      }

      await api.updateShipmentLocation(shipment.id, location)
      toast({
        title: "Location Updated",
        description: locationData.city ? `Current location: ${locationData.city}` : "Manual location saved.",
      })

      setShowLocationDialog(false)
      setLocationData({ city: "", address: "", country: "", postalCode: "", lat: "", lng: "" })
      await loadData()
    } catch (error) {
      console.error("Failed to update location:", error)
      toast({
        title: "Error",
        description: toErrorMessage(error, "Failed to update location."),
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleFillMilestoneWithGps = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      })
      return
    }

    setGettingMilestoneGps(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMilestoneData((prev) => ({
          ...prev,
          lat: String(position.coords.latitude),
          lng: String(position.coords.longitude),
          locationLabel: prev.locationLabel || "GPS Location",
        }))
        setGettingMilestoneGps(false)
      },
      () => {
        setGettingMilestoneGps(false)
        toast({
          title: "Location Error",
          description: "Unable to get GPS coordinates for milestone.",
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

  const handleAddMilestone = async () => {
    if (!shipment || !milestoneData.note.trim()) return

    const lat = Number(milestoneData.lat)
    const lng = Number(milestoneData.lng)
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast({
        title: "Invalid Coordinates",
        description: "Latitude and longitude are required for a milestone.",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)

    try {
      const locationLabel = milestoneData.locationLabel.trim()

      await api.addShipmentMilestone(shipment.id, {
        type: milestoneData.type,
        note: milestoneData.note.trim(),
        locationLabel: locationLabel || undefined,
        location: {
          address: locationLabel,
          city: locationLabel,
          country: "",
          postalCode: "",
          lat,
          lng,
        },
      })

      toast({
        title: "Milestone Added",
        description: milestoneData.note,
      })

      setShowMilestoneDialog(false)
      setMilestoneData({ type: "checkpoint", note: "", locationLabel: "", lat: "", lng: "" })
      await loadData()
    } catch (error) {
      console.error("Failed to add milestone:", error)
      toast({
        title: "Error",
        description: toErrorMessage(error, "Failed to add milestone."),
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  const handleDeliverShipment = async () => {
    if (!shipment || !selectedFile) {
      toast({
        title: "Confirmation File Required",
        description: "Choose a confirmation file before delivering.",
        variant: "destructive",
      })
      return
    }
    setUploadingProof(true)

    try {
      await api.deliverShipment(shipment.id, selectedFile)
      toast({
        title: "Shipment Delivered",
        description: "Proof of delivery uploaded and shipment marked delivered.",
      })
      setSelectedFile(null)
      setShowDeliverPanel(false)
      await loadData()
    } catch (error) {
      console.error("Failed to deliver shipment:", error)
      toast({
        title: "Error",
        description: toErrorMessage(error, "Failed to deliver shipment. Please try again."),
        variant: "destructive",
      })
    } finally {
      setUploadingProof(false)
    }
  }

  if (loading || !shipment) {
    return <SectionLoader label="Loading shipment..." />
  }

  const canStart = shipment.status === "assigned" && !shipment.startedAt
  const canUpdateLocation = shipment.status === "in-transit" && !!shipment.startedAt
  const canDeliver = shipment.status === "in-transit" && !!shipment.startedAt
  const isDelivered = shipment.status === "delivered"

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
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

      <Card className="panel p-6 space-y-4">
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
              <p className="mt-1">{shipment.cargo.volume} m3</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="panel p-6 space-y-4">
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
            <div className="bg-muted/50 p-3 rounded-lg">
              <Label className="text-muted-foreground">Current Location</Label>
              <p className="mt-1 font-medium">{shipment.currentLocation.city || "Coordinate update"}</p>
              <p className="text-xs text-muted-foreground">
                {shipment.currentLocation.address || `${shipment.currentLocation.lat.toFixed(6)}, ${shipment.currentLocation.lng.toFixed(6)}`}
              </p>
            </div>
          )}

          <div>
            <Label className="text-muted-foreground">Destination</Label>
            <p className="mt-1 font-medium">{shipment.destination.address}</p>
            <p className="text-sm text-muted-foreground">
              {shipment.destination.city}, {shipment.destination.postalCode}
            </p>
          </div>
        </div>
      </Card>

      {!isDelivered && (
        <div className="space-y-3">
          {canStart && (
            <Button className="w-full h-14 text-lg" onClick={handleStartJourney} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5" />}
              {actionLoading ? "Starting..." : "Start Transit"}
            </Button>
          )}

          {canUpdateLocation && (
            <>
              <Button className="w-full h-14 text-lg" onClick={updateLocationWithGps} disabled={gettingLocation}>
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
                Update Location (Manual GPS)
              </Button>

              <Button
                variant="outline"
                className="w-full h-14 text-lg bg-transparent"
                onClick={() => setShowMilestoneDialog(true)}
              >
                <Flag className="mr-2 h-5 w-5" />
                Add Milestone
              </Button>

              {!showDeliverPanel && (
                <Button className="w-full h-14 text-lg" onClick={() => setShowDeliverPanel(true)}>
                  <Truck className="mr-2 h-5 w-5" />
                  Deliver Shipment
                </Button>
              )}
            </>
          )}

          {canDeliver && showDeliverPanel && (
            <Card className="panel p-4 space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Delivery Confirmation</p>
                <p className="text-xs text-muted-foreground">
                  Upload proof of delivery and confirm completion.
                </p>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileSelect} />

              <Button variant="outline" className="w-full bg-transparent" onClick={() => fileInputRef.current?.click()}>
                Choose Confirmation File
              </Button>

              {selectedFile ? (
                <div className="flex items-center justify-between rounded border p-2">
                  <span className="text-sm truncate max-w-[220px]">{selectedFile.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                    Remove
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No file selected</p>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowDeliverPanel(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleDeliverShipment} disabled={uploadingProof || !selectedFile}>
                  {uploadingProof && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {uploadingProof ? "Delivering..." : "Confirm Delivery"}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {isDelivered && (
        <Card className="panel p-6 flex flex-col items-center text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Delivery Complete</h3>
          <p className="text-sm text-muted-foreground">This shipment has been successfully delivered.</p>
        </Card>
      )}

      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent className="panel">
          <DialogHeader>
            <DialogTitle>Update Location</DialogTitle>
            <DialogDescription>Enter location label plus GPS coordinates.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>City or Place Name</Label>
              <Input
                value={locationData.city}
                onChange={(e) => setLocationData({ ...locationData, city: e.target.value })}
                placeholder="e.g. Munich"
              />
            </div>
            <div>
              <Label>Address / Landmark</Label>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={locationData.lat}
                  onChange={(e) => setLocationData({ ...locationData, lat: e.target.value })}
                  placeholder="48.1351"
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={locationData.lng}
                  onChange={(e) => setLocationData({ ...locationData, lng: e.target.value })}
                  placeholder="11.5820"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLocationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLocationManual} disabled={actionLoading || !locationData.lat || !locationData.lng}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
        <DialogContent className="panel">
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
            <DialogDescription>Record an important event with exact coordinates.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Milestone Type</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={milestoneData.type}
                onChange={(e) => setMilestoneData({ ...milestoneData, type: e.target.value as Milestone["type"] })}
              >
                <option value="checkpoint">Checkpoint</option>
                <option value="delay">Delay</option>
                <option value="rest">Rest</option>
                <option value="refuel">Refuel</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <Label>Milestone Note</Label>
              <Textarea
                value={milestoneData.note}
                onChange={(e) => setMilestoneData({ ...milestoneData, note: e.target.value })}
                placeholder="Describe what happened..."
                rows={3}
              />
            </div>
            <div>
              <Label>Location Label (optional)</Label>
              <Input
                value={milestoneData.locationLabel}
                onChange={(e) => setMilestoneData({ ...milestoneData, locationLabel: e.target.value })}
                placeholder="e.g. Border Checkpoint A3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={milestoneData.lat}
                  onChange={(e) => setMilestoneData({ ...milestoneData, lat: e.target.value })}
                  placeholder="48.1351"
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={milestoneData.lng}
                  onChange={(e) => setMilestoneData({ ...milestoneData, lng: e.target.value })}
                  placeholder="11.5820"
                />
              </div>
            </div>
            <Button variant="outline" className="w-full bg-transparent" onClick={handleFillMilestoneWithGps} disabled={gettingMilestoneGps}>
              {gettingMilestoneGps ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting GPS...
                </>
              ) : (
                "Use Current GPS"
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMilestoneDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMilestone} disabled={actionLoading || !milestoneData.note.trim() || !milestoneData.lat || !milestoneData.lng}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
