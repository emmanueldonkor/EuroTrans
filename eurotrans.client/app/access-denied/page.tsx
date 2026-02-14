"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export default function AccessDeniedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You do not have permission to access this page. Please contact your administrator if you believe this is an
            error.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={() => router.back()} variant="outline" className="bg-transparent">
            Go Back
          </Button>
          <Button onClick={() => router.push("/auth/logout")}>Return to Home</Button>
        </div>
      </Card>
    </div>
  )
}
