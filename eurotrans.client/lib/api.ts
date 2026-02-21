import type {
  Driver,
  Truck,
  Shipment,
  Activity,
  LiveMapPin,
  ShipmentStatus,
  Location,
  Milestone,
  CurrentUserContext,
  UserRole,
} from "./types"

const API_BASE_URL = "/api/backend"

type ApiErrorPayload = {
  type?: string
  title?: string
  detail?: string
  status?: number
  traceId?: string
  message?: string
  errors?: Record<string, string[]>
  [key: string]: unknown
}

type ShipmentApiStatus = string
type DriverApiStatus = string
type TruckApiStatus = string
type ActivityApiType = string
type MilestoneApiType = string

type CurrentUserContextApi = {
  employeeId: string
  name: string
  email: string
  role: string
  driverProfileComplete: boolean
  phone?: string | null
  licenseNumber?: string | null
}

type ShipmentSummaryApi = {
  id: string
  trackingId: string
  status: ShipmentApiStatus
  driverName?: string | null
  origin?: string
  destination?: string
  updatedAtUtc?: string | null
}

type ShipmentDetailApi = {
  id: string
  trackingId: string
  status: ShipmentApiStatus
  cargo: {
    description: string
    weight: number
    volume: number
  }
  origin: {
    addressLine: string
    city: string
    country: string
    postalCode: string
  }
  destination: {
    addressLine: string
    city: string
    country: string
    postalCode: string
  }
  createdAtUtc: string
  driver?: {
    id: string
    name: string
    phone?: string | null
  } | null
  truck?: {
    id: string
    plateNumber: string
    model: string
  } | null
  activities: Array<{
    id: string
    description: string
    type: ActivityApiType
    timestampUtc: string
    employeeId: string
    employeeName: string
  }>
  milestones: Array<{
    id: string
    type: MilestoneApiType
    latitude: number
    longitude: number
    note: string
    locationLabel?: string | null
    timestampUtc: string
    employeeName: string
  }>
  updatedAtUtc?: string | null
  startedAtUtc?: string | null
  deliveredAtUtc?: string | null
  estimatedDeliveryDateUtc?: string | null
  proofOfDeliveryUrl?: string | null
  driverId?: string | null
  truckId?: string | null
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData
  const headers = new Headers(init?.headers)
  if (!isFormData && init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  })

  if (!response.ok) {
    const rawBody = await response.text()
    let parsedBody: ApiErrorPayload | null = null

    if (rawBody) {
      try {
        parsedBody = JSON.parse(rawBody) as ApiErrorPayload
      } catch {
        parsedBody = null
      }
    }

    const details: string[] = []

    if (parsedBody?.title) details.push(parsedBody.title)
    if (parsedBody?.detail) details.push(parsedBody.detail)
    if (parsedBody?.message) details.push(parsedBody.message)

    if (parsedBody?.errors) {
      const validationDetails = Object.entries(parsedBody.errors).map(([key, values]) => `${key}: ${values.join(", ")}`)
      details.push(...validationDetails)
    }

    let bodyDump = rawBody
    if (!bodyDump && parsedBody) {
      bodyDump = JSON.stringify(parsedBody)
    }

    const message = [
      `HTTP ${response.status} ${response.statusText} on ${path}`,
      details.length > 0 ? details.join(" | ") : undefined,
      bodyDump ? `Response Body: ${bodyDump}` : undefined,
    ]
      .filter(Boolean)
      .join("\n")

    throw new Error(message)
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T
  }

  const responseText = await response.text()
  if (!responseText) {
    return undefined as T
  }

  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return JSON.parse(responseText) as T
  }

  return responseText as T
}

