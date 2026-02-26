"use client"

import { Card } from "@/components/ui/card"
import { Package, TrendingUp, Users, Clock, ArrowUpRight } from "lucide-react"
import { useAnalytics } from "@/hooks/use-transport-data"
import { PageErrorState, SectionLoader } from "@/components/ui/page-state"
import { PageHeading, PageShell, PageSurface } from "@/components/ui/page-shell"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const shipmentsOverTimeChartConfig = {
  count: {
    label: "Shipments",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const driverWorkloadChartConfig = {
  assigned: {
    label: "Assigned",
    color: "#f59e0b",
  },
  inTransit: {
    label: "In Transit",
    color: "#3b82f6",
  },
} satisfies ChartConfig

export default function AnalyticsPage() {
  const { data: analytics, isLoading, error, refetch } = useAnalytics()

  if (isLoading) {
    return <SectionLoader label="Loading analytics..." />
  }

  if (error) {
    return (
      <PageErrorState
        title="Could not load analytics"
        message={error instanceof Error ? error.message : "Unexpected error while loading analytics."}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  return (
    <PageShell>
      <PageHeading title="Analytics" description="Performance metrics and insights" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="kpi-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Shipments</p>
              <p className="text-2xl font-bold">{analytics?.totalShipments || 0}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Live portfolio volume
              </p>
            </div>
          </div>
        </Card>

        <Card className="kpi-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
              <TrendingUp className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Shipments</p>
              <p className="text-2xl font-bold">{analytics?.activeShipments || 0}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                <ArrowUpRight className="h-3.5 w-3.5" />
                In execution now
              </p>
            </div>
          </div>
        </Card>

        <Card className="kpi-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <Package className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivered</p>
              <p className="text-2xl font-bold">{analytics?.deliveredShipments || 0}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Completed shipments
              </p>
            </div>
          </div>
        </Card>

        <Card className="kpi-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Drivers</p>
              <p className="text-2xl font-bold">{analytics?.activeDrivers || 0}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Capacity online
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PageSurface className="p-6 surface-hover panel-muted">
          <h2 className="text-lg font-semibold mb-4">Shipments Over Time</h2>
          {analytics?.shipmentsOverTime?.length ? (
            <ChartContainer config={shipmentsOverTimeChartConfig} className="h-64 w-full">
              <LineChart data={analytics.shipmentsOverTime}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--color-count)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="h-64 flex items-center justify-center rounded-lg border border-dashed border-border/80 bg-background/60">
              <div className="text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No shipment trend data yet</p>
              </div>
            </div>
          )}
        </PageSurface>

        <PageSurface className="p-6 surface-hover panel-muted">
          <h2 className="text-lg font-semibold mb-4">Driver Workload Distribution</h2>
          {analytics?.driverWorkloadDistribution?.length ? (
            <ChartContainer config={driverWorkloadChartConfig} className="h-64 w-full">
              <BarChart data={analytics.driverWorkloadDistribution}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="driverName" tickLine={false} axisLine={false} tickMargin={8} interval={0} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="assigned" fill="var(--color-assigned)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inTransit" fill="var(--color-inTransit)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-64 flex items-center justify-center rounded-lg border border-dashed border-border/80 bg-background/60">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No active driver workload yet</p>
              </div>
            </div>
          )}
        </PageSurface>
      </div>

      {/* Additional Stats */}
      <PageSurface className="p-6 surface-hover">
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
      </PageSurface>
    </PageShell>
  )
}
