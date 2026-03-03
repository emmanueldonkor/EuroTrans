import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { ShipmentStatus, Truck, Location } from "@/lib/types"

// --- SHIPMENTS ---

export function useShipments(filters?: {
    status?: ShipmentStatus
    driverId?: string
    startDate?: string
    endDate?: string
    search?: string
    hasProofOfDelivery?: boolean
}, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ["shipments", filters],
        queryFn: () => api.getShipments(filters),
        enabled: options?.enabled ?? true,
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        placeholderData: (previousData) => previousData,
    })
}

export function useDriverCurrentShipment(
    driverId?: string,
    options?: { enabled?: boolean },
) {
    return useQuery({
        queryKey: ["shipments", "driver-current", driverId],
        enabled: (options?.enabled ?? true) && !!driverId,
        queryFn: async () => {
            const inTransit = await api.getShipmentsPage({
                driverId,
                status: "in-transit",
                page: 1,
                pageSize: 1,
            })

            if (inTransit.items.length > 0) {
                return inTransit.items[0]
            }

            const assigned = await api.getShipmentsPage({
                driverId,
                status: "assigned",
                page: 1,
                pageSize: 1,
            })

            return assigned.items[0] ?? null
        },
        staleTime: 30_000,
        gcTime: 5 * 60_000,
    })
}

export function useInfiniteShipments(
    filters?: {
        status?: ShipmentStatus
        driverId?: string
        startDate?: string
        endDate?: string
        search?: string
        hasProofOfDelivery?: boolean
    },
    options?: { enabled?: boolean; pageSize?: number },
) {
    const pageSize = options?.pageSize ?? 10

    return useInfiniteQuery({
        queryKey: ["shipments", "infinite", filters, pageSize],
        initialPageParam: 1,
        queryFn: ({ pageParam }) =>
            api.getShipmentsPage({
                ...filters,
                page: pageParam,
                pageSize,
            }),
        getNextPageParam: (lastPage) => {
            const totalPages = Math.max(1, Math.ceil(lastPage.totalCount / Math.max(lastPage.pageSize, 1)))
            return lastPage.page < totalPages ? lastPage.page + 1 : undefined
        },
        enabled: options?.enabled ?? true,
        staleTime: 60_000,
        gcTime: 5 * 60_000,
    })
}

export function useShipmentsPage(filters?: {
    status?: ShipmentStatus
    driverId?: string
    startDate?: string
    endDate?: string
    search?: string
    hasProofOfDelivery?: boolean
    page?: number
    pageSize?: number
}, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ["shipments", "page", filters],
        queryFn: () => api.getShipmentsPage(filters),
        enabled: options?.enabled ?? true,
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        placeholderData: (previousData) => previousData,
    })
}

export function useShipment(id: string) {
    return useQuery({
        queryKey: ["shipment", id],
        queryFn: () => api.getShipment(id),
        enabled: !!id,
        staleTime: 15_000,
        gcTime: 5 * 60_000,
    })
}

export function useShipmentActivities(id: string) {
    return useQuery({
        queryKey: ["shipment-activities", id],
        queryFn: () => api.getShipmentActivities(id),
        enabled: !!id,
        staleTime: 15_000,
        gcTime: 5 * 60_000,
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
        mutationFn: ({ id, proofOfDeliveryFile }: { id: string; proofOfDeliveryFile: File | string }) =>
            api.deliverShipment(id, proofOfDeliveryFile),
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
        staleTime: 45_000,
        gcTime: 10 * 60_000,
    })
}

export function useDriversPage(filters?: {
    search?: string
    status?: "available" | "on-duty" | "off-duty"
    page?: number
    pageSize?: number
}) {
    return useQuery({
        queryKey: ["drivers", "page", filters],
        queryFn: () => api.getDriversPage(filters),
        staleTime: 45_000,
        gcTime: 10 * 60_000,
        placeholderData: (previousData) => previousData,
    })
}

export function useDriver(id: string) {
    return useQuery({
        queryKey: ["driver", id],
        queryFn: () => api.getDriver(id),
        enabled: !!id,
        staleTime: 30_000,
        gcTime: 10 * 60_000,
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
        queryFn: () => api.getTrucks(),
        staleTime: 45_000,
        gcTime: 10 * 60_000,
    })
}

export function useTrucksPage(filters?: {
    search?: string
    status?: "available" | "in-use" | "maintenance"
    page?: number
    pageSize?: number
}) {
    return useQuery({
        queryKey: ["trucks", "page", filters],
        queryFn: () => api.getTrucksPage(filters),
        staleTime: 45_000,
        gcTime: 10 * 60_000,
        placeholderData: (previousData) => previousData,
    })
}

export function useTruck(id: string) {
    return useQuery({
        queryKey: ["truck", id],
        queryFn: () => api.getTruck(id),
        enabled: !!id,
        staleTime: 30_000,
        gcTime: 10 * 60_000,
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
        staleTime: 5_000,
        refetchInterval: 15000,
    })
}

export function useInfiniteLiveMap(options?: { enabled?: boolean; pageSize?: number }) {
    const pageSize = options?.pageSize ?? 12

    return useInfiniteQuery({
        queryKey: ["live-map", "infinite", pageSize],
        initialPageParam: 1,
        queryFn: ({ pageParam }) =>
            api.getLiveMapPinsPage({
                page: pageParam,
                pageSize,
            }),
        getNextPageParam: (lastPage) => {
            const totalPages = Math.max(1, Math.ceil(lastPage.totalCount / Math.max(lastPage.pageSize, 1)))
            return lastPage.page < totalPages ? lastPage.page + 1 : undefined
        },
        enabled: options?.enabled ?? true,
        staleTime: 5_000,
        refetchInterval: 15000,
    })
}

export function useAnalytics() {
    return useQuery({
        queryKey: ["analytics"],
        queryFn: () => api.getAnalytics(),
        staleTime: 60_000,
        gcTime: 10 * 60_000,
    })
}

