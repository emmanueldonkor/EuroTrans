// Simulated API contract for frontend development
// This will be replaced with real API calls later

import type { User, Driver, Truck, Shipment, Activity, LiveMapPin, ShipmentStatus, Location, Milestone } from "./types"

// Simulated delay for realistic API behavior
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock data storage
const mockShipments: Shipment[] = [
  {
    id: "1",
    trackingId: "ET-2024-0001",
    status: "in-transit",
    cargo: {
      description: "Electronics - Laptops and accessories",
      weight: 450,
      volume: 2.5,
    },
    origin: {
      address: "Logistics Hub 1",
      city: "Berlin",
      country: "Germany",
      postalCode: "10115",
      lat: 52.52,
      lng: 13.405,
    },
    destination: {
      address: "Distribution Center",
      city: "Paris",
      country: "France",
      postalCode: "75001",
      lat: 48.8566,
      lng: 2.3522,
    },
    driverId: "d1",
    truckId: "t1",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
    estimatedDeliveryDate: "2024-01-16T18:00:00Z",
  },
  {
    id: "2",
    trackingId: "ET-2024-0002",
    status: "unassigned",
    cargo: {
      description: "Automotive parts",
      weight: 800,
      volume: 5.0,
    },
    origin: {
      address: "Factory Zone",
      city: "Munich",
      country: "Germany",
      postalCode: "80331",
      lat: 48.1351,
      lng: 11.582,
    },
    destination: {
      address: "Warehouse 5",
      city: "Lyon",
      country: "France",
      postalCode: "69001",
      lat: 45.764,
      lng: 4.8357,
    },
    createdAt: "2024-01-16T10:00:00Z",
    updatedAt: "2024-01-16T10:00:00Z",
  },
  {
    id: "3",
    trackingId: "ET-2024-0003",
    status: "delivered",
    cargo: {
      description: "Textile goods",
      weight: 320,
      volume: 3.2,
    },
    origin: {
      address: "Warehouse A",
      city: "Frankfurt",
      country: "Germany",
      postalCode: "60311",
      lat: 50.1109,
      lng: 8.6821,
    },
    destination: {
      address: "Retail Center",
      city: "Brussels",
      country: "Belgium",
      postalCode: "1000",
      lat: 50.8503,
      lng: 4.3517,
    },
    driverId: "d2",
    truckId: "t2",
    createdAt: "2024-01-10T07:00:00Z",
    updatedAt: "2024-01-14T16:45:00Z",
    startedAt: "2024-01-10T08:30:00Z",
    deliveredAt: "2024-01-14T16:45:00Z",
    proofOfDeliveryUrl: "/mock-pod.pdf",
  },
]

const mockDrivers: Driver[] = [
  {
    id: "d1",
    name: "John Schmidt",
    email: "john.schmidt@eurotrans.com",
    phone: "+49 151 1234 5678",
    licenseNumber: "DE-DL-123456",
    status: "on-duty",
    currentShipmentId: "1",
  },
  {
    id: "d2",
    name: "Marie Dubois",
    email: "marie.dubois@eurotrans.com",
    phone: "+33 6 12 34 56 78",
    licenseNumber: "FR-DL-789012",
    status: "available",
  },
  {
    id: "d3",
    name: "Hans Mueller",
    email: "hans.mueller@eurotrans.com",
    phone: "+49 151 9876 5432",
    licenseNumber: "DE-DL-345678",
    status: "off-duty",
  },
]

const mockTrucks: Truck[] = [
  {
    id: "t1",
    plateNumber: "B-TR-1234",
    model: "Mercedes Actros 2545",
    capacity: 25000,
    status: "in-use",
  },
  {
    id: "t2",
    plateNumber: "M-TR-5678",
    model: "Volvo FH16",
    capacity: 28000,
    status: "available",
  },
  {
    id: "t3",
    plateNumber: "F-TR-9012",
    model: "MAN TGX",
    capacity: 26000,
    status: "maintenance",
  },
]

