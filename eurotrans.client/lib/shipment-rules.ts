import type { TranslationKey } from "./i18n"
import type { ShipmentStatus, Shipment } from "./types"

export interface ShipmentAction {
  label: string
  type: "assign" | "start" | "deliver" | "cancel"
  available: boolean
  reason?: string
}

export const SHIPMENT_STATUS_FLOW: Record<ShipmentStatus, ShipmentStatus[]> = {
  unassigned: ["assigned", "cancelled"],
  assigned: ["in-transit", "cancelled"],
  "in-transit": ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
}

export function canEditShipment(shipment: Shipment): boolean {
  void shipment
  // Backend currently does not expose an edit endpoint.
  return false
}

export function canDeleteShipment(shipment: Shipment): boolean {
  // Maps to backend cancel endpoint.
  return shipment.status !== "delivered" && shipment.status !== "cancelled"
}

export function canPublishShipment(shipment: Shipment): boolean {
  void shipment
  // Backend currently does not expose a publish endpoint.
  return false
}

export function canAssignShipment(shipment: Shipment): boolean {
  return shipment.status === "unassigned"
}

export function canStartShipment(shipment: Shipment): boolean {
  return shipment.status === "assigned" && !!shipment.driverId && !!shipment.truckId
}

export function canDeliverShipment(shipment: Shipment): boolean {
  return shipment.status === "in-transit" && !!shipment.startedAt
}

export function getAvailableActions(shipment: Shipment, userRole: "manager" | "driver"): ShipmentAction[] {
  if (userRole === "manager") {
    return [
      {
        label: "Assign Driver & Truck",
        type: "assign",
        available: canAssignShipment(shipment),
        reason: !canAssignShipment(shipment) ? "Shipment must be unassigned before assignment." : undefined,
      },
      {
        label: "Cancel Shipment",
        type: "cancel",
        available: canDeleteShipment(shipment),
        reason: !canDeleteShipment(shipment) ? "Delivered or cancelled shipments cannot be cancelled." : undefined,
      },
    ]
  }

  return [
    {
      label: "Start Journey",
      type: "start",
      available: canStartShipment(shipment),
      reason: !canStartShipment(shipment) ? "Shipment must be assigned to you before start." : undefined,
    },
    {
      label: "Mark Delivered",
      type: "deliver",
      available: canDeliverShipment(shipment),
      reason: !canDeliverShipment(shipment) ? "Shipment must be in transit before delivery." : undefined,
    },
  ]
}

export function getStatusBadgeColor(status: ShipmentStatus): string {
  switch (status) {
    case "unassigned":
      return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-400/30"
    case "assigned":
      return "bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-400/30"
    case "in-transit":
      return "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-400/30"
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/30"
    case "cancelled":
      return "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-400/30"
    default:
      return "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-400/30"
  }
}

const SHIPMENT_STATUS_KEYS: Record<ShipmentStatus, TranslationKey> = {
  unassigned: "status.unassigned",
  assigned: "shipments.status.assigned",
  "in-transit": "status.inTransit",
  delivered: "status.delivered",
  cancelled: "shipments.status.cancelled",
}

export function getStatusLabel(status: ShipmentStatus, translate?: (key: TranslationKey) => string): string {
  const translationKey = SHIPMENT_STATUS_KEYS[status]
  if (translationKey && translate) {
    return translate(translationKey)
  }

  switch (status) {
    case "unassigned":
      return "Unassigned"
    case "assigned":
      return "Assigned"
    case "in-transit":
      return "In Transit"
    case "delivered":
      return "Delivered"
    case "cancelled":
      return "Cancelled"
    default:
      return (status as string).replace("-", " ").replace(/\b\w/g, (letter: string) => letter.toUpperCase())
  }
}

export function validateShipmentData(data: {
  cargo: { description: string; weight: number; volume: number }
  origin: {
    address?: string
    city?: string
    country?: string
    postalCode?: string
  }
  destination: {
    address?: string
    city?: string
    country?: string
    postalCode?: string
  }
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.cargo.description?.trim()) {
    errors.push("Cargo description is required")
  }
  if (!data.cargo.weight || data.cargo.weight <= 0) {
    errors.push("Valid cargo weight is required")
  }
  if (!data.cargo.volume || data.cargo.volume <= 0) {
    errors.push("Valid cargo volume is required")
  }
  if (!data.origin.address?.trim()) {
    errors.push("Origin address is required")
  }
  if (!data.origin.city?.trim()) {
    errors.push("Origin city is required")
  }
  if (!data.origin.country?.trim()) {
    errors.push("Origin country is required")
  }
  if (!data.origin.postalCode?.trim()) {
    errors.push("Origin postal code is required")
  }
  if (!data.destination.address?.trim()) {
    errors.push("Destination address is required")
  }
  if (!data.destination.city?.trim()) {
    errors.push("Destination city is required")
  }
  if (!data.destination.country?.trim()) {
    errors.push("Destination country is required")
  }
  if (!data.destination.postalCode?.trim()) {
    errors.push("Destination postal code is required")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
