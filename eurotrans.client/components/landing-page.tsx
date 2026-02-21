"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Truck } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4 animate-fade-in">
      <Card className="w-full max-w-sm p-8 space-y-6 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <Truck className="h-7 w-7 text-primary" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">EuroTrans</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue</p>
        </div>
        <Button className="w-full h-11" asChild>
          <a href="/auth/login">Continue with Auth0</a>
        </Button>
      </Card>
    </div>
  )
}
