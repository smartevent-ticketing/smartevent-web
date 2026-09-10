import "server-only"

import type { NextResponse } from "next/server"
import { SESSION_COOKIE_NAME } from "@/lib/constants"

export const REFRESH_COOKIE_NAME = "smartevent_refresh_token"

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60

export function extractRolesFromJwt(token?: string): string[] {
  if (!token || typeof token !== "string") return []
  try {
    const parts = token.split(".")
    if (parts.length < 2) return []
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const jsonStr = Buffer.from(base64, "base64").toString("utf-8")
    const payload = JSON.parse(jsonStr)

    if (Array.isArray(payload.roles)) return payload.roles.map(String)
    if (Array.isArray(payload.authorities)) {
      return payload.authorities.map((a: unknown) =>
        typeof a === "object" && a !== null && "authority" in a
          ? (a as { authority: string }).authority
          : String(a),
      )
    }
    if (typeof payload.scope === "string") return payload.scope.split(" ")
    if (typeof payload.role === "string") return [payload.role]
    if (Array.isArray(payload.role)) return payload.role.map(String)
    if (payload.realm_access && Array.isArray(payload.realm_access.roles)) {
      return payload.realm_access.roles.map(String)
    }
  } catch {
    // ignore decoding errors
  }
  return []
}

export function setRefreshTokenCookie(
  response: NextResponse,
  refreshToken: string,
  roles?: string[],
  accessToken?: string,
): void {
  const resolvedRoles = roles && roles.length > 0 ? roles : extractRolesFromJwt(accessToken)

  response.cookies.set({
    name: REFRESH_COOKIE_NAME,
    value: refreshToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    maxAge: REFRESH_COOKIE_MAX_AGE,
  })

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: resolvedRoles.length > 0 ? resolvedRoles.join(",") : "ROLE_CUSTOMER",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_COOKIE_MAX_AGE,
  })
}

export function clearRefreshTokenCookie(response: NextResponse): void {
  response.cookies.set({
    name: REFRESH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    maxAge: 0,
  })

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}
