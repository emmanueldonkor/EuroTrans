import type React from "react"
import { redirect } from "next/navigation"
import { getSessionUser, getRedirectPath } from "@/lib/auth"
import { DashboardLayoutClient } from "./dashboard-layout-client"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "manager") {
    redirect(getRedirectPath(user.role))
  }

  return <DashboardLayoutClient initialUser={user}>{children}</DashboardLayoutClient>
}
