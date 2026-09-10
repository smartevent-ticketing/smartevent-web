"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/features/auth"
import { catalogApi } from "@/features/catalog"
import { getApiErrorMessage } from "@/lib/api/result"

export function useCheckinEvents() {
  const { hasRole, isLoading: isAuthLoading } = useAuth()
  const organizer = hasRole("ROLE_ORGANIZER")
  const [events, setEvents] = useState<{ id: string; name: string; venueName?: string }[]>([])
  const [selected, select] = useState("")
  const [isLoadingEvents, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (isAuthLoading) return
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const query = {
          params: { query: { pageable: { page: 0, size: 100 } } },
          signal: controller.signal,
        }
        const response = await (organizer
          ? catalogApi.getMyEvents(query)
          : catalogApi.getPublishedEvents(query))
        if (!controller.signal.aborted)
          setEvents(
            (response.data?.data?.content ?? [])
              .filter((e) => e.id)
              .map((e) => ({ id: e.id!, name: e.name ?? "Sự kiện", venueName: e.venue?.name })),
          )
      } catch (error) {
        if (!controller.signal.aborted)
          setError(getApiErrorMessage(error, "Không thể tải sự kiện."))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [organizer, isAuthLoading])
  return {
    events,
    selectedEventId: events.some((e) => e.id === selected) ? selected : (events[0]?.id ?? ""),
    setSelectedEventId: select,
    isLoadingEvents,
    eventsError: error,
  }
}
