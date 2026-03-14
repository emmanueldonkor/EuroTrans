import type React from "react"
import { redirect } from "next/navigation"
import { getSessionUser, getRedirectPath } from "@/lib/auth"
import { DriverLayoutClient } from "./driver-layout-client"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/get-query-client"
import { apiServer } from "@/lib/api-server"

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "driver") {
    redirect(getRedirectPath(user.role))
  }

  const queryClient = getQueryClient()
  await queryClient.prefetchQuery({
    queryKey: ["current-user"],
    queryFn: () => apiServer.getCurrentUserContext(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DriverLayoutClient initialUser={user}>
        {children}
      </DriverLayoutClient>
    </HydrationBoundary>
  )
}
