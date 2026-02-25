import { AlertTriangle } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function FullPageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md p-6 text-center space-y-4 panel">
        <div className="flex justify-center">
          <LoadingSpinner />
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
        <LoadingSpinner size="sm" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
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
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
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
