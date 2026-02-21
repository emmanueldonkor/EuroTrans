"use server"

import { auth0 } from "./auth0";
import type { User, UserRole } from "./types"

// Helper to decode JWT payload without external library
function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split(".")
        if (parts.length !== 3) return null
        return JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")) as Record<string, unknown>
    } catch (e) {
        console.error("Failed to decode JWT:", e)
        return null
    }
}

export async function getSessionUser(): Promise<User | null> {
    try {
        const session = await auth0.getSession()

        if (!session || !session.user) {
            return null
        }

        // 1. Get Access Token from tokenSet
        const accessToken = session.tokenSet?.accessToken

        let roles: string[] = []

        if (accessToken) {
            const decodedAccessToken = decodeJwtPayload(accessToken)
            if (decodedAccessToken) {
                const rawRoles = decodedAccessToken["https://eurotrans.api/roles"]
                if (Array.isArray(rawRoles)) {
                    roles = rawRoles.filter((role): role is string => typeof role === "string")
                }
            }
        }

        // Determine the primary role for the application
        // Default to 'guest' if no role is found
        let role: UserRole = "guest"

        if (roles && roles.includes("manager")) {
            role = "manager"
        } else if (roles && roles.includes("driver")) {
            role = "driver"
        }

        return {
            id: session.user.sub,
            name: session.user.name || session.user.email || "Unknown User",
            email: session.user.email || "",
            role: role,
        }
    } catch (error) {
        console.error("Error fetching session:", error)
        return null
    }
}
