"use client"

import createClient, { type Middleware } from "openapi-fetch"

import { accessTokenStore } from "@/lib/auth/access-token"
import { refreshAccessToken } from "@/lib/auth/token-refresher"

import type { paths } from "./schema"
import type { EventSetupPaths } from "./event-setup-contract"

// ─── Cấu hình ─────────────────────────────────────────────

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

if (!apiBaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_API_BASE_URL")
}

// ─── Middleware gắn Bearer token ──────────────────────────

const authMiddleware: Middleware = {
  onRequest({ request }) {
    const accessToken = accessTokenStore.get()

    if (accessToken) {
      request.headers.set("Authorization", `Bearer ${accessToken}`)
    }

    return request
  },
}

// ─── Middleware xử lý 401 với single-flight refresh ───────

/** Các path không nên tự retry (tránh vòng lặp hoặc retry POST tạo dữ liệu) */
const SKIP_RETRY_PATHS = ["/api/v1/auth/login", "/api/v1/auth/refresh-token", "/api/v1/auth/logout"]

const refreshMiddleware: Middleware = {
  async onResponse({ request, response }) {
    if (response.status !== 401) {
      return response
    }

    // Không retry nếu là endpoint auth (tránh vòng lặp)
    const url = new URL(request.url)
    if (SKIP_RETRY_PATHS.some((p) => url.pathname.endsWith(p))) {
      return response
    }

    // Gọi single-flight refresh
    const result = await refreshAccessToken()

    if (result.status !== "refreshed") {
      // Phiên hết hạn hoặc lỗi mạng → trả response 401 gốc
      return response
    }

    // Retry request gốc với token mới (đúng 1 lần)
    const retryRequest = request.clone()
    retryRequest.headers.set("Authorization", `Bearer ${result.accessToken}`)

    return fetch(retryRequest)
  },
}

// ─── Query Serializer hỗ trợ Spring Data Pageable ────────

const serializeQueryParams = (queryParams: Record<string, unknown>) => {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(queryParams)) {
    if (value === undefined || value === null) continue
    if (key === "pageable" && typeof value === "object" && !Array.isArray(value)) {
      const p = value as Record<string, unknown>
      if (p.page !== undefined) searchParams.set("page", String(p.page))
      if (p.size !== undefined) searchParams.set("size", String(p.size))
      if (p.sort) {
        if (Array.isArray(p.sort)) {
          p.sort.forEach((s) => searchParams.append("sort", String(s)))
        } else {
          searchParams.set("sort", String(p.sort))
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)))
    } else if (typeof value === "object") {
      for (const [subKey, subVal] of Object.entries(value as Record<string, unknown>)) {
        if (subVal !== undefined && subVal !== null) {
          searchParams.append(`${key}.${subKey}`, String(subVal))
        }
      }
    } else {
      searchParams.set(key, String(value))
    }
  }
  return searchParams.toString()
}

// ─── Client instance ──────────────────────────────────────

export const apiClient = createClient<paths & EventSetupPaths>({
  baseUrl: apiBaseUrl,
  querySerializer: serializeQueryParams,
})

apiClient.use(authMiddleware)
apiClient.use(refreshMiddleware)

// ─── Kiểu lỗi API chuẩn hóa ─────────────────────────────

export interface ApiError {
  message: string
  status?: number
}

export interface ApiResult<T> {
  data: T | null
  error: ApiError | null
}
