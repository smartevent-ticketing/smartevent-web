import type { ChatRequestPayload, ChatResponseDTO } from "@/features/chat"

export const dynamic = "force-dynamic"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const VALID_DOMAIN_INTENTS = new Set([
  "GREETING",
  "SEARCH_EVENT",
  "EVENT_DETAIL",
  "TICKET_RECOMMEND",
  "TICKET_AVAILABILITY",
  "ORDER_STATUS",
  "PAYMENT_STATUS",
  "MY_TICKETS",
  "REFUND_POLICY",
  "POLICY_FAQ",
  "PUBLIC_HELP",
  "BOOKING_GUIDANCE",
  "OUT_OF_SCOPE",
  "CLARIFY",
])

function sanitizePreviousState(
  state?: ChatRequestPayload["previous_state"],
): Record<string, unknown> {
  if (!state || typeof state !== "object") return {}
  const sanitized = { ...state }
  if (sanitized.active_intent && !VALID_DOMAIN_INTENTS.has(sanitized.active_intent)) {
    delete sanitized.active_intent
  }
  return sanitized
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json(
      {
        success: false,
        message: "Dữ liệu yêu cầu không hợp lệ (Invalid JSON)",
      },
      { status: 400 },
    )
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("message" in body) ||
    typeof (body as { message: unknown }).message !== "string"
  ) {
    return Response.json(
      {
        success: false,
        message: "Nội dung câu hỏi (message) không được để trống",
      },
      { status: 400 },
    )
  }

  const payload = body as ChatRequestPayload
  const rawMessage = payload.message.trim()

  if (!rawMessage) {
    return Response.json(
      {
        success: false,
        message: "Nội dung tin nhắn không thể chỉ chứa khoảng trắng",
      },
      { status: 400 },
    )
  }

  if (rawMessage.length > 2000) {
    return Response.json(
      {
        success: false,
        message: "Tin nhắn quá dài (tối đa 2000 ký tự)",
      },
      { status: 400 },
    )
  }

  const aiServiceUrl = (process.env.AI_SERVICE_URL || "http://127.0.0.1:8001").replace(/\/$/, "")

  const safeConversationId =
    payload.conversation_id && UUID_REGEX.test(payload.conversation_id)
      ? payload.conversation_id
      : undefined

  const safePreviousState = sanitizePreviousState(payload.previous_state)

  try {
    const upstreamResponse = await fetch(`${aiServiceUrl}/api/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        message: rawMessage,
        conversation_id: safeConversationId,
        previous_state: safePreviousState,
      }),
      signal:
        typeof AbortSignal.any === "function" && request.signal
          ? AbortSignal.any([request.signal, AbortSignal.timeout(30000)])
          : AbortSignal.timeout(30000),
    })

    if (!upstreamResponse.ok) {
      let code = [400, 422].includes(upstreamResponse.status) ? "INVALID_REQUEST" : "UPSTREAM_ERROR"
      try {
        const error = await upstreamResponse.json()
        const allowed = new Set([
          "BACKEND_UNAVAILABLE",
          "MODEL_UNAVAILABLE",
          "KNOWLEDGE_UNAVAILABLE",
          "UPSTREAM_TIMEOUT",
          "INVALID_REQUEST",
          "UPSTREAM_CONTRACT_ERROR",
          "TOOL_DISABLED",
        ])
        if (typeof error.code === "string" && allowed.has(error.code)) code = error.code
      } catch {
        /* Never reflect an untrusted upstream error body. */
      }
      return Response.json(
        { code, message: "Trợ lý chưa xử lý được yêu cầu. Vui lòng thử lại." },
        { status: upstreamResponse.status },
      )
    }

    const data = (await upstreamResponse.json()) as ChatResponseDTO
    if (
      !data ||
      typeof data.answer !== "string" ||
      typeof data.conversation_id !== "string" ||
      !data.state ||
      typeof data.state !== "object"
    ) {
      return Response.json(
        { code: "UPSTREAM_CONTRACT_ERROR", message: "Phản hồi trợ lý không hợp lệ." },
        { status: 502 },
      )
    }
    return Response.json(data, { status: 200 })
  } catch (error) {
    const timeout =
      error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")
    return Response.json(
      {
        code: timeout ? "UPSTREAM_TIMEOUT" : "AI_UNAVAILABLE",
        message: timeout
          ? "Trợ lý phản hồi quá lâu. Bạn vui lòng thử lại."
          : "Chưa kết nối được trợ lý. Bạn vui lòng thử lại.",
      },
      { status: timeout ? 504 : 502 },
    )
  }
}
