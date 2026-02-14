import type { NextRequest } from "next/server"
import { auth0 } from "./lib/auth0"

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Run Auth0 middleware first
  const response = await auth0.middleware(request)

  // Protected routes (currently unused, but kept for future logic)
  const managerRoutes = ["/dashboard"]
  const driverRoutes = ["/driver"]

  const isManagerRoute = managerRoutes.some((route) => pathname.startsWith(route))
  const isDriverRoute = driverRoutes.some((route) => pathname.startsWith(route))

  // Add security headers to the response
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  )

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
