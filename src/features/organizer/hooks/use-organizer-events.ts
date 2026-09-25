"use client"

import { useEffect, useState } from "react"
import { catalogApi } from "@/features/catalog"
import { organizerApi } from "@/features/organizer/api/organizer-api"
import type { components } from "@/lib/api/schema"

type EventResponse = components["schemas"]["EventResponse"]
type InventoryCounterResponse = components["schemas"]["InventoryCounterResponse"]
type TicketSalePhaseResponse = components["schemas"]["TicketSalePhaseResponse"]

export interface DisplayEvent {
  id: string
  name: string
  category: string
  venue: string
  date: string
  rawDate?: string
  ticketsSold: number
  totalTickets: number
  heldTickets: number
  availableTickets: number
  revenue: number
  status: string
  occupancyRate: number
  phasesCount: number
}

export function useOrganizerEvents() {
  const [events, setEvents] = useState<DisplayEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const totalEvents = events.length
  const publishedCount = events.filter((e) => e.status === "PUBLISHED").length
  const pendingCount = events.filter((e) => e.status === "PENDING_APPROVAL").length
  const draftCount = events.filter((e) => e.status === "DRAFT").length
  const completedCount = events.filter((e) => e.status === "COMPLETED").length
  const cancelledCount = events.filter((e) => e.status === "CANCELLED").length

  const totalRevenue = events.reduce((sum, e) => sum + e.revenue, 0)
  const totalSold = events.reduce((sum, e) => sum + e.ticketsSold, 0)
  const totalCapacity = events.reduce((sum, e) => sum + e.totalTickets, 0)
  const totalHeld = events.reduce((sum, e) => sum + e.heldTickets, 0)
  const overallOccupancyRate =
    totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 1000) / 10 : 0
  const avgRevenuePerSoldTicket = totalSold > 0 ? Math.round(totalRevenue / totalSold) : 0

  useEffect(() => {
    let isMounted = true

    async function fetchMyEvents() {
      try {
        setIsLoading(true)
        const res = await catalogApi.getMyEvents({
          params: { query: { pageable: { page: 0, size: 50 } } },
        })

        if (!isMounted) return

        const rawList = res.data?.data?.content || []
        if (rawList.length === 0) {
          setEvents([])
          return
        }

        // Concurrently fetch inventory counters and sale phases for each event to aggregate real metrics
        const metricsList = await Promise.allSettled(
          rawList.map(async (ev: EventResponse) => {
            if (!ev.id) {
              return { sold: 0, total: 0, held: 0, available: 0, revenue: 0, phasesCount: 0 }
            }

            const [invSettled, phasesSettled] = await Promise.allSettled([
              organizerApi.getInventory(ev.id),
              organizerApi.getSalePhases(ev.id),
            ])

            const counters: InventoryCounterResponse[] =
              invSettled.status === "fulfilled" && Array.isArray(invSettled.value?.data)
                ? (invSettled.value.data as InventoryCounterResponse[])
                : []

            const phases: TicketSalePhaseResponse[] =
              phasesSettled.status === "fulfilled" && Array.isArray(phasesSettled.value?.data)
                ? (phasesSettled.value.data as TicketSalePhaseResponse[])
                : []

            // Build price map: salePhaseId -> price
            const priceMap = new Map<string, number>()
            for (const p of phases) {
              if (p.id && p.price != null) {
                priceMap.set(p.id, Number(p.price))
              }
            }

            let sold = 0
            let total = 0
            let held = 0
            let available = 0
            let revenue = 0

            if (counters.length > 0) {
              for (const c of counters) {
                const s = Number(c.soldQuantity) || 0
                const t = Number(c.totalQuantity) || 0
                const h = Number(c.heldQuantity) || 0
                const a =
                  c.availableQuantity != null ? Number(c.availableQuantity) : Math.max(0, t - s - h)
                sold += s
                total += t
                held += h
                available += a

                if (c.salePhaseId && priceMap.has(c.salePhaseId)) {
                  revenue += s * (priceMap.get(c.salePhaseId) || 0)
                }
              }
            } else if (phases.length > 0) {
              // If no inventory counter initialized yet, aggregate capacity from configured phases
              for (const p of phases) {
                total += Number(p.quantity) || 0
              }
            }

            return {
              sold,
              total,
              held,
              available,
              revenue,
              phasesCount: phases.length,
            }
          }),
        )

        if (!isMounted) return

        const mapped: DisplayEvent[] = rawList.map((ev: EventResponse, idx: number) => {
          const metric =
            metricsList[idx].status === "fulfilled"
              ? metricsList[idx].value
              : { sold: 0, total: 0, held: 0, available: 0, revenue: 0, phasesCount: 0 }

          const occupancyRate =
            metric.total > 0
              ? Math.min(100, Math.round((metric.sold / metric.total) * 1000) / 10)
              : 0

          return {
            id: ev.id || "",
            name: ev.name || "Sự kiện không tên",
            category: ev.categories?.[0]?.name || "Chung",
            venue: ev.venue?.name || ev.city || "Địa điểm linh hoạt",
            date: ev.startTime
              ? new Date(ev.startTime).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Chưa xác định",
            rawDate: ev.startTime,
            ticketsSold: metric.sold,
            totalTickets: metric.total,
            heldTickets: metric.held,
            availableTickets: metric.available,
            revenue: metric.revenue,
            occupancyRate,
            phasesCount: metric.phasesCount,
            status: ev.status || "DRAFT",
          }
        })

        setEvents(mapped)
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
    draftCount,
    completedCount,
    cancelledCount,
    totalRevenue,
    totalSold,
    totalCapacity,
    totalHeld,
    overallOccupancyRate,
    avgRevenuePerSoldTicket,
  }
}
