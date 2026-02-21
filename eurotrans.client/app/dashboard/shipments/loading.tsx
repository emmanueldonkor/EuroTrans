export default function Loading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="h-14 w-72 rounded-lg bg-muted/60 animate-pulse" />
      <div className="rounded-xl border bg-card/90 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="h-10 rounded-md bg-muted/60 shimmer" />
          <div className="h-10 rounded-md bg-muted/60 shimmer" />
          <div className="h-10 rounded-md bg-muted/60 shimmer" />
        </div>
      </div>
      <div className="rounded-xl border bg-card/90 p-4">
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="grid grid-cols-5 gap-3">
              <div className="h-6 rounded bg-muted/60 shimmer" />
              <div className="h-6 rounded bg-muted/60 shimmer" />
              <div className="h-6 rounded bg-muted/60 shimmer" />
              <div className="h-6 rounded bg-muted/60 shimmer" />
              <div className="h-6 rounded bg-muted/60 shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
