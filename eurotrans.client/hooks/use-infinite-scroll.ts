import { useEffect, useRef } from "react"

type UseInfiniteScrollOptions = {
  hasMore: boolean
  enabled?: boolean
  rootMargin?: string
  onLoadMore: () => void
}

export function useInfiniteScroll({
  hasMore,
  enabled = true,
  rootMargin = "240px",
  onLoadMore,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!enabled || !hasMore) return

    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMore()
        }
      },
      { rootMargin },
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [enabled, hasMore, onLoadMore, rootMargin])

  return sentinelRef
}
