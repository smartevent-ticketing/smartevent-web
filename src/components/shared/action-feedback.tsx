"use client"

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react"

export type ActionMessage = { type: "success" | "error" | "info"; text: string }

export function ActionFeedback({
  message,
  onDismiss,
}: {
  message: ActionMessage | null
  onDismiss: () => void
}) {
  if (!message) return null
  const Icon =
    message.type === "error" ? AlertCircle : message.type === "success" ? CheckCircle2 : Info
  const color =
    message.type === "error"
      ? "bg-red-50 border-red-200 text-red-800"
      : message.type === "success"
        ? "bg-green-50 border-green-200 text-green-800"
        : "bg-blue-50 border-blue-200 text-blue-800"
  return (
    <div
      role={message.type === "error" ? "alert" : "status"}
      className={`p-4 rounded-2xl text-sm flex items-center justify-between border ${color}`}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-4 shrink-0" />
        <span>{message.text}</span>
      </div>
      <button type="button" onClick={onDismiss} aria-label="Đóng thông báo" className="p-1">
        <X className="size-4" />
      </button>
    </div>
  )
}
