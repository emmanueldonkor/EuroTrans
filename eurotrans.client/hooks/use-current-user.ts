"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: () => api.getCurrentUserContext(),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
