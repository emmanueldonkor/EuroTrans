import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/get-query-client"
import { apiServer } from "@/lib/api-server"
import { FleetClient } from "./fleet-client"

export default async function FleetPage() {
  const queryClient = getQueryClient()
  const pageSize = 10

  await queryClient.prefetchQuery({
    queryKey: ["trucks", "page", { page: 1, pageSize }],
    queryFn: () => apiServer.getTrucksPage({ page: 1, pageSize }),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FleetClient />
    </HydrationBoundary>
  )
}
