import type { ChatRequestPayload, ChatResponseDTO } from "@/features/chat"

export const dynamic = "force-dynamic"

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

  const aiServiceUrl = (process.env.AI_SERVICE_URL || "http://127.0.0.1:8000").replace(/\/$/, "")

  try {
    const upstreamResponse = await fetch(`${aiServiceUrl}/api/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        message: rawMessage,
        conversation_id: payload.conversation_id || undefined,
        previous_state: payload.previous_state || {},
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!upstreamResponse.ok) {
      return Response.json(
        createFallbackResponse(
          payload,
          "Trợ lý AI SmartEvent tạm thời không thể phản hồi câu hỏi này. Bạn vui lòng thử lại sau.",
        ),
        { status: 200 },
      )
    }

    const data = (await upstreamResponse.json()) as ChatResponseDTO
    return Response.json(data, { status: 200 })
  } catch {
    return Response.json(
      createFallbackResponse(
        payload,
        "Không thể kết nối đến máy chủ trợ lý AI SmartEvent. Vui lòng kiểm tra lại dịch vụ.",
      ),
      { status: 200 },
    )
  }
}

function createFallbackResponse(
  payload: ChatRequestPayload,
  fallbackMessage: string,
): ChatResponseDTO {
  return {
    conversation_id: payload.conversation_id || crypto.randomUUID(),
    intent: "OFFLINE",
    state: payload.previous_state || {},
    answer: fallbackMessage,
    grounding: "NO_LIVE_DATA",
    tool_called: null,
    citations: [],
  }
}
