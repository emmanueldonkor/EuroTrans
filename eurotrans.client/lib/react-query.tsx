"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { ApiRequestError } from "@/lib/api"

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiRequestError && (error.status === 401 || error.status === 403)) {
            return false
          }

          return failureCount < 2
        },
      },
    },
  }))

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
