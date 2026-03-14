import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/get-query-client"
import { apiServer } from "@/lib/api-server"
import { DriverClient } from "./driver-client"

export default async function DriverPage() {
  const queryClient = getQueryClient()

  try {
    await queryClient.prefetchQuery({
      queryKey: ["shipments", "driver-current"],
      queryFn: () => apiServer.getCurrentDriverShipment(),
    })
  } catch {
    // Allow client side to handle session errors or retries.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DriverClient />
    </HydrationBoundary>
  )
}
