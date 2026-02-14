"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Truck } from "lucide-react"

export default function LandingPage() {

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-md p-8 space-y-8">
                <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary">
                        <Truck className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-balance">EuroTrans</h1>
                        <p className="text-muted-foreground text-balance">Centralized fleet & shipment management</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button className="w-full h-12 text-base" asChild>
                        <a href="/auth/login">Login with Auth0</a>
                    </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                    Mock authentication for development. Auth0 integration coming soon.
                </p>
            </Card>
        </div>
    )
}
