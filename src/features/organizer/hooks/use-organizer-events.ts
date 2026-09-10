"use client"

import { catalogApi } from "@/features/catalog"

import { useEffect, useState } from "react"

import type { components } from "@/lib/api/schema"

type EventResponse = components["schemas"]["EventResponse"]

export interface DisplayEvent {
  id: string
  name: string
  category: string
  venue: string
  date: string
  ticketsSold?: number
  totalTickets?: number
  revenue?: number
  status: string
}

export function useOrganizerEvents() {
  const [events, setEvents] = useState<DisplayEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const totalEvents = events.length
  const publishedCount = events.filter((e) => e.status === "PUBLISHED").length
  const pendingCount = events.filter((e) => e.status === "PENDING_APPROVAL").length

  const hasRevenueData = events.some((e) => e.revenue !== undefined)
  const totalRevenue = hasRevenueData
    ? events.reduce((sum, e) => sum + (e.revenue ?? 0), 0)
    : undefined

  const hasSoldData = events.some((e) => e.ticketsSold !== undefined)
  const totalSold = hasSoldData
    ? events.reduce((sum, e) => sum + (e.ticketsSold ?? 0), 0)
    : undefined

  useEffect(() => {
    let isMounted = true

    async function fetchMyEvents() {
      try {
        const res = await catalogApi.getMyEvents({
          params: { query: { pageable: { page: 0, size: 20 } } },
        })

        if (!isMounted) return

        if (res.data?.data?.content && res.data.data.content.length > 0) {
          const mapped: DisplayEvent[] = res.data.data.content.map((ev: EventResponse) => ({
            id: ev.id || "",
            name: ev.name || "Sự kiện không tên",
            category: ev.categories?.[0]?.name || "Chung",
            venue: ev.venue?.name || ev.city || "Địa điểm linh hoạt",
            date: ev.startTime
              ? new Date(ev.startTime).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Chưa xác định",
            ticketsSold: undefined,
            totalTickets: undefined,
            revenue: undefined,
            status: ev.status || "DRAFT",
          }))
          setEvents(mapped)
        } else {
          setEvents([])
        }
      } catch {
        if (isMounted) {
          setEvents([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchMyEvents()

    return () => {
      isMounted = false
    }
  }, [refreshTrigger])

  return {
    events,
    isLoading,
    setIsLoading,
    refreshTrigger,
    setRefreshTrigger,
    totalEvents,
    publishedCount,
    pendingCount,
    totalRevenue,
    totalSold,
  }
}
