import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/get-query-client"
import { apiServer } from "@/lib/api-server"
import { ShipmentsClient } from "./shipments-client"

export default async function ShipmentsPage() {
  const queryClient = getQueryClient()
  const pageSize = 12

  // Prefetch data required for the default view (page 1, all shipments, driver options)
  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ["shipments", "page", { page: 1, pageSize }],
        queryFn: () => apiServer.getShipmentsPage({ page: 1, pageSize }),
      }),
      queryClient.prefetchQuery({
        queryKey: ["drivers", "options"],
        queryFn: () => apiServer.getDriverOptions(),
      }),
    ])
  } catch {
    // Allow client to handle session errors or retries.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ShipmentsClient />
    </HydrationBoundary>
  )
}
