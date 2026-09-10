import { NextResponse } from "next/server"

import type { components } from "@/lib/api/schema"
import { setRefreshTokenCookie } from "@/lib/auth/refresh-cookie"

type LoginApiResponse = components["schemas"]["ApiResponseLoginResponse"]

export async function POST(request: Request) {
  let rawBody: unknown

  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Dữ liệu đăng nhập không hợp lệ",
      },
      { status: 400 },
    )
  }

  if (!isValidLoginBody(rawBody)) {
    return NextResponse.json(
      {
        success: false,
        message: "Email và mật khẩu không được để trống",
      },
      { status: 400 },
    )
  }

  const loginRequest = {
    email: rawBody.email.trim(),
    password: rawBody.password,
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

  let backendResponse: Response

  try {
    backendResponse = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginRequest),
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

  let payload: LoginApiResponse

  try {
    payload = (await backendResponse.json()) as LoginApiResponse
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Phản hồi từ máy chủ không hợp lệ",
      },
      { status: 502 },
    )
  }

  const loginData = payload.data

  // 1. Backend chủ động từ chối (401 sai pass, 429 spam request, 400 bad request...)
  if (!backendResponse.ok) {
    return NextResponse.json(payload, {
      status: backendResponse.status,
    })
  }

  // 2. Backend trả 200 OK nhưng payload bị thiếu token (dữ liệu upstream không hợp lệ)
  if (!loginData?.accessToken || !loginData.refreshToken) {
    return NextResponse.json(
      {
        success: false,
        message: "Phản hồi từ máy chủ không hợp lệ",
      },
      { status: 502 },
    )
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

  setRefreshTokenCookie(response, refreshToken, safeLoginData.user?.roles)

  return response
}

function isValidLoginBody(body: unknown): body is { email: string; password: string } {
  if (typeof body !== "object" || body === null) {
    return false
  }

  const candidate = body as Record<string, unknown>

  return (
    typeof candidate.email === "string" &&
    typeof candidate.password === "string" &&
    candidate.email.trim().length > 0 &&
    candidate.password.length > 0
  )
}
