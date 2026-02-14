"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { UserIcon, Mail, Phone } from "lucide-react"
import type { User } from "@/lib/types"
import { getSessionUser } from "@/lib/auth"

export default function DriverProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSessionUser().then((userData) => {
      setUser(userData)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Your driver information</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <UserIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-xl font-bold">{user?.name}</p>
            <p className="text-sm text-muted-foreground">Driver</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <Label className="text-muted-foreground">Email</Label>
              <p className="mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <Label className="text-muted-foreground">Phone</Label>
              <p className="mt-1">Contact dispatch for details</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
