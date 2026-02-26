"use client"

import { useEffect, useMemo } from "react"
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet"
import type { LiveMapPin } from "@/lib/types"

type LiveMapProps = {
  pins: LiveMapPin[]
  selectedPinId?: string | null
  onSelectPin?: (pin: LiveMapPin) => void
}

const DEFAULT_CENTER: [number, number] = [20, 0]
const DEFAULT_ZOOM = 2

function isValidCoordinate(latitude: number, longitude: number): boolean {
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
}

function FitToPins({ pins }: { pins: LiveMapPin[] }) {
  const map = useMap()

  useEffect(() => {
    if (pins.length === 0) return

    if (pins.length === 1) {
      map.setView([pins[0].position.lat, pins[0].position.lng], 12)
      return
    }

    const bounds = pins.map((pin) => [pin.position.lat, pin.position.lng] as [number, number])
    map.fitBounds(bounds, { padding: [30, 30] })
  }, [map, pins])

  return null
}

function pinColor(pin: LiveMapPin, isSelected: boolean): string {
  if (isSelected) return "#2563eb"
  if (pin.isStale) return "#dc2626"

  switch (pin.status) {
    case "in-transit":
      return "#059669"
    case "assigned":
      return "#d97706"
    case "delivered":
      return "#4b5563"
    default:
      return "#6b7280"
  }
}

export function LiveMap({ pins, selectedPinId, onSelectPin }: LiveMapProps) {
  const validPins = useMemo(
    () => pins.filter((pin) => isValidCoordinate(pin.position.lat, pin.position.lng)),
    [pins],
  )

  return (
    <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="h-full w-full rounded-2xl">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitToPins pins={validPins} />

      {validPins.map((pin) => {
        const isSelected = pin.id === selectedPinId
        const color = pinColor(pin, isSelected)

        return (
          <CircleMarker
            key={pin.id}
            center={[pin.position.lat, pin.position.lng]}
            radius={isSelected ? 10 : 8}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: isSelected ? 3 : 2 }}
            eventHandlers={{
              click: () => onSelectPin?.(pin),
            }}
          >
            <Popup>
              <div className="space-y-1 text-xs">
                <p className="font-semibold">{pin.trackingId}</p>
                <p>Driver: {pin.driverName}</p>
                <p>Status: {pin.status}</p>
                <p>{pin.cargo}</p>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
