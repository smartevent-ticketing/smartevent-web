"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { ChatServiceError, sendChatMessage } from "@/features/chat/api/chat-api"
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
    "Xin chào! Tôi có thể giúp tìm sự kiện, mở trang chi tiết và tra cứu hướng dẫn SmartEvent có nguồn dẫn. Tôi không thực hiện giao dịch thay bạn.",
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
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const clearHistory = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    requestCounterRef.current += 1
    setIsLoading(false)
    setMessages([
      {
        ...INITIAL_MESSAGE,
        id: createId(),
        createdAt: new Date().toISOString(),
      },
    ])
    setConversationId(null)
    setDialogueState({})
    setIsLoading(false)
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || abortControllerRef.current) return
      const controller = new AbortController()
      abortControllerRef.current = controller

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
        const data = await sendChatMessage(
          {
            message: trimmed,
            conversation_id: conversationId || undefined,
            previous_state: dialogueState,
          },
          controller.signal,
        )

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
          event_links: data.event_links,
          events: data.events,
          actions: data.actions,
          has_more: data.has_more,
          mode: data.mode,
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (error) {
        if (currentRequestId !== requestCounterRef.current) {
          return
        }
        const errorAssistantMessage: ChatMessage = {
          id: createId(),
          role: "assistant",
          content:
            error instanceof ChatServiceError
              ? error.message
              : "Không thể gửi tin nhắn đến SmartEvent Bot. Vui lòng kiểm tra lại kết nối mạng.",
          error_code: error instanceof ChatServiceError ? error.code : "NETWORK_ERROR",
          createdAt: new Date().toISOString(),
          intent: "NETWORK_ERROR",
          grounding: "NO_LIVE_DATA",
        }
        setMessages((prev) => [...prev, errorAssistantMessage])
      } finally {
        if (currentRequestId === requestCounterRef.current) {
          abortControllerRef.current = null
          setIsLoading(false)
        }
      }
    },
    [conversationId, dialogueState],
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
