import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/get-query-client"
import { apiServer } from "@/lib/api-server"
import { DocumentsClient } from "./documents-client"

export default async function DocumentsPage() {
  const queryClient = getQueryClient()
  const pageSize = 10

  await queryClient.prefetchQuery({
    queryKey: ["shipments", "page", { status: "delivered", hasProofOfDelivery: true, page: 1, pageSize }],
    queryFn: () =>
      apiServer.getShipmentsPage({
        status: "delivered",
        hasProofOfDelivery: true,
        page: 1,
        pageSize,
      }),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DocumentsClient />
    </HydrationBoundary>
  )
}
