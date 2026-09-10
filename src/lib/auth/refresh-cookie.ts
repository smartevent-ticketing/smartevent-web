import "server-only"

import type { NextResponse } from "next/server"
import { SESSION_COOKIE_NAME } from "@/lib/constants"

export const REFRESH_COOKIE_NAME = "smartevent_refresh_token"

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60

export function setRefreshTokenCookie(
  response: NextResponse,
  refreshToken: string,
  roles?: string[],
): void {
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
    value: roles && roles.length > 0 ? roles.join(",") : "authenticated",
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
