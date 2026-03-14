import type React from "react"
import { redirect } from "next/navigation"
import { getSessionUser, getRedirectPath } from "@/lib/auth"
import { DashboardLayoutClient } from "./dashboard-layout-client"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/get-query-client"
import { apiServer } from "@/lib/api-server"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "manager") {
    redirect(getRedirectPath(user.role))
  }

  const queryClient = getQueryClient()
  await queryClient.prefetchQuery({
    queryKey: ["current-user"],
    queryFn: () => apiServer.getCurrentUserContext(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardLayoutClient initialUser={user}>
        {children}
      </DashboardLayoutClient>
    </HydrationBoundary>
  )
}
