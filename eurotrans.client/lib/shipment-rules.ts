// Shipment lifecycle rules and state validation
import type { ShipmentStatus, Shipment } from "./types"

export interface ShipmentAction {
  label: string
  type: "publish" | "assign" | "start" | "deliver" | "edit"
  available: boolean
  reason?: string
}

export const SHIPMENT_STATUS_FLOW: Record<ShipmentStatus, ShipmentStatus[]> = {
  draft: ["unassigned"],
  unassigned: ["in-transit"],
  "in-transit": ["delivered"],
  delivered: [],
}

export function canEditShipment(shipment: Shipment): boolean {
  return shipment.status === "draft"
}

export function canDeleteShipment(shipment: Shipment): boolean {
  // Can delete drafts, unassigned, or in-transit that hasn't been started
  return (
    shipment.status === "draft" ||
    shipment.status === "unassigned" ||
    (shipment.status === "in-transit" && !shipment.startedAt)
  )
}

export function canPublishShipment(shipment: Shipment): boolean {
  return shipment.status === "draft"
}

export function canAssignShipment(shipment: Shipment): boolean {
  return shipment.status === "unassigned" || shipment.status === "draft"
}

export function canStartShipment(shipment: Shipment): boolean {
  return shipment.status === "in-transit" && !!shipment.driverId && !!shipment.truckId && !shipment.startedAt
}

export function canDeliverShipment(shipment: Shipment): boolean {
  return shipment.status === "in-transit" && !!shipment.startedAt
}

export function getAvailableActions(shipment: Shipment, userRole: "manager" | "driver"): ShipmentAction[] {
  if (userRole === "manager") {
    return [
      {
        label: "Publish Draft",
        type: "publish",
        available: canPublishShipment(shipment),
        reason: !canPublishShipment(shipment) ? "Only drafts can be published" : undefined,
      },
      {
        label: "Assign Driver & Truck",
        type: "assign",
        available: canAssignShipment(shipment),
        reason: !canAssignShipment(shipment) ? "Shipment already assigned or in transit" : undefined,
      },
      {
        label: "Edit Shipment",
        type: "edit",
        available: canEditShipment(shipment),
        reason: !canEditShipment(shipment) ? "Only drafts can be edited" : undefined,
      },
    ]
  }

  // Driver actions
  return [
    {
      label: "Start Journey",
      type: "start",
      available: canStartShipment(shipment),
      reason: !canStartShipment(shipment) ? "Shipment not ready to start" : undefined,
    },
    {
      label: "Mark Delivered",
      type: "deliver",
      available: canDeliverShipment(shipment),
      reason: !canDeliverShipment(shipment) ? "Journey must be started first" : undefined,
    },
  ]
}

export function getStatusBadgeColor(status: ShipmentStatus): string {
  switch (status) {
    case "draft":
      return "bg-slate-100 text-slate-600 border border-slate-200"
    case "unassigned":
      return "bg-amber-50 text-amber-700 border border-amber-200"
    case "in-transit":
      return "bg-teal-50 text-teal-700 border border-teal-200"
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200"
    default:
      return "bg-slate-100 text-slate-600 border border-slate-200"
  }
}

export function getStatusLabel(status: ShipmentStatus): string {
  return status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

export function validateShipmentData(data: {
  cargo: { description: string; weight: number; volume: number }
  origin: any
  destination: any
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  console.log("[v0] Validating shipment data:", data)

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

  console.log("[v0] Validation result:", { valid: errors.length === 0, errors })

  return {
    valid: errors.length === 0,
    errors,
  }
}
