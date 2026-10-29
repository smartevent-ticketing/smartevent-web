import type { ChatRequestPayload, ChatResponseDTO } from "@/features/chat/model/chat"

export async function sendChatMessage(payload: ChatRequestPayload): Promise<ChatResponseDTO> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Lỗi kết nối API chat")
  }

  return (await response.json()) as ChatResponseDTO
}
