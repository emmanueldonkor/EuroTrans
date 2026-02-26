"use client"

import { useEffect, useRef, useState } from "react"
import { api } from "@/lib/api"

const DEFAULT_HEARTBEAT_INTERVAL_MS = 20000
const DEFAULT_MIN_DISTANCE_METERS = 25

type TrackingPosition = {
  latitude: number
  longitude: number
}

type UseShipmentTrackingOptions = {
  shipmentId?: string
  enabled: boolean
  heartbeatIntervalMs?: number
  minDistanceMeters?: number
  locationLabel?: string
  onError?: (error: Error) => void
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180
}

function distanceInMeters(a: TrackingPosition, b: TrackingPosition): number {
  const earthRadius = 6371000
  const dLat = toRadians(b.latitude - a.latitude)
  const dLon = toRadians(b.longitude - a.longitude)
  const lat1 = toRadians(a.latitude)
  const lat2 = toRadians(b.latitude)

  const sinLat = Math.sin(dLat / 2)
  const sinLon = Math.sin(dLon / 2)
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon
  return 2 * earthRadius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function geolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location access denied. Enable location permission to keep shipment tracking live."
    case error.POSITION_UNAVAILABLE:
      return "Location is currently unavailable. Please check your GPS/network signal."
    case error.TIMEOUT:
      return "Location request timed out. Please try again."
    default:
      return "Unable to read current location."
  }
}

export function useShipmentTracking({
  shipmentId,
  enabled,
  heartbeatIntervalMs = DEFAULT_HEARTBEAT_INTERVAL_MS,
  minDistanceMeters = DEFAULT_MIN_DISTANCE_METERS,
  locationLabel,
  onError,
}: UseShipmentTrackingOptions) {
  const [isTracking, setIsTracking] = useState(false)
  const [lastSentAt, setLastSentAt] = useState<string | null>(null)
  const [lastPosition, setLastPosition] = useState<TrackingPosition | null>(null)
  const [error, setError] = useState<string | null>(null)

  const watchIdRef = useRef<number | null>(null)
  const inFlightRef = useRef(false)
  const lastSentPositionRef = useRef<TrackingPosition | null>(null)
  const lastSentAtMsRef = useRef<number>(0)
  const onErrorRef = useRef<typeof onError>(onError)

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    if (!enabled || !shipmentId) {
      if (watchIdRef.current !== null && typeof navigator !== "undefined") {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }

      watchIdRef.current = null
      inFlightRef.current = false
      lastSentPositionRef.current = null
      lastSentAtMsRef.current = 0
      setIsTracking(false)
      return
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const message = "Geolocation is not supported in this browser."
      setError(message)
      setIsTracking(false)
      onErrorRef.current?.(new Error(message))
      return
    }

    setIsTracking(true)
    setError(null)

    const sendHeartbeat = async (position: TrackingPosition) => {
      if (!shipmentId || inFlightRef.current) return

      inFlightRef.current = true
      try {
        await api.sendTrackingHeartbeat(shipmentId, {
          latitude: position.latitude,
          longitude: position.longitude,
          locationLabel,
        })

        lastSentPositionRef.current = position
        lastSentAtMsRef.current = Date.now()
        setLastPosition(position)
        setLastSentAt(new Date().toISOString())
        setError(null)
      } catch (sendError) {
        const errorObject = sendError instanceof Error ? sendError : new Error("Failed to send tracking heartbeat.")
        setError(errorObject.message)
        onErrorRef.current?.(errorObject)
      } finally {
        inFlightRef.current = false
      }
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (geoPosition) => {
        const position: TrackingPosition = {
          latitude: geoPosition.coords.latitude,
          longitude: geoPosition.coords.longitude,
        }

        const elapsedMs = Date.now() - lastSentAtMsRef.current
        const lastSentPosition = lastSentPositionRef.current
        const movedMeters = lastSentPosition ? distanceInMeters(lastSentPosition, position) : Number.POSITIVE_INFINITY
        const shouldSend = elapsedMs >= heartbeatIntervalMs || movedMeters >= minDistanceMeters

        if (shouldSend) {
          void sendHeartbeat(position)
        }
      },
      (geoError) => {
        const message = geolocationErrorMessage(geoError)
        setError(message)
        onErrorRef.current?.(new Error(message))
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }

      watchIdRef.current = null
      inFlightRef.current = false
      setIsTracking(false)
    }
  }, [enabled, shipmentId, heartbeatIntervalMs, minDistanceMeters, locationLabel])

  return {
    isSupported: typeof navigator !== "undefined" && !!navigator.geolocation,
    isTracking,
    lastPosition,
    lastSentAt,
    error,
  }
}
