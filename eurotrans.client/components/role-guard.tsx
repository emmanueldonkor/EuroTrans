"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSessionUser, getRedirectPath } from "@/lib/auth"
import type { UserRole } from "@/lib/types"

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getSessionUser().then((user) => {
      if (!user) {
        router.push("/")
        return
      }

      if (!allowedRoles.includes(user.role)) {
        router.push(getRedirectPath(user.role))
        return
      }

      setIsAuthorized(true)
      setIsLoading(false)
    })
  }, [allowedRoles, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
