"use client"

import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground">
            An error occurred while processing your request. Please try again or contact support if the problem
            persists.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => (window.location.href = "/")} variant="outline" className="flex-1">
            Go Home
          </Button>
          <Button onClick={reset} className="flex-1">
            Try Again
          </Button>
        </div>
      </Card>
    </div>
  )
}
