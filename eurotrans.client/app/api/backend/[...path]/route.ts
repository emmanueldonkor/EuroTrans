import { auth0 } from "@/lib/auth0"
import { NextRequest } from "next/server"

const BACKEND_BASE_URL = process.env.EUROTRANS_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5002"

async function handler(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  let accessToken: string | undefined

  try {
    const tokenResult = await auth0.getAccessToken()
    accessToken = tokenResult.token
  } catch {
    // Refresh flow can fail when there is no active session yet.
  }

  if (!accessToken) {
    // Fallback to the current session token if refresh path is unavailable.
    const session = await auth0.getSession(request)
    accessToken = session?.tokenSet?.accessToken
  }

  if (!accessToken) {
    return Response.json(
      {
        detail: "Unauthorized: missing access token",
      },
      { status: 401 },
    )
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
