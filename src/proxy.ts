import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ROUTES, SESSION_COOKIE_NAME } from "@/lib/constants"

/**
 * Next.js Edge Proxy for Server-Level Route Protection.
 * Replaces the deprecated middleware convention in Next.js 16+.
 * Protects private workspace and account pages, checks roles,
 * and prevents authenticated users from landing on auth pages (/login, /register).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const isAuthenticated = Boolean(sessionCookie && sessionCookie.trim().length > 0)
  const roles = sessionCookie ? sessionCookie.split(",").map((r) => r.trim().toUpperCase()) : []

  const hasAnyRole = (...requiredRoles: string[]) => {
    // If session cookie is simply "authenticated" (no explicit roles stored),
    // allow access to role-protected pages and let client/API enforce strict permissions.
    if (roles.includes("AUTHENTICATED") || roles.includes("1")) {
      return true
    }
    return requiredRoles.some(
      (role) => roles.includes(role.toUpperCase()) || roles.includes(`ROLE_${role.toUpperCase()}`),
    )
  }

  // ── 1. GUEST-ONLY ROUTES (/login, /register) ──
  const isAuthRoute = pathname === ROUTES.AUTH.LOGIN || pathname === ROUTES.AUTH.REGISTER
  if (isAuthRoute) {
    if (isAuthenticated) {
      const callbackUrl = request.nextUrl.searchParams.get("callbackUrl")
      const redirectTarget =
        callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
          ? callbackUrl
          : ROUTES.ACCOUNT.ROOT
      return NextResponse.redirect(new URL(redirectTarget, request.url))
    }
    return NextResponse.next()
  }

  // ── 2. PROTECTED ROUTES ──
  const isAccountRoute =
    pathname.startsWith(ROUTES.ACCOUNT.ROOT) ||
    pathname.startsWith(ROUTES.ACCOUNT.CHECKOUT) ||
    pathname.startsWith(ROUTES.ACCOUNT.PAYMENT) ||
    pathname.startsWith("/reservations")

  const isAdminRoute = pathname.startsWith(ROUTES.ADMIN.ROOT)
  const isOrganizerRoute = pathname.startsWith(ROUTES.ORGANIZER.ROOT)
  const isCheckinRoute = pathname.startsWith(ROUTES.CHECKIN.ROOT)

  const isProtectedRoute = isAccountRoute || isAdminRoute || isOrganizerRoute || isCheckinRoute

  if (isProtectedRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url)
      loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`)
      return NextResponse.redirect(loginUrl)
    }

    // Role-based authorization checks
    if (isAdminRoute && !hasAnyRole("ADMIN")) {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url))
    }

    if (isOrganizerRoute && !hasAnyRole("ORGANIZER", "ADMIN")) {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url))
    }

    if (isCheckinRoute && !hasAnyRole("STAFF", "ORGANIZER", "ADMIN")) {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (/api/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files with extensions (svg, png, jpg, jpeg, gif, webp, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
