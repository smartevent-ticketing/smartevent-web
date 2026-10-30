import type { ChatRequestPayload, ChatResponseDTO } from "@/features/chat/model/chat"
import { isChatResponse } from "@/features/chat/model/contract"

export class ChatServiceError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = "ChatServiceError"
    this.status = status
    this.code = code
  }
}

export async function sendChatMessage(
  payload: ChatRequestPayload,
  signal?: AbortSignal,
): Promise<ChatResponseDTO> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    signal,
  })
  let data: unknown
  try {
    data = await response.json()
  } catch {
    data = null
  }
  if (!response.ok) {
    const code =
      data && typeof data === "object" && "code" in data && typeof data.code === "string"
        ? data.code
        : "UPSTREAM_ERROR"
    const messages: Record<string, string> = {
      BACKEND_UNAVAILABLE: "Chưa tra cứu được dữ liệu sự kiện. Bạn vui lòng thử lại.",
      MODEL_UNAVAILABLE: "Trợ lý đang gặp sự cố xử lý câu hỏi. Bạn vui lòng thử lại.",
      KNOWLEDGE_UNAVAILABLE: "Chưa đọc được tài liệu hướng dẫn. Bạn vui lòng thử lại.",
      UPSTREAM_TIMEOUT: "Phản hồi mất nhiều thời gian. Bạn vui lòng thử lại.",
      INVALID_REQUEST: "Thông tin câu hỏi chưa hợp lệ. Bạn vui lòng sửa rồi gửi lại.",
      AI_UNAVAILABLE: "Chưa kết nối được trợ lý. Bạn vui lòng thử lại sau.",
      UPSTREAM_CONTRACT_ERROR: "Phản hồi chưa hợp lệ. Bạn vui lòng thử lại sau.",
      TOOL_DISABLED: "Tính năng tra cứu này chưa sẵn sàng.",
    }
    throw new ChatServiceError(
      response.status,
      code,
      messages[code] ?? "Trợ lý tạm thời chưa xử lý được yêu cầu. Bạn vui lòng thử lại.",
    )
  }
  if (!isChatResponse(data))
    throw new ChatServiceError(502, "UPSTREAM_CONTRACT_ERROR", "Phản hồi trợ lý không hợp lệ.")
  return data
}