const mockActivities: Activity[] = [
  {
    id: "a1",
    shipmentId: "1",
    type: "created",
    description: "Shipment created",
    timestamp: "2024-01-15T08:00:00Z",
    userId: "m1",
    userName: "Manager Admin",
  },
  {
    id: "a2",
    shipmentId: "1",
    type: "assigned",
    description: "Assigned to John Schmidt with truck B-TR-1234",
    timestamp: "2024-01-15T08:30:00Z",
    userId: "m1",
    userName: "Manager Admin",
  },
  {
    id: "a3",
    shipmentId: "1",
    type: "started",
    description: "Journey started",
    timestamp: "2024-01-15T09:00:00Z",
    userId: "d1",
    userName: "John Schmidt",
  },
]

// Mock current user (will be replaced with Auth0)
let currentUser: User = {
  id: "m1",
  name: "Manager Admin",
  email: "admin@eurotrans.com",
  role: "manager",
}

// API functions
export const api = {
  // Auth
  async getCurrentUser(): Promise<User> {
    await delay(300)
    return currentUser
  },

  async setMockUser(role: "manager" | "driver"): Promise<User> {
    await delay(100)
    if (role === "driver") {
      currentUser = {
        id: "d1",
        name: "John Schmidt",
        email: "john.schmidt@eurotrans.com",
        role: "driver",
      }
    } else {
      currentUser = {
        id: "m1",
        name: "Manager Admin",
        email: "admin@eurotrans.com",
        role: "manager",
      }
    }
    return currentUser
  },

  async logout(): Promise<void> {
    await delay(200)
    // In real app, this will call Auth0 logout
  },

  // Shipments
  async getShipments(filters?: {
    status?: ShipmentStatus
    driverId?: string
    startDate?: string
    endDate?: string
    search?: string
  }): Promise<Shipment[]> {
    await delay(400)
    let filtered = [...mockShipments]

    if (filters?.status) {
      filtered = filtered.filter((s) => s.status === filters.status)
    }
    if (filters?.driverId) {
      filtered = filtered.filter((s) => s.driverId === filters.driverId)
    }
    if (filters?.search) {
      filtered = filtered.filter((s) => s.trackingId.toLowerCase().includes(filters.search!.toLowerCase()))
    }

    return filtered
  },

  async getShipment(id: string): Promise<Shipment | null> {
    await delay(300)
    return mockShipments.find((s) => s.id === id) || null
  },

  async createShipment(data: Omit<Shipment, "id" | "trackingId" | "createdAt" | "updatedAt">): Promise<Shipment> {
    await delay(500)
    const newShipment: Shipment = {
      ...data,
      id: String(mockShipments.length + 1),
      trackingId: `ET-2024-${String(mockShipments.length + 1).padStart(4, "0")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockShipments.push(newShipment)
    return newShipment
  },

  async updateShipment(id: string, data: Partial<Shipment>): Promise<Shipment> {
    await delay(400)
    const index = mockShipments.findIndex((s) => s.id === id)
    if (index === -1) throw new Error("Shipment not found")

    mockShipments[index] = {
      ...mockShipments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return mockShipments[index]
  },

  async deleteShipment(id: string): Promise<void> {
    await delay(400)
    const index = mockShipments.findIndex((s) => s.id === id)
    if (index === -1) throw new Error("Shipment not found")

    mockShipments.splice(index, 1)

    mockActivities.push({
      id: String(mockActivities.length + 1),
      shipmentId: id,
      type: "deleted",
      description: "Shipment deleted",
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
    })
  },

  async publishShipment(id: string): Promise<Shipment> {
    await delay(400)
    const shipment = await this.updateShipment(id, {
      status: "unassigned",
    })

    mockActivities.push({
      id: String(mockActivities.length + 1),
      shipmentId: id,
      type: "updated",
      description: "Shipment published and ready for assignment",
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
    })

    return shipment
  },

  async assignShipment(id: string, driverId: string, truckId: string): Promise<Shipment> {
    await delay(500)
    const currentShipment = mockShipments.find((s) => s.id === id)
    if (!currentShipment) throw new Error("Shipment not found")

    const newStatus = currentShipment.status === "draft" ? "in-transit" : "in-transit"

    const shipment = await this.updateShipment(id, {
      driverId,
      truckId,
      status: newStatus,
    })

    // Add activity
    mockActivities.push({
      id: String(mockActivities.length + 1),
      shipmentId: id,
      type: "assigned",
      description: `Assigned to driver ${driverId} with truck ${truckId}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
    })

    return shipment
  },

  async startShipment(id: string): Promise<Shipment> {
    await delay(400)
    const shipment = await this.updateShipment(id, {
      startedAt: new Date().toISOString(),
    })

    mockActivities.push({
      id: String(mockActivities.length + 1),
      shipmentId: id,
      type: "started",
      description: "Journey started",
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
    })

    return shipment
  },

  async deliverShipment(id: string, proofOfDeliveryUrl: string): Promise<Shipment> {
    await delay(500)
    const shipment = await this.updateShipment(id, {
      status: "delivered",
      deliveredAt: new Date().toISOString(),
      proofOfDeliveryUrl,
    })

    mockActivities.push({
      id: String(mockActivities.length + 1),
      shipmentId: id,
      type: "delivered",
      description: "Shipment delivered with proof",
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
    })

    return shipment
  },

  async getShipmentActivities(shipmentId: string): Promise<Activity[]> {
    await delay(300)
    return mockActivities.filter((a) => a.shipmentId === shipmentId)
  },

  // Location update function
  async updateShipmentLocation(id: string, location: Location): Promise<Shipment> {
    await delay(400)
    const shipment = await this.updateShipment(id, {
      currentLocation: location,
    })

    mockActivities.push({
      id: String(mockActivities.length + 1),
      shipmentId: id,
      type: "updated",
      description: `Location updated: ${location.city}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
    })

    return shipment
  },

  // Milestone function
  async addShipmentMilestone(id: string, milestone: Omit<Milestone, "id" | "timestamp">): Promise<Shipment> {
    await delay(400)
    const shipment = mockShipments.find((s) => s.id === id)
    if (!shipment) throw new Error("Shipment not found")

    const newMilestone: Milestone = {
      ...milestone,
      id: String(Date.now()),
      timestamp: new Date().toISOString(),
    }

    const updatedShipment = await this.updateShipment(id, {
      milestones: [...(shipment.milestones || []), newMilestone],
    })

    mockActivities.push({
      id: String(mockActivities.length + 1),
      shipmentId: id,
      type: "updated",
      description: `Milestone added: ${milestone.note}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
    })

    return updatedShipment
  },

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    await delay(300)
    return mockDrivers
  },

  async getDriver(id: string): Promise<Driver | null> {
    await delay(200)
    return mockDrivers.find((d) => d.id === id) || null
  },

  async updateDriverStatus(
    driverId: string,
    newStatus: "available" | "on-duty" | "off-duty",
  ): Promise<{ success: boolean; error?: string; driver?: Driver }> {
    await delay(400)

    const driver = mockDrivers.find((d) => d.id === driverId)
    if (!driver) {
      return { success: false, error: "Driver not found" }
    }

    // Check if driver is assigned to any active shipment
    const hasActiveShipment = mockShipments.some(
      (s) => s.driverId === driverId && (s.status === "in-transit" || s.status === "unassigned"),
    )

    if (hasActiveShipment) {
      return {
        success: false,
        error: "Cannot update status: Driver is assigned to an active shipment",
      }
    }

    // Check if driver is currently on duty
    if (driver.status === "on-duty") {
      return {
        success: false,
        error: "Cannot update status: Driver is currently on duty. They must complete their shift first.",
      }
    }

    // Update driver status
    const index = mockDrivers.findIndex((d) => d.id === driverId)
    mockDrivers[index] = {
      ...driver,
      status: newStatus,
    }

    mockActivities.push({
      id: String(mockActivities.length + 1),
      shipmentId: "system",
      type: "updated",
      description: `Driver status updated to ${newStatus}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
    })

    return { success: true, driver: mockDrivers[index] }
  },

  // Trucks
  async getTrucks(): Promise<Truck[]> {
    await delay(300)
    return mockTrucks
  },

  async getTruck(id: string): Promise<Truck | null> {
    await delay(200)
    return mockTrucks.find((t) => t.id === id) || null
  },

  async createTruck(data: Omit<Truck, "id">): Promise<Truck> {
    await delay(400)
    const newTruck: Truck = {
      ...data,
      id: `t${mockTrucks.length + 1}`,
    }
    mockTrucks.push(newTruck)

    mockActivities.push({
      id: String(mockActivities.length + 1),
      shipmentId: "system",
      type: "created",
      description: `New truck added: ${newTruck.plateNumber}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
    })

    return newTruck
  },

  async updateTruck(id: string, data: Partial<Truck>): Promise<{ success: boolean; error?: string; truck?: Truck }> {
    await delay(400)

    const truck = mockTrucks.find((t) => t.id === id)
    if (!truck) {
      return { success: false, error: "Truck not found" }
    }

    // Check if truck is assigned to any active shipment
    const hasActiveShipment = mockShipments.some(
      (s) => s.truckId === id && (s.status === "in-transit" || s.status === "unassigned"),
    )

    if (hasActiveShipment) {
      return {
        success: false,
        error: "Cannot update truck: Truck is assigned to an active shipment",
      }
    }

    // Check if truck is in-use
    if (truck.status === "in-use") {
      return {
        success: false,
        error: "Cannot update truck: Truck is currently in use. Complete the shipment first.",
      }
    }

    // Update truck
    const index = mockTrucks.findIndex((t) => t.id === id)
    mockTrucks[index] = {
      ...truck,
      ...data,
    }

    mockActivities.push({
      id: String(mockActivities.length + 1),
      shipmentId: "system",
      type: "updated",
      description: `Truck updated: ${mockTrucks[index].plateNumber}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
    })

    return { success: true, truck: mockTrucks[index] }
  },

  async deleteTruck(id: string): Promise<{ success: boolean; error?: string }> {
    await delay(400)

    const truck = mockTrucks.find((t) => t.id === id)
    if (!truck) {
      return { success: false, error: "Truck not found" }
    }

    // Check if truck is assigned to any active shipment
    const hasActiveShipment = mockShipments.some(
      (s) => s.truckId === id && (s.status === "in-transit" || s.status === "unassigned"),
    )

    if (hasActiveShipment) {
      return {
        success: false,
        error: "Cannot delete truck: Truck is assigned to an active shipment",
      }
    }

    // Check if truck is in-use
    if (truck.status === "in-use") {
      return {
        success: false,
        error: "Cannot delete truck: Truck is currently in use. Complete the shipment first.",
      }
    }

    // Delete truck
    const index = mockTrucks.findIndex((t) => t.id === id)
    mockTrucks.splice(index, 1)

    mockActivities.push({
      id: String(mockActivities.length + 1),
      shipmentId: "system",
      type: "deleted",
      description: `Truck deleted: ${truck.plateNumber}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
    })

    return { success: true }
  },

  // Live Map
  async getLiveMapPins(): Promise<LiveMapPin[]> {
    await delay(400)
    return mockShipments
      .filter((s) => s.status === "in-transit" && s.driverId)
      .map((s) => {
        const driver = mockDrivers.find((d) => d.id === s.driverId)
        // Simulate location between origin and destination
        const progress = 0.6 // 60% of journey
        return {
          id: s.id,
          shipmentId: s.id,
          trackingId: s.trackingId,
          driverName: driver?.name || "Unknown",
          cargo: s.cargo.description,
          status: s.status,
          position: {
            lat: s.origin.lat + (s.destination.lat - s.origin.lat) * progress,
            lng: s.origin.lng + (s.destination.lng - s.origin.lng) * progress,
          },
          lastUpdate: s.updatedAt,
        }
      })
  },

  // Analytics
  async getAnalytics() {
    await delay(500)
    return {
      totalShipments: mockShipments.length,
      activeShipments: mockShipments.filter((s) => s.status === "in-transit").length,
      deliveredShipments: mockShipments.filter((s) => s.status === "delivered").length,
      avgDeliveryTime: "2.5 days",
      activeDrivers: mockDrivers.filter((d) => d.status === "on-duty").length,
      availableDrivers: mockDrivers.filter((d) => d.status === "available").length,
    }
  },

  // File upload simulation
  async uploadProofOfDelivery(file: File): Promise<string> {
    await delay(1000)
    // Simulate file upload - in real app, this would upload to cloud storage
    return `/uploads/pod-${Date.now()}.pdf`
  },
}
