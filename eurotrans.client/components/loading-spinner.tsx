import { LoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type LoadingSpinnerSize = "sm" | "md" | "lg"

const spinnerSizes: Record<
  LoadingSpinnerSize,
  {
    container: string
    icon: string
  }
> = {
  sm: {
    container: "h-5 w-5",
    icon: "h-3 w-3",
  },
  md: {
    container: "h-10 w-10",
    icon: "h-5 w-5",
  },
  lg: {
    container: "h-14 w-14",
    icon: "h-7 w-7",
  },
}

export function LoadingSpinner({ size = "md" }: { size?: LoadingSpinnerSize }) {
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", spinnerSizes[size].container)}
      role="status"
      aria-label="Loading"
    >
      <span className="absolute inset-0 rounded-full border border-primary/20" />
      <span
        className="absolute inset-[2px] rounded-full border-2 border-transparent border-t-primary border-r-primary/60 animate-spin"
        style={{ animationDuration: "0.85s" }}
      />
      <span className="absolute inset-[24%] rounded-full bg-primary/8 blur-[1px]" />
      <LoaderCircle
        className={cn("relative text-primary/80 animate-spin", spinnerSizes[size].icon)}
        style={{ animationDuration: "1.2s" }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
