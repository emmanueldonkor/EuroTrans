export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full border-primary/30 border-t-primary shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_20%,transparent)] animate-spin`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}
