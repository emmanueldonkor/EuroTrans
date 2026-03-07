import type { ReactNode } from "react"
import { AlertTriangle, Inbox, LayoutDashboard, Truck, type LucideIcon } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export function FullPageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md p-6 text-center space-y-4 panel">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </Card>
    </div>
  )
}

export function SectionLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[280px] animate-fade-in">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border/70 bg-card/70 px-6 py-5 backdrop-blur-sm">
        <LoadingSpinner size="md" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function WorkspaceShellLoader({
  label = "Loading workspace...",
  description,
  variant = "manager",
}: {
  label?: string
  description?: string
  variant?: "manager" | "driver"
}) {
  const ShellIcon = variant === "manager" ? LayoutDashboard : Truck
  const navItemCount = variant === "manager" ? 6 : 3

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-[var(--surface-2)]/50 p-4 md:p-6">
      <div className="mx-auto flex max-w-7xl gap-6">
        {variant === "manager" && (
          <aside className="hidden w-72 shrink-0 md:flex md:flex-col rounded-[var(--radius-card)] border border-sidebar-border/70 bg-sidebar p-4 text-sidebar-foreground shadow-lg shadow-black/10">
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-sidebar-border/80 bg-sidebar-accent/60 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary/90">
                <ShellIcon className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div className="space-y-2">
                <div className="shimmer h-3 w-24 rounded-full bg-sidebar-foreground/12" />
                <div className="shimmer h-2.5 w-16 rounded-full bg-sidebar-foreground/8" />
              </div>
            </div>

            <div className="space-y-2">
              {Array.from({ length: navItemCount }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "shimmer h-11 rounded-xl bg-sidebar-accent/70",
                    index === 0 && "ring-1 ring-sidebar-primary/30",
                  )}
                />
              ))}
            </div>

            <div className="mt-auto rounded-xl border border-sidebar-border/80 bg-sidebar-accent/60 p-3">
              <div className="flex items-center gap-3">
                <div className="shimmer h-10 w-10 rounded-full bg-sidebar-foreground/12" />
                <div className="flex-1 space-y-2">
                  <div className="shimmer h-3 w-24 rounded-full bg-sidebar-foreground/10" />
                  <div className="shimmer h-2.5 w-32 rounded-full bg-sidebar-foreground/8" />
                </div>
              </div>
            </div>
          </aside>
        )}

        <div className="flex-1 space-y-6">
          <Card className="panel flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3">
              {variant === "driver" && (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShellIcon className="h-5 w-5" />
                </div>
              )}
              <div className="space-y-2">
                <div className="shimmer h-3.5 w-32 rounded-full bg-muted" />
                <div className="shimmer h-2.5 w-20 rounded-full bg-muted/80" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="shimmer h-9 w-9 rounded-full bg-muted" />
              <div className="shimmer h-9 w-9 rounded-full bg-muted" />
            </div>
          </Card>

          <div className={cn("grid gap-6", variant === "manager" ? "lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]" : "lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]")}>
            <Card className="panel p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="shimmer h-4 w-40 rounded-full bg-muted" />
                  <div className="shimmer h-3 w-64 rounded-full bg-muted/80" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: variant === "manager" ? 4 : 2 }).map((_, index) => (
                    <div key={index} className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                      <div className="shimmer mb-3 h-3 w-20 rounded-full bg-muted" />
                      <div className="shimmer h-16 rounded-2xl bg-muted/80" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="panel p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="shimmer h-4 w-28 rounded-full bg-muted" />
                  <div className="shimmer h-3 w-40 rounded-full bg-muted/80" />
                </div>
                {Array.from({ length: variant === "manager" ? 5 : 3 }).map((_, index) => (
                  <div key={index} className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                    <div className="shimmer mb-2 h-3 w-24 rounded-full bg-muted" />
                    <div className="shimmer h-10 rounded-xl bg-muted/80" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="panel mx-auto max-w-lg p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <LoadingSpinner size="lg" />
              </div>
              <div className="space-y-1.5">
                <p className="text-base font-semibold">{label}</p>
                <p className="text-sm text-muted-foreground">
                  {description ?? "Preparing your workspace and checking access."}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function EmptyStateCard({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: {
  title: string
  description: string
  icon?: LucideIcon
  action?: ReactNode
  className?: string
}) {
  return (
    <Card className={cn("panel flex min-h-[240px] flex-col items-center justify-center gap-4 p-8 text-center", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-7 w-7" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </Card>
  )
}

export function TableEmptyState({
  colSpan,
  title,
  description,
  icon,
  action,
}: {
  colSpan: number
  title: string
  description: string
  icon?: LucideIcon
  action?: ReactNode
}) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="p-0">
        <EmptyStateCard
          title={title}
          description={description}
          icon={icon}
          action={action}
          className="min-h-[220px] rounded-none border-0 bg-transparent shadow-none"
        />
      </TableCell>
    </TableRow>
  )
}

export function PageErrorState({
  title = "Something went wrong",
  message,
  retryLabel = "Try Again",
  onRetry,
}: {
  title?: string
  message: string
  retryLabel?: string
  onRetry?: () => void
}) {
  return (
    <div className="min-h-[280px] flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-lg p-6 space-y-4 panel">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        {onRetry && (
          <Button onClick={onRetry} className="w-full sm:w-auto">
            {retryLabel}
          </Button>
        )}
      </Card>
    </div>
  )
}
