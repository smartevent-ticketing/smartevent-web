import { NextRequest, NextResponse } from "next/server"

import { clearRefreshTokenCookie, REFRESH_COOKIE_NAME } from "@/lib/auth/refresh-cookie"

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value

  let message = "Đã xóa phiên đăng nhập cục bộ"

  // Nếu có refresh token, gửi sang Spring Boot để thu hồi (revoke)
  if (refreshToken) {
    const apiBaseUrl = process.env.API_BASE_URL

    if (apiBaseUrl) {
      try {
        const backendResponse = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/v1/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
          cache: "no-store",
        })

        if (backendResponse.ok) {
          message = "Đăng xuất thành công"
        } else {
          message = "Đã xóa phiên đăng nhập cục bộ (máy chủ không thể thu hồi token)"
        }
      } catch {
        // Backend không kết nối được: không throw lỗi để client vẫn xóa được phiên cục bộ
        message = "Đã xóa phiên đăng nhập cục bộ (không thể kết nối đến máy chủ)"
      }
    }
  }

  // Luôn trả về 200 OK và xóa cookie local
  const response = NextResponse.json({
    success: true,
    message,
  })

  clearRefreshTokenCookie(response)

  return response
}
