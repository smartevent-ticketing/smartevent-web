"use client"

import { adminApi } from "@/features/admin/api/admin-api"

import { useState, useEffect, useCallback } from "react"

import type { AdminNotification, PendingEvent } from "../model/admin-types"

export function useAdminApprovals() {
  const [notification, setNotification] = useState<AdminNotification | null>(null)

  const [customEventIdToApprove, setCustomEventIdToApprove] = useState("")

  const [rejectReason, setRejectReason] = useState("")

  const [isApproving, setIsApproving] = useState(false)

  const [isRejecting, setIsRejecting] = useState(false)

  const [isLoading, setIsLoading] = useState(true)

  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([])

  const fetchPendingEvents = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await adminApi.getPendingEvents()
      const data = res.data?.data
      const content = Array.isArray(data?.content) ? data.content : []
      setPendingEvents(
        content
          .filter((ev) => Boolean(ev.id))
          .map((ev) => ({
            id: ev.id!,
            name: ev.name || "Sự kiện chưa đặt tên",
            organizer: ev.organizerId ? `BTC (${ev.organizerId.slice(0, 8)})` : "Ban tổ chức",
            venue: ev.venue?.name ? `${ev.venue.name}, ${ev.venue.city || ""}` : "Chưa chọn địa điểm",
            submittedDate: ev.createdAt ? new Date(ev.createdAt).toLocaleDateString("vi-VN") : "Hôm nay",
            expectedTickets: 0,
            priceRange: "Chờ cập nhật",
          })),
      )
    } catch {
      // Keep empty if failed
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPendingEvents()
  }, [fetchPendingEvents])

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
    isLoading,
    pendingEvents,
    handleApprove,
    handleReject,
    fetchPendingEvents,
  }
}
