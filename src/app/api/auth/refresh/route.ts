import { NextRequest, NextResponse } from "next/server"

import type { components } from "@/lib/api/schema"
import {
  clearRefreshTokenCookie,
  extractRolesFromJwt,
  REFRESH_COOKIE_NAME,
  setRefreshTokenCookie,
} from "@/lib/auth/refresh-cookie"
import { SESSION_COOKIE_NAME } from "@/lib/constants"

type RefreshApiResponse = components["schemas"]["ApiResponseTokenRefreshResponse"]

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value

  // 1. Kiểm tra cookie
  if (!refreshToken) {
    return NextResponse.json(
      {
        success: false,
        message: "Không tìm thấy phiên đăng nhập",
      },
      { status: 401 },
    )
  }

  const apiBaseUrl = process.env.API_BASE_URL

  if (!apiBaseUrl) {
    return NextResponse.json(
      {
        success: false,
        message: "Máy chủ chưa được cấu hình",
      },
      { status: 500 },
    )
  }

  // 2. Gửi refresh token sang Spring Boot
  let backendResponse: Response

  try {
    backendResponse = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/v1/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Không thể kết nối đến máy chủ",
      },
      { status: 502 },
    )
  }

  // 3. Parse JSON từ Backend an toàn
  let payload: RefreshApiResponse

  try {
    payload = (await backendResponse.json()) as RefreshApiResponse
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Phản hồi từ máy chủ không hợp lệ",
      },
      { status: 502 },
    )
  }

  const refreshData = payload.data

  // 4. Nếu backend từ chối (token hết hạn, không hợp lệ, hoặc đã bị thu hồi)
  if (!backendResponse.ok) {
    const errorResponse = NextResponse.json(payload, {
      status: backendResponse.status,
    })

    // Nếu là lỗi xác thực (401/403), xóa cookie hỏng để tránh client tiếp tục gửi lại
    if (backendResponse.status === 401 || backendResponse.status === 403) {
      clearRefreshTokenCookie(errorResponse)
    }

    return errorResponse
  }

  // 5. Backend trả 200 nhưng payload thiếu token
  if (!refreshData?.accessToken || !refreshData.refreshToken) {
    return NextResponse.json(
      {
        success: false,
        message: "Phản hồi từ máy chủ không hợp lệ",
      },
      { status: 502 },
    )
  }

  // 6. Thành công: Xoay vòng token (Token Rotation)
  const { refreshToken: newRefreshToken, ...safeData } = refreshData

  const response = NextResponse.json(
    {
      ...payload,
      data: safeData,
    },
    {
      status: 200,
    },
  )

  // Cập nhật refresh token MỚI vào HttpOnly cookie, giữ lại vai trò nếu JWT không chứa roles
  const currentSessionRoles = request.cookies
    .get(SESSION_COOKIE_NAME)
    ?.value?.split(",")
    .map((r) => r.trim())
    .filter(Boolean)

  const jwtRoles = extractRolesFromJwt(safeData.accessToken)
  const effectiveRoles =
    jwtRoles.length > 0
      ? jwtRoles
      : currentSessionRoles && currentSessionRoles.length > 0
        ? currentSessionRoles
        : undefined

  setRefreshTokenCookie(response, newRefreshToken, effectiveRoles, safeData.accessToken)

  return response
}
