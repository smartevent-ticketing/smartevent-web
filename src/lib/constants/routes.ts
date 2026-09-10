/**
 * Application route constants
 * Centralizes all navigation paths and internal API routes across the application.
 */

export const ROUTES = {
  HOME: "/",
  STOREFRONT: {
    EVENTS: "/events",
    EVENT_DETAIL: (slug: string) => `/events/${slug}`,
  },
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
  },
  ACCOUNT: {
    ROOT: "/account",
    CHECKOUT: "/checkout",
    PAYMENT: "/payment",
    PAYMENT_VNPAY_RETURN: "/payment/vnpay-return",
    RESERVATION: (id: string) => `/reservations/${id}`,
  },
  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin/dashboard",
    APPROVALS: "/admin/approvals",
    CATEGORIES: "/admin/categories",
    VENUES: "/admin/venues",
    OUTBOX: "/admin/outbox",
  },
  ORGANIZER: {
    ROOT: "/organizer",
    DASHBOARD: "/organizer/dashboard",
    EVENTS: "/organizer/events",
    CREATE_EVENT: "/organizer/events/new",
    INVENTORY: "/organizer/inventory",
  },
  CHECKIN: {
    ROOT: "/checkin",
    HISTORY: "/checkin/history",
  },
} as const

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
  },
} as const

export const AUTH_ROLES = {
  ADMIN: "ROLE_ADMIN",
  ORGANIZER: "ROLE_ORGANIZER",
  STAFF: "ROLE_STAFF",
  CUSTOMER: "ROLE_CUSTOMER",
} as const

export const SESSION_COOKIE_NAME = "smartevent_session"
