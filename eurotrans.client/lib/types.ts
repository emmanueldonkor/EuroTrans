// Core domain types for the EuroTrans fleet management system

export type UserRole = "manager" | "driver" | "guest"

export type ShipmentStatus = "unassigned" | "assigned" | "in-transit" | "delivered" | "cancelled"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface CurrentUserContext {
  employeeId: string
  name: string
  email: string
  role: UserRole
  preferredLanguage: "en" | "de" | "fr"
  driverProfileComplete: boolean
  phone?: string
  licenseNumber?: string
}

export interface Driver {
  id: string
  name: string
  email: string
  phone?: string
  licenseNumber?: string
  status: "available" | "on-duty" | "off-duty"
  currentShipmentId?: string
}

export interface Truck {
  id: string
  plateNumber: string
  model: string
  capacity: number
  status: "available" | "in-use" | "maintenance"
}

export interface Location {
  address: string
  city: string
  country: string
  postalCode: string
  lat: number
  lng: number
}

export interface Shipment {
  id: string
  trackingId: string
  status: ShipmentStatus
  cargo: {
    description: string
    weight: number
    volume: number
  }
  origin: Location
  destination: Location
  driverId?: string
  driverName?: string
  truckId?: string
  truckPlateNumber?: string
  truckModel?: string
  createdAt: string
  updatedAt: string
  startedAt?: string
  deliveredAt?: string
  proofOfDeliveryUrl?: string
  estimatedDeliveryDate?: string
  currentLocation?: Location
  milestones?: Milestone[]
}

export interface Milestone {
  id: string
  timestamp: string
  location: Location
  locationLabel?: string
  note: string
  type: "location-update" | "checkpoint" | "delay" | "rest" | "refuel" | "custom"
}

export interface Activity {
  id: string
  shipmentId: string
  type: "created" | "assigned" | "started" | "delivered" | "cancelled" | "milestone" | "updated"
  description: string
  timestamp: string
  userId: string
  userName: string
}

export interface LiveMapPin {
  id: string
  shipmentId: string
  trackingId: string
  driverName: string
  cargo: string
  status: ShipmentStatus
  position: {
    lat: number
    lng: number
  }
  lastUpdate: string
  isStale: boolean
}
