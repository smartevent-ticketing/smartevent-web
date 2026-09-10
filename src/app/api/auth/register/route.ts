import { NextResponse } from "next/server"

import type { components } from "@/lib/api/schema"

type RegisterApiResponse = components["schemas"]["ApiResponseUserResponse"]

function isValidRegisterBody(
  body: unknown,
): body is { email: string; password: string; fullName: string; phone?: string } {
  if (typeof body !== "object" || body === null) {
    return false
  }

  const candidate = body as Record<string, unknown>

  return (
    typeof candidate.email === "string" &&
    typeof candidate.password === "string" &&
    typeof candidate.fullName === "string" &&
    candidate.email.trim().length > 0 &&
    candidate.password.length >= 8 &&
    candidate.fullName.trim().length > 0 &&
    (candidate.phone === undefined ||
      candidate.phone === null ||
      typeof candidate.phone === "string")
  )
}

export async function POST(request: Request) {
  let rawBody: unknown

  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Dữ liệu đăng ký không hợp lệ",
      },
      { status: 400 },
    )
  }

  if (!isValidRegisterBody(rawBody)) {
    return NextResponse.json(
      {
        success: false,
        message: "Vui lòng điền đầy đủ họ tên, email và mật khẩu (tối thiểu 8 ký tự)",
      },
      { status: 400 },
    )
  }

  const registerRequest = {
    email: rawBody.email.trim(),
    password: rawBody.password,
    fullName: rawBody.fullName.trim(),
    ...(typeof rawBody.phone === "string" && rawBody.phone.trim().length > 0
      ? { phone: rawBody.phone.trim() }
      : {}),
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

  // Gọi backend Spring Boot
  let backendResponse: Response

  try {
    backendResponse = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerRequest),
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

  // Parse response
  let payload: RegisterApiResponse

  try {
    payload = (await backendResponse.json()) as RegisterApiResponse
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Phản hồi từ máy chủ không hợp lệ",
      },
      { status: 502 },
    )
  }

  // Trả lại response từ backend (không lộ thông tin nội bộ)
  return NextResponse.json(payload, {
    status: backendResponse.status,
  })
}
