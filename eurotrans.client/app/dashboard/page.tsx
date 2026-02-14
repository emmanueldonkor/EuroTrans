"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to shipments by default
    router.push("/dashboard/shipments")
  }, [router])

  return null
}
