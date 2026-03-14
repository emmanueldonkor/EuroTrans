import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/get-query-client"
import { apiServer } from "@/lib/api-server"
import { DriverShipmentsClient } from "./shipments-client"

export default async function DriverShipmentsPage() {
  const queryClient = getQueryClient()
  const pageSize = 10

  try {
    await queryClient.prefetchInfiniteQuery({
      queryKey: ["shipments", "infinite", undefined, pageSize],
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        apiServer.getShipmentsPage({
          page: pageParam,
          pageSize,
        }),
      getNextPageParam: (lastPage) => {
        const totalPages = Math.max(1, Math.ceil(lastPage.totalCount / Math.max(lastPage.pageSize, 1)))
        return lastPage.page < totalPages ? lastPage.page + 1 : undefined
      },
    })
  } catch {
    // Allow client to handle session errors or retries.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DriverShipmentsClient />
    </HydrationBoundary>
  )
}
