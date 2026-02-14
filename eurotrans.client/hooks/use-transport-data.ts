import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Shipment, ShipmentStatus, Truck, Driver, Activity, LiveMapPin, Location, Milestone } from "@/lib/types"

// --- SHIPMENTS ---

export function useShipments(filters?: {
    status?: ShipmentStatus
    driverId?: string
    startDate?: string
    endDate?: string
    search?: string
}) {
    return useQuery({
        queryKey: ["shipments", filters],
        queryFn: () => api.getShipments(filters),
    })
}

export function useShipment(id: string) {
    return useQuery({
        queryKey: ["shipment", id],
        queryFn: () => api.getShipment(id),
        enabled: !!id,
    })
}

export function useShipmentActivities(id: string) {
    return useQuery({
        queryKey: ["shipment-activities", id],
        queryFn: () => api.getShipmentActivities(id),
        enabled: !!id,
    })
}

export function useShipmentMutations() {
    const queryClient = useQueryClient()

    const createShipment = useMutation({
        mutationFn: api.createShipment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shipments"] })
        },
    })

    const updateShipment = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Shipment> }) => api.updateShipment(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["shipments"] })
            queryClient.invalidateQueries({ queryKey: ["shipment", data.id] })
        },
    })

    const deleteShipment = useMutation({
        mutationFn: api.deleteShipment,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["shipments"] })
            queryClient.removeQueries({ queryKey: ["shipment", id] })
        },
    })

    const assignShipment = useMutation({
        mutationFn: ({ id, driverId, truckId }: { id: string; driverId: string; truckId: string }) =>
            api.assignShipment(id, driverId, truckId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["shipments"] })
            queryClient.invalidateQueries({ queryKey: ["shipment", data.id] })
            queryClient.invalidateQueries({ queryKey: ["drivers"] })
            queryClient.invalidateQueries({ queryKey: ["trucks"] })
        },
    })

    const startShipment = useMutation({
        mutationFn: api.startShipment,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["shipments"] })
            queryClient.invalidateQueries({ queryKey: ["shipment", data.id] })
        },
    })

    const deliverShipment = useMutation({
        mutationFn: ({ id, proofOfDeliveryUrl }: { id: string; proofOfDeliveryUrl: string }) =>
            api.deliverShipment(id, proofOfDeliveryUrl),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["shipments"] })
            queryClient.invalidateQueries({ queryKey: ["shipment", data.id] })
        },
    })

    const updateLocation = useMutation({
        mutationFn: ({ id, location }: { id: string; location: Location }) => api.updateShipmentLocation(id, location),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["shipment", data.id] })
            queryClient.invalidateQueries({ queryKey: ["live-map"] })
        },
    })

    return {
        createShipment,
        updateShipment,
        deleteShipment,
        assignShipment,
        startShipment,
        deliverShipment,
        updateLocation
    }
}


// --- DRIVERS ---

export function useDrivers() {
    return useQuery({
        queryKey: ["drivers"],
        queryFn: () => api.getDrivers(),
    })
}

export function useDriver(id: string) {
    return useQuery({
        queryKey: ["driver", id],
        queryFn: () => api.getDriver(id),
        enabled: !!id,
    })
}

export function useDriverMutations() {
    const queryClient = useQueryClient()

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: string; status: "available" | "on-duty" | "off-duty" }) =>
            api.updateDriverStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["drivers"] })
            queryClient.invalidateQueries({ queryKey: ["driver", variables.id] })
        },
    })

    return { updateStatus }
}

// --- TRUCKS ---

export function useTrucks() {
    return useQuery({
        queryKey: ["trucks"],
        queryFn: () => api.getTrucks()
    })
}

export function useTruck(id: string) {
    return useQuery({
        queryKey: ["truck", id],
        queryFn: () => api.getTruck(id),
        enabled: !!id,
    })
}

export function useTruckMutations() {
    const queryClient = useQueryClient()

    const createTruck = useMutation({
        mutationFn: api.createTruck,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trucks"] })
        },
    })

    const updateTruck = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Truck> }) => api.updateTruck(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["trucks"] })
            if (data.truck) queryClient.invalidateQueries({ queryKey: ["truck", data.truck.id] })
        },
    })

    const deleteTruck = useMutation({
        mutationFn: api.deleteTruck,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["trucks"] })
            queryClient.removeQueries({ queryKey: ["truck", id] })
        },
    })

    return { createTruck, updateTruck, deleteTruck }
}

// --- OTHER ---

export function useLiveMap() {
    return useQuery({
        queryKey: ["live-map"],
        queryFn: () => api.getLiveMapPins(),
        refetchInterval: 10000, // Refresh every 10s
    })
}

export function useAnalytics() {
    return useQuery({
        queryKey: ["analytics"],
        queryFn: () => api.getAnalytics(),
    })
}

export function useCurrentUser() {
    return useQuery({
        queryKey: ["current-user"],
        queryFn: () => api.getCurrentUser(),
    })
}
