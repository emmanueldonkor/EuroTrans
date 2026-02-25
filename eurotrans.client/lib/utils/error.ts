import { ApiRequestError } from "@/lib/api"

export function toActionErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    const lines = error.message
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

    if (lines.length >= 2) return lines[1]
    if (lines.length === 1) return lines[0]
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim()
  }

  return fallback
}
