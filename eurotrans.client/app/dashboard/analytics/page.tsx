"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Package, TrendingUp, Users, Clock } from "lucide-react"
import { api } from "@/lib/api"

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const data = await api.getAnalytics()
      setAnalytics(data)
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Performance metrics and insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Shipments</p>
              <p className="text-2xl font-bold">{analytics?.totalShipments || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
              <TrendingUp className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Shipments</p>
              <p className="text-2xl font-bold">{analytics?.activeShipments || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <Package className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivered</p>
              <p className="text-2xl font-bold">{analytics?.deliveredShipments || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Drivers</p>
              <p className="text-2xl font-bold">{analytics?.activeDrivers || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Shipments Over Time</h2>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Chart visualization coming soon</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Driver Workload Distribution</h2>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Chart visualization coming soon</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Stats */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Avg Delivery Time</p>
            <p className="text-xl font-bold">{analytics?.avgDeliveryTime || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Available Drivers</p>
            <p className="text-xl font-bold">{analytics?.availableDrivers || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Fleet Utilization</p>
            <p className="text-xl font-bold">
              {analytics?.activeShipments && analytics?.totalShipments
                ? `${Math.round((analytics.activeShipments / analytics.totalShipments) * 100)}%`
                : "0%"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
