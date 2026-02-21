"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSessionUser, getRedirectPath } from "@/lib/auth"
import type { UserRole } from "@/lib/types"
import { SectionLoader } from "@/components/ui/page-state"

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
    return <SectionLoader label="Loading your session..." />
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
