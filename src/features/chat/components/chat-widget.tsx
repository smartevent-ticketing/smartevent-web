"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, MessageSquare, RotateCcw, Send, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useChat } from "@/features/chat/hooks/use-chat"
import { cn } from "@/lib/utils"

const SUGGESTIONS = [
  "Tìm sự kiện tại Hà Nội",
  "Chính sách hoàn hủy vé thế nào?",
  "2 vé dưới 1 triệu tổng",
  "Hướng dẫn cách mua vé",
]

export function ChatWidget() {
  const { messages, isOpen, isLoading, toggleOpen, clearHistory, sendMessage } = useChat()
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      inputRef.current?.focus()
    }
  }, [isOpen, messages, isLoading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage(input)
    setInput("")
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div
          data-testid="chat-window"
          className="mb-4 flex h-[540px] max-h-[85vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-2xl backdrop-blur-md sm:w-[400px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bot className="size-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-medium leading-none">
                  <span>SmartEvent Bot</span>
                  <span className="flex size-2 rounded-full bg-emerald-500" title="Trực tuyến" />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Hỗ trợ tra cứu sự kiện & chính sách vé
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={clearHistory}
                title="Làm mới hội thoại"
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={toggleOpen}
                title="Đóng cửa sổ chat"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg) => {
              const isUser = msg.role === "user"
              return (
                <div
                  key={msg.id}
                  className={cn("flex flex-col", isUser ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-xs",
                      isUser
                        ? "bg-primary text-primary-foreground rounded-br-xs"
                        : "bg-muted/80 text-foreground rounded-bl-xs border border-border/40",
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Citations if available */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2.5 border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                        <span className="font-semibold block mb-1">Nguồn dẫn chứng:</span>
                        <ul className="space-y-1">
                          {msg.citations.map((c, idx) => (
                            <li key={idx} className="truncate">
                              • {c.title} ({c.heading_path.join(" > ")})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <span className="mt-1 px-1 text-[10px] text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-xs border border-border/40 bg-muted/80 px-3.5 py-2.5 shadow-xs">
                  <span className="size-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-primary/60" />
                </div>
              </div>
            )}

            {/* Quick Suggestions (Shown when only greeting is in chat) */}
            {messages.length === 1 && !isLoading && (
              <div className="pt-2">
                <div className="mb-2 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <Sparkles className="size-3 text-primary" />
                  <span>Gợi ý câu hỏi nhanh:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((text, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(text)}
                      className="rounded-full border border-border/80 bg-background/80 px-2.5 py-1 text-left text-xs text-foreground/90 transition-colors hover:border-primary/50 hover:bg-primary/5"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="border-t border-border/60 bg-muted/20 p-3">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi về sự kiện, giá vé, chính sách..."
                className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="shrink-0 rounded-xl"
              >
                <Send className="size-4" />
              </Button>
            </form>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground/70">
              Trợ lý cung cấp thông tin sự kiện, không thể đặt vé thay bạn.
            </p>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <Button
        data-testid="chat-widget-toggle"
        onClick={toggleOpen}
        size="lg"
        className="group relative flex h-13 items-center gap-2.5 rounded-full px-5 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {isOpen ? (
          <>
            <X className="size-5" />
            <span className="font-medium">Đóng chat</span>
          </>
        ) : (
          <>
            <div className="relative">
              <MessageSquare className="size-5 transition-transform group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
            </div>
            <span className="font-medium">Hỏi Trợ lý AI</span>
          </>
        )}
      </Button>
    </div>
  )
}
