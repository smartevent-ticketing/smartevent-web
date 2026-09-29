"use client"

import { catalogApi } from "@/features/catalog"
import { adminApi } from "@/features/admin/api/admin-api"

import { useEffect, useState } from "react"

import { getApiErrorMessage } from "@/lib/api/result"
import type { AdminNotification, CategoryResponse, VenueResponse } from "../model/admin-types"

export function useAdminDashboard() {
  const [notification, setNotification] = useState<AdminNotification | null>(null)

  const [pendingCount, setPendingCount] = useState(0)

  const [isLoadingPendingEvents, setIsLoadingPendingEvents] = useState(true)

  const [categories, setCategories] = useState<CategoryResponse[]>([])

  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  const [venues, setVenues] = useState<VenueResponse[]>([])

  const [isLoadingVenues, setIsLoadingVenues] = useState(true)

  const [failedOutboxCount, setFailedOutboxCount] = useState(0)

  const [isLoadingOutbox, setIsLoadingOutbox] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const results = await Promise.all([
          catalogApi.getCategories(),
          catalogApi.getVenues(),
          adminApi.getOutboxStats(),
          adminApi.getPendingEvents(),
        ])
        if (!mounted) return
        setCategories(results[0].data?.data ?? [])
        setVenues(results[1].data?.data ?? [])
        setFailedOutboxCount(results[2].data?.data?.failedCount ?? 0)
        setPendingCount(results[3].data?.data?.totalElements ?? 0)
      } catch (error) {
        if (mounted)
          setNotification({
            type: "error",
            text: getApiErrorMessage(error, "Không thể tải dữ liệu. Vui lòng thử lại."),
          })
      } finally {
        if (mounted) {
          setIsLoadingCategories(false)
          setIsLoadingVenues(false)
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
    venues,
    isLoadingVenues,
    failedOutboxCount,
    isLoadingOutbox,
  }
}
