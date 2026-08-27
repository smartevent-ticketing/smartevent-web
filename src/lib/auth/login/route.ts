import { NextResponse } from "next/server"

import type { components } from "@/lib/api/schema"

type LoginRequest = components["schemas"]["LoginRequest"]
type LoginApiResponse =
  components["schemas"]["ApiResponseLoginResponse"]

const REFRESH_COOKIE_NAME = "smartevent_refresh_token"
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60

export async function POST(request: Request) {
  let loginRequest: LoginRequest

  try {
    loginRequest = (await request.json()) as LoginRequest
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Dữ liệu đăng nhập không hợp lệ",
      },
      { status: 400 },
    )
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  if (!apiBaseUrl) {
    return NextResponse.json(
      {
        success: false,
        message: "Máy chủ chưa được cấu hình",
      },
      { status: 500 },
    )
  }

  let backendResponse: Response

  try {
    backendResponse = await fetch(
      `${apiBaseUrl.replace(/\/$/, "")}/api/v1/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginRequest),
        cache: "no-store",
      },
    )
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Không thể kết nối đến máy chủ",
      },
      { status: 502 },
    )
  }

  const payload = (await backendResponse.json()) as LoginApiResponse
  const loginData = payload.data

  if (
    !backendResponse.ok ||
    !loginData?.accessToken ||
    !loginData.refreshToken
  ) {
    return NextResponse.json(payload, {
      status: backendResponse.status,
    })
  }

  const { refreshToken, ...safeLoginData } = loginData

  const response = NextResponse.json(
    {
      ...payload,
      data: safeLoginData,
    },
    {
      status: backendResponse.status,
    },
  )

  response.cookies.set({
    name: REFRESH_COOKIE_NAME,
    value: refreshToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    maxAge: REFRESH_COOKIE_MAX_AGE,
  })

  return response
}