import "server-only"

import type { NextResponse } from "next/server"

export const REFRESH_COOKIE_NAME = "smartevent_refresh_token"

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60

export function setRefreshTokenCookie(response: NextResponse, refreshToken: string): void {

}
    