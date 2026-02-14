export { getSessionUser } from "./auth-actions"
import type { UserRole } from "./types"

export async function logout(): Promise<void> {
  window.location.href = "/auth/logout"
}

export function getRedirectPath(role: UserRole): string {
  if (role === "manager") return "/dashboard"
  if (role === "driver") return "/driver"
  return "/access-denied"
}
