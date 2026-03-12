import type React from "react"
import { redirect } from "next/navigation"
import { getSessionUser, getRedirectPath } from "@/lib/auth"
import { DriverLayoutClient } from "./driver-layout-client"

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "driver") {
    redirect(getRedirectPath(user.role))
  }

  return (
    <DriverLayoutClient initialUser={user}>
      {children}
    </DriverLayoutClient>
  )
}
