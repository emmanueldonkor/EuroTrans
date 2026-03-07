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
import { useShipmentTracking } from "@/hooks/use-shipment-tracking"
import { useI18n } from "@/components/providers/i18n-provider"
import { toActionErrorMessage } from "@/lib/utils/error"

export default function DriverShipmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useI18n()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastTrackingErrorRef = useRef<string | null>(null)

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

  const getShipmentStatusText = (status: Shipment["status"]) => {
    switch (status) {
      case "unassigned":
        return t("status.unassigned")
      case "assigned":
        return t("shipments.status.assigned")
      case "in-transit":
        return t("status.inTransit")
      case "delivered":
        return t("status.delivered")
      case "cancelled":
        return t("shipments.status.cancelled")
    }
  }

  const isAutoTrackingEnabled = shipment?.status === "in-transit" && !!shipment?.startedAt

  const tracking = useShipmentTracking({
    shipmentId: shipment?.id,
    enabled: isAutoTrackingEnabled,
    locationLabel: shipment?.trackingId,
    onError: (trackingError) => {
      if (lastTrackingErrorRef.current === trackingError.message) return
      lastTrackingErrorRef.current = trackingError.message
      toast({
        title: t("driver.shipmentDetail.liveTrackingNoticeTitle"),
        description: trackingError.message,
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    if (!tracking.error) {
      lastTrackingErrorRef.current = null
    }
  }, [tracking.error])

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
      toast({
        title: t("driver.shipmentDetail.loadErrorTitle"),
        description: toActionErrorMessage(error, t("driver.shipmentDetail.loadErrorFallback")),
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
        title: t("driver.shipmentDetail.startSuccessTitle"),
        description: t("driver.shipmentDetail.startSuccessDescription"),
      })
      await loadData()
    } catch (error) {
      toast({
        title: t("driver.shipmentDetail.loadErrorTitle"),
        description: toActionErrorMessage(error, t("driver.shipmentDetail.startErrorFallback")),
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const updateLocationWithGps = () => {
    if (!navigator.geolocation) {
      toast({
        title: t("driver.shipmentDetail.geoNotSupportedTitle"),
        description: t("driver.shipmentDetail.geoNotSupportedDescription"),
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
            city: t("driver.shipmentDetail.gpsLocationLabel"),
            address: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
            country: "",
            postalCode: "",
          }

          if (shipment) {
            await api.updateShipmentLocation(shipment.id, location)
            toast({
              title: t("driver.shipmentDetail.locationUpdatedTitle"),
              description: t("driver.shipmentDetail.locationUpdatedDescription"),
            })
            await loadData()
          }
        } catch (error) {
          toast({
            title: t("driver.shipmentDetail.loadErrorTitle"),
            description: toActionErrorMessage(error, t("driver.shipmentDetail.locationUpdateErrorFallback")),
            variant: "destructive",
          })
        } finally {
          setGettingLocation(false)
        }
      },
      () => {
        setGettingLocation(false)
        toast({
          title: t("driver.shipmentDetail.locationErrorTitle"),
          description: t("driver.shipmentDetail.locationErrorDescription"),
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
        title: t("driver.shipmentDetail.invalidCoordinatesTitle"),
        description: t("driver.shipmentDetail.invalidCoordinatesManualDescription"),
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
        title: t("driver.shipmentDetail.locationUpdatedTitle"),
        description: locationData.city
          ? t("driver.shipmentDetail.locationUpdatedManualWithCity").replace("{city}", locationData.city)
          : t("driver.shipmentDetail.locationUpdatedManualDescription"),
      })

      setShowLocationDialog(false)
      setLocationData({ city: "", address: "", country: "", postalCode: "", lat: "", lng: "" })
      await loadData()
    } catch (error) {
      toast({
        title: t("driver.shipmentDetail.loadErrorTitle"),
        description: toActionErrorMessage(error, t("driver.shipmentDetail.locationUpdateErrorFallback")),
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleFillMilestoneWithGps = () => {
    if (!navigator.geolocation) {
      toast({
        title: t("driver.shipmentDetail.geoNotSupportedTitle"),
        description: t("driver.shipmentDetail.geoNotSupportedDescription"),
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
          locationLabel: prev.locationLabel || t("driver.shipmentDetail.gpsLocationLabel"),
        }))
        setGettingMilestoneGps(false)
      },
      () => {
        setGettingMilestoneGps(false)
        toast({
          title: t("driver.shipmentDetail.locationErrorTitle"),
          description: t("driver.shipmentDetail.milestoneGpsErrorDescription"),
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
        title: t("driver.shipmentDetail.invalidCoordinatesTitle"),
        description: t("driver.shipmentDetail.invalidCoordinatesMilestoneDescription"),
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
        title: t("driver.shipmentDetail.milestoneAddedTitle"),
        description: milestoneData.note,
      })

      setShowMilestoneDialog(false)
      setMilestoneData({ type: "checkpoint", note: "", locationLabel: "", lat: "", lng: "" })
      await loadData()
    } catch (error) {
      toast({
        title: t("driver.shipmentDetail.loadErrorTitle"),
        description: toActionErrorMessage(error, t("driver.shipmentDetail.milestoneAddErrorFallback")),
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
        title: t("driver.shipmentDetail.confirmationFileRequiredTitle"),
        description: t("driver.shipmentDetail.confirmationFileRequiredDescription"),
        variant: "destructive",
      })
      return
    }
    setUploadingProof(true)

    try {
      await api.deliverShipment(shipment.id, selectedFile)
      toast({
        title: t("driver.shipmentDetail.deliveredTitle"),
        description: t("driver.shipmentDetail.deliveredDescription"),
      })
      setSelectedFile(null)
      setShowDeliverPanel(false)
      await loadData()
    } catch (error) {
      toast({
        title: t("driver.shipmentDetail.loadErrorTitle"),
        description: toActionErrorMessage(error, t("driver.shipmentDetail.deliverErrorFallback")),
        variant: "destructive",
      })
    } finally {
      setUploadingProof(false)
    }
  }

  if (loading || !shipment) {
    return <SectionLoader label={t("driver.shipmentDetail.loading")} />
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
        <Badge className={getStatusColor(shipment.status)}>{getShipmentStatusText(shipment.status)}</Badge>
      </div>

      <Card className="panel p-6 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Package className="h-5 w-5" />
          {t("driver.shipmentDetail.cargoTitle")}
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-muted-foreground">{t("driver.shipmentDetail.description")}</Label>
            <p className="mt-1">{shipment.cargo.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">{t("driver.shipmentDetail.weight")}</Label>
              <p className="mt-1">{shipment.cargo.weight} kg</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("driver.shipmentDetail.volume")}</Label>
              <p className="mt-1">{shipment.cargo.volume} m3</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="panel p-6 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <MapPin className="h-5 w-5" />
          {t("driver.shipmentDetail.routeTitle")}
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground">{t("driver.shipmentDetail.origin")}</Label>
            <p className="mt-1 font-medium">{shipment.origin.address}</p>
            <p className="text-sm text-muted-foreground">
              {shipment.origin.city}, {shipment.origin.postalCode}
            </p>
          </div>

          {shipment.currentLocation && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <Label className="text-muted-foreground">{t("driver.shipmentDetail.currentLocation")}</Label>
              <p className="mt-1 font-medium">{shipment.currentLocation.city || t("driver.shipmentDetail.currentLocationFallback")}</p>
              <p className="text-xs text-muted-foreground">
                {shipment.currentLocation.address || `${shipment.currentLocation.lat.toFixed(6)}, ${shipment.currentLocation.lng.toFixed(6)}`}
              </p>
            </div>
          )}

          <div>
            <Label className="text-muted-foreground">{t("driver.shipmentDetail.destination")}</Label>
            <p className="mt-1 font-medium">{shipment.destination.address}</p>
            <p className="text-sm text-muted-foreground">
              {shipment.destination.city}, {shipment.destination.postalCode}
            </p>
          </div>
        </div>
      </Card>

      {canUpdateLocation && (
        <Card className="panel p-4 space-y-2">
          <p className="text-sm font-medium">{t("driver.shipmentDetail.autoTrackingTitle")}</p>
          <p className="text-xs text-muted-foreground">
            {tracking.isTracking
              ? t("driver.shipmentDetail.autoTrackingEnabled")
              : t("driver.shipmentDetail.autoTrackingDisabled")}
          </p>
          {tracking.lastSentAt && (
            <p className="text-xs text-muted-foreground">
              {t("driver.shipmentDetail.autoTrackingLastHeartbeat")} {new Date(tracking.lastSentAt).toLocaleString()}
            </p>
          )}
        </Card>
      )}

      {!isDelivered && (
        <div className="space-y-3">
          {canStart && (
            <Button className="w-full h-14 text-lg" onClick={handleStartJourney} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5" />}
              {actionLoading ? t("driver.shipmentDetail.action.starting") : t("driver.shipmentDetail.action.startTransit")}
            </Button>
          )}

          {canUpdateLocation && (
            <>
              <Button className="w-full h-14 text-lg" onClick={updateLocationWithGps} disabled={gettingLocation}>
                {gettingLocation ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("driver.shipmentDetail.action.gettingLocation")}
                  </>
                ) : (
                  <>
                    <Navigation className="mr-2 h-5 w-5" />
                    {t("driver.shipmentDetail.action.updateLocationGps")}
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full h-14 text-lg bg-transparent"
                onClick={() => setShowLocationDialog(true)}
              >
                <MapPin className="mr-2 h-5 w-5" />
                {t("driver.shipmentDetail.action.updateLocationManual")}
              </Button>

              <Button
                variant="outline"
                className="w-full h-14 text-lg bg-transparent"
                onClick={() => setShowMilestoneDialog(true)}
              >
                <Flag className="mr-2 h-5 w-5" />
                {t("driver.shipmentDetail.action.addMilestone")}
              </Button>

              {!showDeliverPanel && (
                <Button className="w-full h-14 text-lg" onClick={() => setShowDeliverPanel(true)}>
                  <Truck className="mr-2 h-5 w-5" />
                  {t("driver.shipmentDetail.action.deliverShipment")}
                </Button>
              )}
            </>
          )}

          {canDeliver && showDeliverPanel && (
            <Card className="panel p-4 space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">{t("driver.shipmentDetail.deliverPanelTitle")}</p>
                <p className="text-xs text-muted-foreground">{t("driver.shipmentDetail.deliverPanelDescription")}</p>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileSelect} />

              <Button variant="outline" className="w-full bg-transparent" onClick={() => fileInputRef.current?.click()}>
                {t("driver.shipmentDetail.chooseConfirmationFile")}
              </Button>

              {selectedFile ? (
                <div className="flex items-center justify-between rounded border p-2">
                  <span className="text-sm truncate max-w-[220px]">{selectedFile.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                    {t("driver.shipmentDetail.removeFile")}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{t("driver.shipmentDetail.noFileSelected")}</p>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowDeliverPanel(false)}>
                  {t("common.cancel")}
                </Button>
                <Button className="flex-1" onClick={handleDeliverShipment} disabled={uploadingProof || !selectedFile}>
                  {uploadingProof && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {uploadingProof ? t("driver.shipmentDetail.action.delivering") : t("driver.shipmentDetail.action.confirmDelivery")}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {isDelivered && (
        <Card className="panel p-6 flex flex-col items-center text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("driver.shipmentDetail.deliveryCompleteTitle")}</h3>
          <p className="text-sm text-muted-foreground">{t("driver.shipmentDetail.deliveryCompleteDescription")}</p>
        </Card>
      )}

      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent className="panel">
          <DialogHeader>
            <DialogTitle>{t("driver.shipmentDetail.updateLocationDialogTitle")}</DialogTitle>
            <DialogDescription>{t("driver.shipmentDetail.updateLocationDialogDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("driver.shipmentDetail.cityOrPlace")}</Label>
              <Input
                value={locationData.city}
                onChange={(e) => setLocationData({ ...locationData, city: e.target.value })}
                placeholder={t("driver.shipmentDetail.placeholder.city")}
              />
            </div>
            <div>
              <Label>{t("driver.shipmentDetail.addressLandmark")}</Label>
              <Input
                value={locationData.address}
                onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                placeholder={t("driver.shipmentDetail.placeholder.address")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("driver.shipmentDetail.country")}</Label>
                <Input
                  value={locationData.country}
                  onChange={(e) => setLocationData({ ...locationData, country: e.target.value })}
                  placeholder={t("driver.shipmentDetail.placeholder.country")}
                />
              </div>
              <div>
                <Label>{t("driver.shipmentDetail.postalCode")}</Label>
                <Input
                  value={locationData.postalCode}
                  onChange={(e) => setLocationData({ ...locationData, postalCode: e.target.value })}
                  placeholder={t("driver.shipmentDetail.placeholder.postalCode")}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("driver.shipmentDetail.latitude")}</Label>
                <Input
                  type="number"
                  step="any"
                  value={locationData.lat}
                  onChange={(e) => setLocationData({ ...locationData, lat: e.target.value })}
                  placeholder={t("driver.shipmentDetail.placeholder.latitude")}
                />
              </div>
              <div>
                <Label>{t("driver.shipmentDetail.longitude")}</Label>
                <Input
                  type="number"
                  step="any"
                  value={locationData.lng}
                  onChange={(e) => setLocationData({ ...locationData, lng: e.target.value })}
                  placeholder={t("driver.shipmentDetail.placeholder.longitude")}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLocationDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleUpdateLocationManual} disabled={actionLoading || !locationData.lat || !locationData.lng}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("driver.shipmentDetail.action.updateLocation")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
        <DialogContent className="panel">
          <DialogHeader>
            <DialogTitle>{t("driver.shipmentDetail.milestoneDialogTitle")}</DialogTitle>
            <DialogDescription>{t("driver.shipmentDetail.milestoneDialogDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("driver.shipmentDetail.milestoneType")}</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={milestoneData.type}
                onChange={(e) => setMilestoneData({ ...milestoneData, type: e.target.value as Milestone["type"] })}
              >
                <option value="checkpoint">{t("driver.shipmentDetail.milestoneType.checkpoint")}</option>
                <option value="delay">{t("driver.shipmentDetail.milestoneType.delay")}</option>
                <option value="rest">{t("driver.shipmentDetail.milestoneType.rest")}</option>
                <option value="refuel">{t("driver.shipmentDetail.milestoneType.refuel")}</option>
                <option value="custom">{t("driver.shipmentDetail.milestoneType.custom")}</option>
              </select>
            </div>
            <div>
              <Label>{t("driver.shipmentDetail.milestoneNote")}</Label>
              <Textarea
                value={milestoneData.note}
                onChange={(e) => setMilestoneData({ ...milestoneData, note: e.target.value })}
                placeholder={t("driver.shipmentDetail.milestoneNotePlaceholder")}
                rows={3}
              />
            </div>
            <div>
              <Label>{t("driver.shipmentDetail.locationLabelOptional")}</Label>
              <Input
                value={milestoneData.locationLabel}
                onChange={(e) => setMilestoneData({ ...milestoneData, locationLabel: e.target.value })}
                placeholder={t("driver.shipmentDetail.locationLabelPlaceholder")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("driver.shipmentDetail.latitude")}</Label>
                <Input
                  type="number"
                  step="any"
                  value={milestoneData.lat}
                  onChange={(e) => setMilestoneData({ ...milestoneData, lat: e.target.value })}
                  placeholder={t("driver.shipmentDetail.placeholder.latitude")}
                />
              </div>
              <div>
                <Label>{t("driver.shipmentDetail.longitude")}</Label>
                <Input
                  type="number"
                  step="any"
                  value={milestoneData.lng}
                  onChange={(e) => setMilestoneData({ ...milestoneData, lng: e.target.value })}
                  placeholder={t("driver.shipmentDetail.placeholder.longitude")}
                />
              </div>
            </div>
            <Button variant="outline" className="w-full bg-transparent" onClick={handleFillMilestoneWithGps} disabled={gettingMilestoneGps}>
              {gettingMilestoneGps ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("driver.shipmentDetail.action.gettingGps")}
                </>
              ) : (
                t("driver.shipmentDetail.action.useCurrentGps")
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMilestoneDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleAddMilestone} disabled={actionLoading || !milestoneData.note.trim() || !milestoneData.lat || !milestoneData.lng}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("driver.shipmentDetail.action.addMilestone")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
