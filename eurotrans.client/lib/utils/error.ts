import { ApiRequestError } from "@/lib/api"

export function toActionErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    if (error.message.trim().length > 0) return error.message.trim()
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim()
  }

  return fallback
}
