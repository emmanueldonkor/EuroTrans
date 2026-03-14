import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/get-query-client"
import { apiServer } from "@/lib/api-server"
import { DriverClient } from "./driver-client"

export default async function DriverHomePage() {
  const queryClient = getQueryClient()

  // Prefetch both current user details and their active shipment in parallel on the server
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["current-user"],
      queryFn: () => apiServer.getCurrentUserContext(),
    }),
    queryClient.prefetchQuery({
      queryKey: ["shipments", "driver-current"],
      queryFn: () => apiServer.getCurrentDriverShipment(),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DriverClient />
    </HydrationBoundary>
  )
}
