import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-[var(--space-section)] animate-fade-in", className)}>{children}</div>
}

export function PageHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>{children}</div>
  )
}

export function PageHeading({
  title,
  description,
  className,
}: {
  title: string
  description?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl [font-family:var(--font-display)]">{title}</h1>
      {description ? <p className="text-sm text-muted-foreground sm:text-base">{description}</p> : null}
    </div>
  )
}

export function PageSurface({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("panel", className)}>{children}</div>
}
