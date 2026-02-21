import { auth0 } from "@/lib/auth0"
import { NextRequest } from "next/server"

const BACKEND_BASE_URL = process.env.EUROTRANS_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5002"
const ACCESS_TOKEN_EXPIRY_BUFFER_SECONDS = 30

function unauthorized(detail: string) {
  return Response.json({ detail }, { status: 401 })
}

async function handler(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const session = await auth0.getSession(request)
  if (!session?.tokenSet) {
    return unauthorized("Unauthorized: no active session")
  }

  const nowInSeconds = Math.floor(Date.now() / 1000)
  const isTokenNearExpiry = session.tokenSet.expiresAt <= nowInSeconds + ACCESS_TOKEN_EXPIRY_BUFFER_SECONDS

  let accessToken = session.tokenSet.accessToken
  if (isTokenNearExpiry) {
    try {
      const refreshedToken = await auth0.getAccessToken({ refresh: true })
      accessToken = refreshedToken.token
    } catch {
      return unauthorized("Unauthorized: failed to refresh access token")
    }
  }

  if (!accessToken) {
    return unauthorized("Unauthorized: missing access token")
  }

  const { path } = await context.params
  const targetUrl = new URL(`${BACKEND_BASE_URL}/${path.join("/")}${request.nextUrl.search}`)

  const headers = new Headers()
  headers.set("Authorization", `Bearer ${accessToken}`)

  const accept = request.headers.get("accept")
  if (accept) headers.set("accept", accept)

  const contentType = request.headers.get("content-type")
  if (contentType) headers.set("content-type", contentType)

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    const bodyBuffer = await request.arrayBuffer()
    if (bodyBuffer.byteLength > 0) {
      init.body = bodyBuffer
    }
  }

  const upstream = await fetch(targetUrl, init)

  const responseHeaders = new Headers()
  const upstreamContentType = upstream.headers.get("content-type")
  if (upstreamContentType) {
    responseHeaders.set("content-type", upstreamContentType)
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  })
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE, handler as OPTIONS }
