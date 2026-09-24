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

  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([])

  const [isLoadingPendingEvents, setIsLoadingPendingEvents] = useState(true)

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
          adminApi.getPendingEvents(),
        ])
        if (!mounted) return
        setCategories(results[0].data?.data ?? [])
        setVenues(results[1].data?.data ?? [])
        setFailedOutbox(results[2].data?.data ?? [])
        const rawPending = (results[3] as any)?.data?.data?.content ?? (results[3] as any)?.data?.data ?? []
        setPendingEvents(
          Array.isArray(rawPending)
            ? rawPending.map((ev: any) => ({
                id: ev.id,
                name: ev.name || "Sự kiện chưa đặt tên",
                organizer: ev.organizerId ? `BTC (${ev.organizerId.slice(0, 8)})` : "Ban tổ chức",
                venue: ev.venue?.name ? `${ev.venue.name}, ${ev.venue.city || ""}` : "Chưa chọn địa điểm",
                submittedDate: ev.createdAt ? new Date(ev.createdAt).toLocaleDateString("vi-VN") : "Hôm nay",
                expectedTickets: 0,
                priceRange: "Chờ cập nhật",
              }))
            : []
        )
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
    pendingEvents,
    isLoadingPendingEvents,
    categories,
    isLoadingCategories,
    venues,
    isLoadingVenues,
    failedOutbox,
    isLoadingOutbox,
  }
}
