"use client"

import { useCallback, useRef, useState } from "react"

import { sendChatMessage } from "@/features/chat/api/chat-api"
import type { ChatMessage, DialogueState } from "@/features/chat/model/chat"

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome-msg",
  role: "assistant",
  content:
    "Xin chào! Tôi là trợ lý AI của SmartEvent. Tôi có thể hỗ trợ bạn tìm kiếm sự kiện, giải đáp thông tin vé, phân tích ngân sách hoặc tra cứu chính sách.",
  createdAt: new Date().toISOString(),
  intent: "GREETING",
  grounding: "NO_LIVE_DATA",
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [dialogueState, setDialogueState] = useState<DialogueState>({})
  const requestCounterRef = useRef(0)

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const clearHistory = useCallback(() => {
    requestCounterRef.current += 1
    setMessages([
      {
        ...INITIAL_MESSAGE,
        id: createId(),
        createdAt: new Date().toISOString(),
      },
    ])
    setConversationId(null)
    setDialogueState({})
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isLoading) return

      const currentRequestId = ++requestCounterRef.current
      const userMessageId = createId()
      const userMessage: ChatMessage = {
        id: userMessageId,
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)

      try {
        const data = await sendChatMessage({
          message: trimmed,
          conversation_id: conversationId || undefined,
          previous_state: dialogueState,
        })

        if (currentRequestId !== requestCounterRef.current) {
          return
        }

        setConversationId(data.conversation_id)
        setDialogueState(data.state || {})

        const assistantMessage: ChatMessage = {
          id: createId(),
          role: "assistant",
          content: data.answer,
          createdAt: new Date().toISOString(),
          intent: data.intent,
          grounding: data.grounding,
          tool_called: data.tool_called,
          citations: data.citations,
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch {
        if (currentRequestId !== requestCounterRef.current) {
          return
        }
        const errorAssistantMessage: ChatMessage = {
          id: createId(),
          role: "assistant",
          content:
            "Không thể gửi tin nhắn đến trợ lý SmartEvent. Vui lòng kiểm tra lại kết nối mạng.",
          createdAt: new Date().toISOString(),
          intent: "NETWORK_ERROR",
          grounding: "NO_LIVE_DATA",
        }
        setMessages((prev) => [...prev, errorAssistantMessage])
      } finally {
        if (currentRequestId === requestCounterRef.current) {
          setIsLoading(false)
        }
      }
    },
    [conversationId, dialogueState, isLoading],
  )

  return {
    messages,
    isOpen,
    isLoading,
    conversationId,
    dialogueState,
    toggleOpen,
    clearHistory,
    sendMessage,
  }
}
