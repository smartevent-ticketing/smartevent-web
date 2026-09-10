"use client"

import { catalogApi } from "@/features/catalog/api/catalog-api"
import { adminApi } from "@/features/admin/api/admin-api"

import { useEffect, useState } from "react"

import { getApiErrorMessage } from "@/lib/api/result"
import type {
  AdminNotification,
  CategoryResponse,
  VenueResponse,
  OutboxEvent,
  PendingEvent,
} from "../model/admin-types"

export function useAdminDashboard() {
  const [notification, setNotification] = useState<AdminNotification | null>(null)

  const [pendingEvents] = useState<PendingEvent[]>([])

  const [categories, setCategories] = useState<CategoryResponse[]>([])

  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  const [venues, setVenues] = useState<VenueResponse[]>([])

  const [isLoadingVenues, setIsLoadingVenues] = useState(true)

  const [failedOutbox, setFailedOutbox] = useState<OutboxEvent[]>([])

  const [isLoadingOutbox, setIsLoadingOutbox] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const results = await Promise.all([
          catalogApi.getCategories(),
          catalogApi.getVenues(),
          adminApi.getFailedOutbox(),
        ])
        if (!mounted) return
        setCategories(results[0].data?.data ?? [])
        setVenues(results[1].data?.data ?? [])
        setFailedOutbox(results[2].data?.data ?? [])
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
    pendingEvents,
    categories,
    isLoadingCategories,
    venues,
    isLoadingVenues,
    failedOutbox,
    isLoadingOutbox,
  }
}
