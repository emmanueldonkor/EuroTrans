import type { User, Driver, Truck, Shipment, Activity, LiveMapPin, ShipmentStatus, Location, Milestone } from "./types"

type ShipmentApiStatus = string
type DriverApiStatus = string
type TruckApiStatus = string
type ActivityApiType = string

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5002"

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || `Request failed (${response.status})`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

function mapShipmentStatus(status: ShipmentApiStatus): ShipmentStatus {
  const normalized = String(status).toLowerCase()
  if (normalized === "intransit") return "in-transit"
  if (normalized === "assigned") return "in-transit"
  if (normalized === "draft") return "draft"
  if (normalized === "delivered") return "delivered"
  return "unassigned"
}

function mapDriverStatus(status: DriverApiStatus): Driver["status"] {
  const normalized = String(status).toLowerCase()
  if (normalized === "onduty") return "on-duty"
  if (normalized === "offduty") return "off-duty"
  return "available"
}

function toDriverApiStatus(status: Driver["status"]): DriverApiStatus {
  if (status === "on-duty") return "OnDuty"
  if (status === "off-duty") return "OffDuty"
  return "Available"
}

function mapTruckStatus(status: TruckApiStatus): Truck["status"] {
  const normalized = String(status).toLowerCase()
  if (normalized === "inuse") return "in-use"
  if (normalized === "maintenance") return "maintenance"
  return "available"
}

function toTruckApiStatus(status: Truck["status"]): TruckApiStatus {
  if (status === "in-use") return "InUse"
  if (status === "maintenance") return "Maintenance"
  return "Available"
}

function mapShipmentSummary(item: any): Shipment {
  return {
    id: item.id,
    trackingId: item.trackingId,
    status: mapShipmentStatus(item.status),
    cargo: {
      description: item.cargoDescription,
      weight: 0,
      volume: 0,
    },
    origin: {
      address: "",
      city: item.origin?.city ?? "",
      country: item.origin?.country ?? "",
      postalCode: "",
      lat: 0,
      lng: 0,
    },
    destination: {
      address: "",
      city: item.destination?.city ?? "",
      country: item.destination?.country ?? "",
      postalCode: "",
      lat: 0,
      lng: 0,
    },
    driverId: item.driverId ?? undefined,
    truckId: item.truckId ?? undefined,
    createdAt: item.createdAtUtc,
    updatedAt: item.updatedAtUtc ?? item.createdAtUtc,
    estimatedDeliveryDate: item.estimatedDeliveryDateUtc ?? undefined,
  }
}

