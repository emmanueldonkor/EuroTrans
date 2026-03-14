import { auth0 } from "@/lib/auth0"
import type {
  Driver,
  DriverOption,
  Shipment,
  PagedResult,
  ShipmentStatus,
  CurrentUserContext,
  UserRole,
} from "./types"

const BACKEND_BASE_URL = process.env.EUROTRANS_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5002"

// --- API Types ---
interface ApiUserContext {
  employeeId: string
  name: string
  email: string
  role: string
  preferredLanguage: string
  driverProfileComplete: boolean
  phone?: string | null
  licenseNumber?: string | null
}

interface ApiShipment {
  id: string
  trackingId: string
  status: string
  cargoDescription?: string | null
  origin?: string
  destination?: string
  driverName?: string | null
  updatedAtUtc?: string | null
  deliveredAtUtc?: string | null
  proofOfDeliveryUrl?: string | null
}

interface ApiCurrentShipment {
  id: string
  trackingId: string
  status: string
  cargoDescription: string
  cargoWeight: number
  cargoVolume: number
  originAddress: string
  originCity: string
  originCountry: string
  originPostalCode: string
  destinationAddress: string
  destinationCity: string
  destinationCountry: string
  destinationPostalCode: string
}

interface ApiDriverOption {
  employeeId: string
  name: string
  phone?: string | null
  status: string
}

interface ApiPagedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

// --- Helper Functions from api.ts ---

function mapUserRole(role: string): UserRole {
  const normalized = String(role).toLowerCase()
  if (normalized === "manager") return "manager"
  if (normalized === "driver") return "driver"
  return "guest"
}

function mapLocale(value: string): "en" | "de" | "fr" {
  const normalized = String(value).toLowerCase()
  if (normalized === "de") return "de"
  if (normalized === "fr") return "fr"
  return "en"
}

function mapShipmentStatus(status: string): ShipmentStatus {
  const normalized = String(status).toLowerCase()
  if (normalized === "intransit" || normalized === "in-transit") return "in-transit"
  if (normalized === "assigned") return "assigned"
  if (normalized === "delivered") return "delivered"
  if (normalized === "cancelled" || normalized === "canceled") return "cancelled"
  return "unassigned"
}

function toShipmentApiStatus(status: ShipmentStatus): string {
  switch (status) {
    case "unassigned":
      return "Unassigned"
    case "assigned":
      return "Assigned"
    case "in-transit":
      return "InTransit"
    case "delivered":
      return "Delivered"
    case "cancelled":
      return "Cancelled"
    default:
      return "Unassigned"
  }
}

function mapDriverStatus(status: string): Driver["status"] {
  const normalized = String(status).toLowerCase()
  if (normalized === "onduty" || normalized === "on-duty") return "on-duty"
  if (normalized === "offduty" || normalized === "off-duty") return "off-duty"
  return "available"
}

// --- Request Wrapper ---

async function requestServer<T>(path: string): Promise<T> {
  const session = await auth0.getSession()
  const accessToken = session?.tokenSet?.accessToken

  if (!accessToken) {
    throw new Error("Unauthorized: no active session for server request")
  }

  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Server request failed: ${response.status} ${response.statusText} on ${path}`)
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T
  }

  const responseText = await response.text()
  if (!responseText) {
    return undefined as T
  }

  return JSON.parse(responseText) as T
}

// --- API Methods ---

export const apiServer = {
  async getCurrentUserContext(): Promise<CurrentUserContext> {
    const data = await requestServer<ApiUserContext>("/api/auth/me")

    return {
      employeeId: data.employeeId,
      name: data.name,
      email: data.email,
      role: mapUserRole(data.role),
      preferredLanguage: mapLocale(data.preferredLanguage),
      driverProfileComplete: data.driverProfileComplete,
      phone: data.phone ?? undefined,
      licenseNumber: data.licenseNumber ?? undefined,
    }
  },

  async getShipmentsPage(filters?: {
    status?: ShipmentStatus
    driverId?: string
    search?: string
    page?: number
    pageSize?: number
  }): Promise<PagedResult<Shipment>> {
    const params = new URLSearchParams()
    if (filters?.status) params.set("status", toShipmentApiStatus(filters.status))
    if (filters?.driverId) params.set("driverId", filters.driverId)
    if (filters?.search) params.set("search", filters.search)
    if (filters?.page) params.set("page", String(filters.page))
    if (filters?.pageSize) params.set("pageSize", String(filters.pageSize))

    const query = params.toString()
    const response = await requestServer<ApiPagedResponse<ApiShipment>>(`/api/shipments${query ? `?${query}` : ""}`)
    
    return {
      items: (response.items ?? []).map((item: ApiShipment) => {
        const originLabel = item.origin || ""
        const destLabel = item.destination || ""
        const [oCity = "", oCountry = ""] = originLabel.split(",").map((x: string) => x.trim())
        const [dCity = "", dCountry = ""] = destLabel.split(",").map((x: string) => x.trim())
  
        const updatedAt = item.updatedAtUtc ?? new Date().toISOString()
  
        return {
          id: item.id,
          trackingId: item.trackingId,
          status: mapShipmentStatus(item.status),
          cargo: {
            description: item.cargoDescription ?? "",
            weight: 0,
            volume: 0,
          },
          origin: {
            address: "",
            city: oCity,
            country: oCountry,
            postalCode: "",
            lat: 0,
            lng: 0,
          },
          destination: {
            address: "",
            city: dCity,
            country: dCountry,
            postalCode: "",
            lat: 0,
            lng: 0,
          },
          driverName: item.driverName ?? undefined,
          createdAt: updatedAt,
          updatedAt,
          deliveredAt: item.deliveredAtUtc ?? undefined,
          proofOfDeliveryUrl: item.proofOfDeliveryUrl ?? undefined,
        }
      }),
      totalCount: response.totalCount ?? 0,
      page: response.page ?? 1,
      pageSize: response.pageSize ?? (response.items?.length ?? 0),
    }
  },

  async getCurrentDriverShipment(): Promise<Shipment | null> {
    const item = await requestServer<ApiCurrentShipment | null>("/api/drivers/me/current-shipment")
    if (!item) return null

    const updatedAt = new Date().toISOString()

    return {
      id: item.id,
      trackingId: item.trackingId,
      status: mapShipmentStatus(item.status),
      cargo: {
        description: item.cargoDescription,
        weight: item.cargoWeight,
        volume: item.cargoVolume,
      },
      origin: {
        address: item.originAddress,
        city: item.originCity,
        country: item.originCountry,
        postalCode: item.originPostalCode,
        lat: 0,
        lng: 0,
      },
      destination: {
        address: item.destinationAddress,
        city: item.destinationCity,
        country: item.destinationCountry,
        postalCode: item.destinationPostalCode,
        lat: 0,
        lng: 0,
      },
      createdAt: updatedAt,
      updatedAt,
    }
  },

  async getDriverOptions(): Promise<DriverOption[]> {
    const response = await requestServer<ApiDriverOption[]>("/api/drivers/options")

    return response.map((driver) => ({
      id: driver.employeeId,
      name: driver.name,
      phone: driver.phone ?? undefined,
      status: mapDriverStatus(driver.status),
    }))
  },
}
