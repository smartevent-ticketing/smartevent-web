"use client"

import { catalogApi } from "@/features/catalog"
import { adminApi } from "@/features/admin/api/admin-api"

import { useEffect, useState } from "react"

import { getApiErrorMessage } from "@/lib/api/result"
import type { AdminNotification, CategoryResponse } from "../model/admin-types"

export function useAdminDashboard() {
  const [notification, setNotification] = useState<AdminNotification | null>(null)

  const [pendingCount, setPendingCount] = useState(0)

  const [isLoadingPendingEvents, setIsLoadingPendingEvents] = useState(true)

  const [categories, setCategories] = useState<CategoryResponse[]>([])

  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  const [failedOutboxCount, setFailedOutboxCount] = useState(0)

  const [isLoadingOutbox, setIsLoadingOutbox] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const results = await Promise.all([
          catalogApi.getCategories(),
          adminApi.getOutboxStats(),
          adminApi.getPendingEvents(),
        ])
        if (!mounted) return
        setCategories(results[0].data?.data ?? [])
        setFailedOutboxCount(results[1].data?.data?.failedCount ?? 0)
        setPendingCount(results[2].data?.data?.totalElements ?? 0)
      } catch (error) {
        if (mounted)
          setNotification({
            type: "error",
            text: getApiErrorMessage(error, "Không thể tải dữ liệu. Vui lòng thử lại."),
          })
      } finally {
        if (mounted) {
          setIsLoadingCategories(false)
          setIsLoadingOutbox(false)
          setIsLoadingPendingEvents(false)
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
    pendingCount,
    isLoadingPendingEvents,
    categories,
    isLoadingCategories,
    failedOutboxCount,
    isLoadingOutbox,
  }
}
