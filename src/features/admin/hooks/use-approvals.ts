"use client"

import { adminApi } from "@/features/admin/api/admin-api"

import { useState } from "react"

import type { AdminNotification, PendingEvent } from "../model/admin-types"

export function useAdminApprovals() {
  const [notification, setNotification] = useState<AdminNotification | null>(null)

  const [customEventIdToApprove, setCustomEventIdToApprove] = useState("")

  const [rejectReason, setRejectReason] = useState("")

  const [isApproving, setIsApproving] = useState(false)

  const [isRejecting, setIsRejecting] = useState(false)

  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([])

  async function handleApprove(id: string) {
    setIsApproving(true)
    try {
      await adminApi.approveEvent({
        params: { path: { id } },
      })
      setNotification({
        type: "success",
        text: `Phê duyệt sự kiện ${id} thành công! Sự kiện đã sẵn sàng mở bán.`,
      })
      setPendingEvents((prev) => prev.filter((e) => e.id !== id))
      setCustomEventIdToApprove("")
    } catch {
      setNotification({
        type: "error",
        text: `Phê duyệt sự kiện thất bại. Vui lòng kiểm tra lại Event ID.`,
      })
    } finally {
      setIsApproving(false)
    }
  }

  async function handleReject(id: string) {
    setIsRejecting(true)
    try {
      await adminApi.rejectEvent({
        params: {
          path: { id },
          query: { reason: rejectReason.trim() || undefined },
        },
      })
      setNotification({
        type: "info",
        text: `Đã từ chối duyệt sự kiện ${id}. Trạng thái đã chuyển về DRAFT.`,
      })
      setPendingEvents((prev) => prev.filter((e) => e.id !== id))
      setCustomEventIdToApprove("")
      setRejectReason("")
    } catch {
      setNotification({
        type: "error",
        text: `Từ chối duyệt sự kiện thất bại. Vui lòng kiểm tra quyền Admin hoặc Event ID.`,
      })
    } finally {
      setIsRejecting(false)
    }
  }

  return {
    notification,
    setNotification,
    customEventIdToApprove,
    setCustomEventIdToApprove,
    isApproving,
    isRejecting,
    pendingEvents,
    handleApprove,
    handleReject,
  }
}