function mapShipmentStatus(status: ShipmentApiStatus): ShipmentStatus {
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

function mapDriverStatus(status: DriverApiStatus): Driver["status"] {
  const normalized = String(status).toLowerCase()
  if (normalized === "onduty" || normalized === "on-duty") return "on-duty"
  if (normalized === "offduty" || normalized === "off-duty") return "off-duty"
  return "available"
}

function toDriverApiStatus(status: Driver["status"]): DriverApiStatus {
  if (status === "on-duty") return "OnDuty"
  if (status === "off-duty") return "OffDuty"
  return "Available"
}

function mapTruckStatus(status: TruckApiStatus): Truck["status"] {
  const normalized = String(status).toLowerCase()
  if (normalized === "inuse" || normalized === "in-use") return "in-use"
  if (normalized === "maintenance") return "maintenance"
  return "available"
}

function toTruckApiStatus(status: Truck["status"]): TruckApiStatus {
  if (status === "in-use") return "InUse"
  if (status === "maintenance") return "Maintenance"
  return "Available"
}

function mapActivityType(type: ActivityApiType): Activity["type"] {
  const normalized = String(type).toLowerCase()
  if (normalized === "created") return "created"
  if (normalized === "assigned") return "assigned"
  if (normalized === "started") return "started"
  if (normalized === "delivered") return "delivered"
  if (normalized === "cancelled" || normalized === "canceled") return "cancelled"
  if (normalized === "milestoneadded") return "milestone"
  return "updated"
}

function mapMilestoneType(type: MilestoneApiType): Milestone["type"] {
  const normalized = String(type).toLowerCase()
  if (normalized === "locationupdate" || normalized === "location-update") return "location-update"
  if (normalized === "delay") return "delay"
  if (normalized === "rest") return "rest"
  if (normalized === "refuel") return "refuel"
  if (normalized === "custom") return "custom"
  return "checkpoint"
}

function toMilestoneApiType(type: Milestone["type"]): MilestoneApiType {
  switch (type) {
    case "location-update":
      return "LocationUpdate"
    case "delay":
      return "Delay"
    case "rest":
      return "Rest"
    case "refuel":
      return "Refuel"
    case "custom":
      return "Custom"
    default:
      return "Checkpoint"
  }
}

function mapUserRole(role: string): UserRole {
  const normalized = String(role).toLowerCase()
  if (normalized === "manager") return "manager"
  if (normalized === "driver") return "driver"
  return "guest"
}

function parseRouteLabel(label?: string): Pick<Location, "city" | "country"> {
  if (!label) return { city: "", country: "" }
  const [city = "", country = ""] = label.split(",").map((x) => x.trim())
  return { city, country }
}

function mapShipmentSummary(item: ShipmentSummaryApi): Shipment {
  const origin = parseRouteLabel(item.origin)
  const destination = parseRouteLabel(item.destination)
  const updatedAt = item.updatedAtUtc ?? new Date().toISOString()

  return {
    id: item.id,
    trackingId: item.trackingId,
    status: mapShipmentStatus(item.status),
    cargo: {
      description: "N/A",
      weight: 0,
      volume: 0,
    },
    origin: {
      address: "",
      city: origin.city,
      country: origin.country,
      postalCode: "",
      lat: 0,
      lng: 0,
    },
    destination: {
      address: "",
      city: destination.city,
      country: destination.country,
      postalCode: "",
      lat: 0,
      lng: 0,
    },
    driverName: item.driverName ?? undefined,
    createdAt: updatedAt,
    updatedAt,
  }
}

function getFirstActivityTimestamp(
  activities: ShipmentDetailApi["activities"],
  type: ActivityApiType,
): string | undefined {
  const match = activities.find((a) => String(a.type).toLowerCase() === String(type).toLowerCase())
  return match?.timestampUtc
}

function mapShipmentDetail(data: ShipmentDetailApi): Shipment {
  const milestones: Milestone[] = (data.milestones ?? []).map((m) => {
    const label = (m.locationLabel ?? "").trim()

    return {
      id: m.id,
      timestamp: m.timestampUtc,
      note: m.note,
      type: mapMilestoneType(m.type),
      locationLabel: label || undefined,
      location: {
        address: label,
        city: label,
        country: "",
        postalCode: "",
        lat: m.latitude,
        lng: m.longitude,
      },
    }
  })

  const lastLocationMilestone = [...milestones].reverse().find((m) => m.type === "location-update")
  const lastMilestone = milestones[milestones.length - 1]
  const currentLocationMilestone = lastLocationMilestone ?? lastMilestone
  const updatedAt =
    data.updatedAtUtc ??
    data.activities?.slice().sort((a, b) => new Date(b.timestampUtc).getTime() - new Date(a.timestampUtc).getTime())[0]
      ?.timestampUtc ??
    data.createdAtUtc

  return {
    id: data.id,
    trackingId: data.trackingId,
    status: mapShipmentStatus(data.status),
    cargo: {
      description: data.cargo.description,
      weight: data.cargo.weight,
      volume: data.cargo.volume,
    },
    origin: {
      address: data.origin.addressLine,
      city: data.origin.city,
      country: data.origin.country,
      postalCode: data.origin.postalCode,
      lat: 0,
      lng: 0,
    },
    destination: {
      address: data.destination.addressLine,
      city: data.destination.city,
      country: data.destination.country,
      postalCode: data.destination.postalCode,
      lat: 0,
      lng: 0,
    },
    driverId: data.driver?.id ?? data.driverId ?? undefined,
    driverName: data.driver?.name ?? undefined,
    truckId: data.truck?.id ?? data.truckId ?? undefined,
    truckPlateNumber: data.truck?.plateNumber ?? undefined,
    truckModel: data.truck?.model ?? undefined,
    createdAt: data.createdAtUtc,
    updatedAt,
    startedAt: data.startedAtUtc ?? getFirstActivityTimestamp(data.activities, "started"),
    deliveredAt: data.deliveredAtUtc ?? getFirstActivityTimestamp(data.activities, "delivered"),
    estimatedDeliveryDate: data.estimatedDeliveryDateUtc ?? undefined,
    proofOfDeliveryUrl: data.proofOfDeliveryUrl ?? undefined,
    currentLocation: currentLocationMilestone?.location,
    milestones,
  }
}

export const api = {
  async getCurrentUserContext(): Promise<CurrentUserContext> {
    const data = await request<CurrentUserContextApi>("/api/auth/me")

    return {
      employeeId: data.employeeId,
      name: data.name,
      email: data.email,
      role: mapUserRole(data.role),
      driverProfileComplete: data.driverProfileComplete,
      phone: data.phone ?? undefined,
      licenseNumber: data.licenseNumber ?? undefined,
    }
  },

  async updateMyDriverProfile(data: { phone: string; licenseNumber: string }): Promise<void> {
    await request<void>("/api/drivers/me/profile", {
      method: "PUT",
      body: JSON.stringify({
        phone: data.phone,
        licenseNumber: data.licenseNumber,
      }),
    })
  },

  async logout(): Promise<void> {
    window.location.href = "/auth/logout"
  },

  async getShipments(filters?: {
    status?: ShipmentStatus
    driverId?: string
    startDate?: string
    endDate?: string
    search?: string
    page?: number
    pageSize?: number
  }): Promise<Shipment[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.set("status", toShipmentApiStatus(filters.status))
    if (filters?.driverId) params.set("driverId", filters.driverId)
    if (filters?.startDate) params.set("startDate", filters.startDate)
    if (filters?.endDate) params.set("endDate", filters.endDate)
    if (filters?.search) params.set("search", filters.search)
    if (filters?.page) params.set("page", String(filters.page))
    if (filters?.pageSize) params.set("pageSize", String(filters.pageSize))

    const query = params.toString()
    const response = await request<{ items: ShipmentSummaryApi[] }>(`/api/shipments${query ? `?${query}` : ""}`)
    return (response.items ?? []).map(mapShipmentSummary)
  },

  async getShipment(id: string): Promise<Shipment | null> {
    const response = await request<ShipmentDetailApi>(`/api/shipments/${id}`)
    return response ? mapShipmentDetail(response) : null
  },

  async createShipment(data: {
    cargo: {
      description: string
      weight: number
      volume: number
    }
    origin: Location
    destination: Location
    estimatedDeliveryDate?: string
  }): Promise<Shipment> {
    const payload = {
      cargo: {
        description: data.cargo.description,
        weight: data.cargo.weight,
        volume: data.cargo.volume,
      },
      origin: {
        addressLine: data.origin.address,
        city: data.origin.city,
        country: data.origin.country,
        postalCode: data.origin.postalCode,
      },
      destination: {
        addressLine: data.destination.address,
        city: data.destination.city,
        country: data.destination.country,
        postalCode: data.destination.postalCode,
      },
      estimatedDeliveryDate: data.estimatedDeliveryDate,
    }

    const created = await request<{ id: string }>("/api/shipments", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    const shipment = await this.getShipment(created.id)
    if (!shipment) throw new Error("Shipment created but not found")
    return shipment
  },

  async deleteShipment(id: string): Promise<void> {
    await request<void>(`/api/shipments/${id}/cancel`, { method: "POST" })
  },

  async assignShipment(id: string, driverId: string, truckId: string): Promise<Shipment> {
    await request<void>(`/api/shipments/${id}/assign`, {
      method: "POST",
      body: JSON.stringify({ driverId, truckId }),
    })
    const shipment = await this.getShipment(id)
    if (!shipment) throw new Error("Shipment not found after assign")
    return shipment
  },

  async startShipment(id: string): Promise<Shipment> {
    await request<void>(`/api/shipments/${id}/start`, { method: "POST" })
    const shipment = await this.getShipment(id)
    if (!shipment) throw new Error("Shipment not found after start")
    return shipment
  },

  async deliverShipment(id: string, proofOfDeliveryFile: File | string): Promise<Shipment> {
    if (typeof proofOfDeliveryFile === "string") {
      throw new Error("Deliver shipment requires a File upload.")
    }

    const formData = new FormData()
    formData.append("file", proofOfDeliveryFile)

    await request(`/api/shipments/${id}/deliver`, {
      method: "POST",
      body: formData,
    })

    const shipment = await this.getShipment(id)
    if (!shipment) throw new Error("Shipment not found after delivery")
    return shipment
  },

  async getShipmentActivities(shipmentId: string): Promise<Activity[]> {
    const activities = await request<
      Array<{
        id: string
        employeeId: string
        type: ActivityApiType
        description: string
        timestampUtc: string
        employeeName?: string
      }>
    >(`/api/shipments/${shipmentId}/activities`)

    return activities.map((a) => ({
      id: a.id,
      shipmentId,
      type: mapActivityType(a.type),
      description: a.description,
      timestamp: a.timestampUtc,
      userId: a.employeeId,
      userName: a.employeeName ?? "Unknown",
    }))
  },

  async updateShipmentLocation(id: string, location: Location): Promise<Shipment> {
    const locationLabel = [location.city, location.address].filter(Boolean).join(", ").trim()

    await request<void>(`/api/shipments/${id}/milestones`, {
      method: "POST",
      body: JSON.stringify({
        type: "LocationUpdate",
        latitude: location.lat,
        longitude: location.lng,
        locationLabel: locationLabel || null,
        note: "Current location updated",
      }),
    })

    const shipment = await this.getShipment(id)
    if (!shipment) throw new Error("Shipment not found after location update")
    return shipment
  },

  async addShipmentMilestone(id: string, milestone: Omit<Milestone, "id" | "timestamp">): Promise<Shipment> {
    const locationLabel =
      milestone.locationLabel?.trim() ||
      [milestone.location.city, milestone.location.address].filter(Boolean).join(", ").trim()

    await request<void>(`/api/shipments/${id}/milestones`, {
      method: "POST",
      body: JSON.stringify({
        type: toMilestoneApiType(milestone.type),
        latitude: milestone.location.lat,
        longitude: milestone.location.lng,
        note: milestone.note,
        locationLabel: locationLabel || null,
      }),
    })

    const shipment = await this.getShipment(id)
    if (!shipment) throw new Error("Shipment not found after milestone")
    return shipment
  },

  async getDrivers(): Promise<Driver[]> {
    const drivers = await request<
      Array<{
        employeeId: string
        name: string
        email: string
        phone?: string | null
        licenseNumber?: string | null
        status: DriverApiStatus
      }>
    >("/api/drivers")

    return drivers.map((d) => ({
      id: d.employeeId,
      name: d.name,
      email: d.email,
      phone: d.phone ?? undefined,
      licenseNumber: d.licenseNumber ?? undefined,
      status: mapDriverStatus(d.status),
    }))
  },

  async getDriver(id: string): Promise<Driver | null> {
    const d = await request<{
      employeeId: string
      name: string
      email: string
      phone?: string | null
      licenseNumber?: string | null
      status: DriverApiStatus
    }>(`/api/drivers/${id}`)

    if (!d) return null

    return {
      id: d.employeeId,
      name: d.name,
      email: d.email,
      phone: d.phone ?? undefined,
      licenseNumber: d.licenseNumber ?? undefined,
      status: mapDriverStatus(d.status),
    }
  },

  async updateDriverStatus(
    driverId: string,
    newStatus: "available" | "on-duty" | "off-duty",
  ): Promise<{ success: boolean; error?: string; driver?: Driver }> {
    try {
      await request<void>(`/api/drivers/${driverId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: toDriverApiStatus(newStatus) }),
      })
      const driver = await this.getDriver(driverId)
      return { success: true, driver: driver ?? undefined }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  },

  async getTrucks(): Promise<Truck[]> {
    const trucks = await request<
      Array<{
        id: string
        plateNumber: string
        model: string
        capacity: number
        status: TruckApiStatus
      }>
    >("/api/trucks")

    return trucks.map((t) => ({
      id: t.id,
      plateNumber: t.plateNumber,
      model: t.model,
      capacity: t.capacity,
      status: mapTruckStatus(t.status),
    }))
  },

  async getTruck(id: string): Promise<Truck | null> {
    const truck = await request<{
      id: string
      plateNumber: string
      model: string
      capacity: number
      status: TruckApiStatus
    }>(`/api/trucks/${id}`)

    if (!truck) return null

    return {
      id: truck.id,
      plateNumber: truck.plateNumber,
      model: truck.model,
      capacity: truck.capacity,
      status: mapTruckStatus(truck.status),
    }
  },

  async createTruck(data: Omit<Truck, "id">): Promise<Truck> {
    const response = await request<{ id: string }>("/api/trucks", {
      method: "POST",
      body: JSON.stringify({
        plateNumber: data.plateNumber,
        model: data.model,
        capacity: data.capacity,
        status: toTruckApiStatus(data.status),
      }),
    })

    const truck = await this.getTruck(response.id)
    if (!truck) throw new Error("Truck created but not found")
    return truck
  },

  async updateTruck(id: string, data: Partial<Truck>): Promise<{ success: boolean; error?: string; truck?: Truck }> {
    try {
      if (!data.status) {
        return { success: false, error: "Only status updates are supported by backend API." }
      }

      await request<void>(`/api/trucks/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: toTruckApiStatus(data.status) }),
      })

      const truck = await this.getTruck(id)
      return { success: true, truck: truck ?? undefined }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  },

  async deleteTruck(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await request<void>(`/api/trucks/${id}`, { method: "DELETE" })
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  },

  async getLiveMapPins(): Promise<LiveMapPin[]> {
    const shipments = await this.getShipments({ status: "in-transit" })

    return shipments.map((shipment) => {
      const position = shipment.currentLocation ?? shipment.origin
      return {
        id: shipment.id,
        shipmentId: shipment.id,
        trackingId: shipment.trackingId,
        driverName: shipment.driverName ?? "Unknown",
        cargo: shipment.cargo.description || "Shipment cargo",
        status: shipment.status,
        position: {
          lat: position.lat ?? 0,
          lng: position.lng ?? 0,
        },
        lastUpdate: shipment.updatedAt,
      }
    })
  },

  async getAnalytics() {
    const [shipments, drivers] = await Promise.all([this.getShipments(), this.getDrivers()])
    const activeShipmentStatuses: ShipmentStatus[] = ["assigned", "in-transit"]

    return {
      totalShipments: shipments.length,
      activeShipments: shipments.filter((s) => activeShipmentStatuses.includes(s.status)).length,
      deliveredShipments: shipments.filter((s) => s.status === "delivered").length,
      avgDeliveryTime: "N/A",
      activeDrivers: drivers.filter((d) => d.status === "on-duty").length,
      availableDrivers: drivers.filter((d) => d.status === "available").length,
    }
  },

  async uploadProofOfDelivery(file: File): Promise<File> {
    void file
    throw new Error("Use deliverShipment(shipmentId, file) to upload proof of delivery.")
  },
}
