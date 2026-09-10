"use client"

/**
 * Single-flight token refresh helper.
 *
 * Đảm bảo tại mọi thời điểm chỉ có tối đa 1 HTTP request gửi đến
 * `/api/auth/refresh`. Dùng chung cho cả:
 * - AuthProvider (khôi phục phiên khi F5)
 * - apiClient interceptor (khi gặp 401)
 */

import { accessTokenStore } from "./access-token"

let refreshPromise: Promise<RefreshResult> | null = null

/**
 * Kết quả phân loại sau khi refresh:
 * - "refreshed": token mới đã lưu vào store
 * - "session_expired": phiên hết hạn (401/403) → cần đăng nhập lại
 * - "network_error": lỗi mạng hoặc server 5xx → không kết luận phiên hết hạn
 */
export type RefreshResult =
  | { status: "refreshed"; accessToken: string }
  | { status: "session_expired" }
  | { status: "superseded" }
  | { status: "network_error"; message: string }

async function doRefresh(): Promise<RefreshResult> {
  const version = accessTokenStore.getVersion()
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      cache: "no-store",
    })

    if (res.ok) {
      const json = await res.json()
      const accessToken = json?.data?.accessToken

      if (accessTokenStore.getVersion() !== version) return { status: "superseded" }

      if (typeof accessToken === "string" && accessToken.length > 0) {
        accessTokenStore.set(accessToken)
        return { status: "refreshed", accessToken }
      }

      // Backend trả 200 nhưng thiếu token → coi như phiên không hợp lệ
      accessTokenStore.clear()
      return { status: "session_expired" }
    }

    // 401 hoặc 403 → phiên hết hạn / bị thu hồi
    if (res.status === 401 || res.status === 403) {
      if (accessTokenStore.getVersion() !== version) return { status: "superseded" }
      accessTokenStore.clear()
      return { status: "session_expired" }
    }

    // Các status 5xx hoặc lỗi server khác → lỗi tạm thời
    return {
      status: "network_error",
      message: `Máy chủ trả về lỗi (${res.status})`,
    }
  } catch {
    return {
      status: "network_error",
      message: "Không thể kết nối đến máy chủ",
    }
  }
}

/**
 * Gọi refresh token. Nếu đã có 1 promise đang chạy, trả về cùng promise đó.
 * Sau khi hoàn thành (dù thành công hay thất bại), reset promise để lần
 * gọi kế tiếp sẽ tạo request mới.
 */
export async function refreshAccessToken(): Promise<RefreshResult> {
  if (!accessTokenStore.canRefresh()) return { status: "session_expired" }
  if (refreshPromise !== null) {
    return refreshPromise
  }

  refreshPromise = doRefresh().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

/** Wait for an existing cookie refresh without starting a new one. */
export async function waitForTokenRefresh(): Promise<void> {
  await refreshPromise
}