function mapShipmentDetail(data: any): Shipment {
  return {
    id: data.id,
    trackingId: data.trackingId,
    status: mapShipmentStatus(data.status),
    cargo: {
      description: data.cargoDescription,
      weight: data.cargoWeight,
      volume: data.cargoVolume,
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
    driverId: data.driverId ?? undefined,
    truckId: data.truckId ?? undefined,
    createdAt: data.createdAtUtc,
    updatedAt: data.updatedAtUtc ?? data.createdAtUtc,
    startedAt: data.startedAtUtc ?? undefined,
    deliveredAt: data.deliveredAtUtc ?? undefined,
    estimatedDeliveryDate: data.estimatedDeliveryDateUtc ?? undefined,
    proofOfDeliveryUrl: data.proofOfDeliveryUrl ?? undefined,
    milestones: (data.milestones ?? []).map((m: any) => ({
      id: m.id,
      timestamp: m.timestampUtc,
      note: m.note,
      type: "checkpoint",
      location: {
        address: "",
        city: "",
        country: "",
        postalCode: "",
        lat: m.latitude,
        lng: m.longitude,
      },
    })),
  }
}

function mapActivityType(type: ActivityApiType): Activity["type"] {
  const normalized = String(type).toLowerCase()
  if (normalized === "created") return "created"
  if (normalized === "assigned") return "assigned"
  if (normalized === "started") return "started"
  if (normalized === "delivered") return "delivered"
  return "updated"
}

export const api = {
  async getCurrentUser(): Promise<User> {
    return request<User>("/api/auth/me")
  },

  async setMockUser(): Promise<User> {
    throw new Error("Mock user switching is no longer supported")
  },

  async logout(): Promise<void> {
    window.location.href = "/api/auth/logout"
  },

  async getShipments(filters?: {
    status?: ShipmentStatus
    driverId?: string
    startDate?: string
    endDate?: string
    search?: string
  }): Promise<Shipment[]> {
    const params = new URLSearchParams()
    if (filters?.status) {
      const mapped = filters.status === "in-transit" ? "InTransit" : filters.status[0].toUpperCase() + filters.status.slice(1)
      params.set("status", mapped)
    }
    if (filters?.driverId) params.set("driverId", filters.driverId)
    if (filters?.startDate) params.set("startDate", filters.startDate)
    if (filters?.endDate) params.set("endDate", filters.endDate)
    if (filters?.search) params.set("search", filters.search)

    const response = await request<{ items: any[] }>(`/api/shipments?${params.toString()}`)
    return (response.items ?? []).map(mapShipmentSummary)
  },

  async getShipment(id: string): Promise<Shipment | null> {
    const response = await request<any>(`/api/shipments/${id}`)
    return response ? mapShipmentDetail(response) : null
  },

  async createShipment(data: Omit<Shipment, "id" | "trackingId" | "createdAt" | "updatedAt">): Promise<Shipment> {
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

  async updateShipment(id: string, _data: Partial<Shipment>): Promise<Shipment> {
    throw new Error(`Update shipment is not available in backend API (shipment ${id})`)
  },

  async deleteShipment(id: string): Promise<void> {
    throw new Error(`Delete shipment is not available in backend API (shipment ${id})`)
  },

  async publishShipment(id: string): Promise<Shipment> {
    throw new Error(`Publish shipment is not available in backend API (shipment ${id})`)
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
      throw new Error("Deliver shipment now requires a File upload")
    }

    const formData = new FormData()
    formData.append("file", proofOfDeliveryFile)

    const response = await fetch(`${API_BASE_URL}/api/shipments/${id}/deliver`, {
      method: "POST",
      body: formData,
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(await response.text())
    }

    const shipment = await this.getShipment(id)
    if (!shipment) throw new Error("Shipment not found after delivery")
    return shipment
  },

  async getShipmentActivities(shipmentId: string): Promise<Activity[]> {
    const activities = await request<any[]>(`/api/shipments/${shipmentId}/activities`)
    return activities.map((a) => ({
      id: a.id,
      shipmentId,
      type: mapActivityType(a.type),
      description: a.description,
      timestamp: a.timestampUtc,
      userId: a.employeeId,
      userName: "",
    }))
  },

  async updateShipmentLocation(id: string, _location: Location): Promise<Shipment> {
    throw new Error(`Location updates are not available in backend API (shipment ${id})`)
  },

  async addShipmentMilestone(id: string, milestone: Omit<Milestone, "id" | "timestamp">): Promise<Shipment> {
    await request<void>(`/api/shipments/${id}/milestones`, {
      method: "POST",
      body: JSON.stringify({
        latitude: milestone.location.lat,
        longitude: milestone.location.lng,
        note: milestone.note,
      }),
    })

    const shipment = await this.getShipment(id)
    if (!shipment) throw new Error("Shipment not found after milestone")
    return shipment
  },

  async getDrivers(): Promise<Driver[]> {
    const drivers = await request<any[]>("/api/drivers")
    return drivers.map((d) => ({
      id: d.employeeId,
      name: d.name,
      email: d.email,
      phone: d.phone ?? "",
      licenseNumber: d.licenseNumber,
      status: mapDriverStatus(d.status),
    }))
  },

  async getDriver(id: string): Promise<Driver | null> {
    const d = await request<any>(`/api/drivers/${id}`)
    if (!d) return null

    return {
      id: d.employeeId,
      name: d.name,
      email: d.email,
      phone: d.phone ?? "",
      licenseNumber: d.licenseNumber,
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
    const trucks = await request<any[]>("/api/trucks")
    return trucks.map((t) => ({
      id: t.id,
      plateNumber: t.plateNumber,
      model: t.model,
      capacity: t.capacity,
      status: mapTruckStatus(t.status),
    }))
  },

  async getTruck(id: string): Promise<Truck | null> {
    const trucks = await this.getTrucks()
    return trucks.find((t) => t.id === id) ?? null
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
        return { success: false, error: "Only status updates are supported by backend API" }
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
    const drivers = await this.getDrivers()

    return shipments
      .filter((s) => s.driverId)
      .map((s) => ({
        id: s.id,
        shipmentId: s.id,
        trackingId: s.trackingId,
        driverName: drivers.find((d) => d.id === s.driverId)?.name ?? "Unknown",
        cargo: s.cargo.description,
        status: s.status,
        position: {
          lat: s.currentLocation?.lat ?? 0,
          lng: s.currentLocation?.lng ?? 0,
        },
        lastUpdate: s.updatedAt,
      }))
  },

  async getAnalytics() {
    const [shipments, drivers] = await Promise.all([this.getShipments(), this.getDrivers()])

    return {
      totalShipments: shipments.length,
      activeShipments: shipments.filter((s) => s.status === "in-transit").length,
      deliveredShipments: shipments.filter((s) => s.status === "delivered").length,
      avgDeliveryTime: "N/A",
      activeDrivers: drivers.filter((d) => d.status === "on-duty").length,
      availableDrivers: drivers.filter((d) => d.status === "available").length,
    }
  },

  async uploadProofOfDelivery(file: File): Promise<File> {
    return file
  },
}
