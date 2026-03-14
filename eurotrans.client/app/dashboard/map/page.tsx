import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/get-query-client"
import { apiServer } from "@/lib/api-server"
import { LiveMapClient } from "./map-client"
import type { LiveMapPin, PagedResult } from "@/lib/types"

export default async function LiveMapPage() {
  const queryClient = getQueryClient()
  const pageSize = 12

  try {
    await queryClient.prefetchInfiniteQuery({
      queryKey: ["live-map", "infinite", pageSize],
      initialPageParam: 1,
      queryFn: ({ pageParam }) => apiServer.getLiveMapPinsPage({ page: pageParam, pageSize }),
      getNextPageParam: (lastPage: PagedResult<LiveMapPin>) => {
        const totalPages = Math.max(1, Math.ceil(lastPage.totalCount / Math.max(lastPage.pageSize, 1)))
        return lastPage.page < totalPages ? lastPage.page + 1 : undefined
      },
    })
  } catch {
    // Allow client to handle session errors or retries.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LiveMapClient />
    </HydrationBoundary>
  )
}
