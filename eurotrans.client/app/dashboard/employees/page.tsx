import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/get-query-client"
import { apiServer } from "@/lib/api-server"
import { EmployeesClient } from "./employees-client"

export default async function EmployeesPage() {
  const queryClient = getQueryClient()
  const pageSize = 10

  try {
    await queryClient.prefetchQuery({
      queryKey: ["drivers", "page", { page: 1, pageSize }],
      queryFn: () => apiServer.getDriversPage({ page: 1, pageSize }),
    })
  } catch {
    // Allow client to handle session errors or retries.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EmployeesClient />
    </HydrationBoundary>
  )
}
