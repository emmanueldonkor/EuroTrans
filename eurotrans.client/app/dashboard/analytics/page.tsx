import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/get-query-client"
import { apiServer } from "@/lib/api-server"
import { AnalyticsClient } from "./analytics-client"

export default async function AnalyticsPage() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["analytics"],
    queryFn: () => apiServer.getAnalytics(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AnalyticsClient />
    </HydrationBoundary>
  )
}
