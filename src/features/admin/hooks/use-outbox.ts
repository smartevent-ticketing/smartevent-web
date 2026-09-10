"use client"

import { adminApi } from "@/features/admin/api/admin-api"

import { useEffect, useState } from "react"

import { getApiErrorMessage } from "@/lib/api/result"
import type { AdminNotification, OutboxEvent, OutboxStats } from "../model/admin-types"

export function useAdminOutbox() {
  const [notification, setNotification] = useState<AdminNotification | null>(null)

  const [outboxStats, setOutboxStats] = useState<OutboxStats | null>(null)

  const [pendingOutbox, setPendingOutbox] = useState<OutboxEvent[]>([])

  const [failedOutbox, setFailedOutbox] = useState<OutboxEvent[]>([])

  const [isLoadingOutbox, setIsLoadingOutbox] = useState(true)

  const [retryingId, setRetryingId] = useState<string | null>(null)

  async function handleRetryOutbox(id: string) {
    setRetryingId(id)
    try {
      await adminApi.retryOutbox({
        params: { path: { id } },
      })
      // Thông báo chuẩn xác theo cam kết User Review Required: "Đã tiếp nhận yêu cầu"
      setNotification({
        type: "info",
        text: "Đã tiếp nhận yêu cầu đẩy lại sự kiện Outbox sang RabbitMQ.",
      })
      setFailedOutbox((prev) => prev.filter((item) => item.id !== id))
    } catch {
      setNotification({
        type: "error",
        text: "Yêu cầu thử lại Outbox thất bại. Vui lòng kiểm tra kết nối Message Broker.",
      })
    } finally {
      setRetryingId(null)
    }
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const results = await Promise.all([
          adminApi.getOutboxStats(),
          adminApi.getPendingOutbox(),
          adminApi.getFailedOutbox(),
        ])
        if (!mounted) return
        setOutboxStats(results[0].data?.data ?? null)
        setPendingOutbox(results[1].data?.data ?? [])
        setFailedOutbox(results[2].data?.data ?? [])
      } catch (error) {
        if (mounted)
          setNotification({
            type: "error",
            text: getApiErrorMessage(error, "Không thể tải dữ liệu. Vui lòng thử lại."),
          })
      } finally {
        if (mounted) {
          setIsLoadingOutbox(false)
        }
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  return {
    notification,
    setNotification,
    outboxStats,
    pendingOutbox,
    failedOutbox,
    isLoadingOutbox,
    retryingId,
    handleRetryOutbox,
  }
}
