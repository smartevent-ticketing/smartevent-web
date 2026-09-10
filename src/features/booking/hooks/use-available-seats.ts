"use client"

import { useEffect, useState } from "react"
import type { components } from "@/lib/api/schema"
import { getApiErrorMessage } from "@/lib/api/result"
import { bookingApi } from "../api/booking-api"

export function useAvailableSeats(areaId: string, enabled: boolean) {
  const [snapshot, setSnapshot] = useState<{
    areaId: string
    seats: components["schemas"]["EventSeatResponse"][]
  }>({ areaId: "", seats: [] })
  const [isLoadingSeats, setLoading] = useState(false)
  const [seatsError, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setError(null)
      if (!enabled || !areaId) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const response = await bookingApi.getAvailableSeats({
          params: { path: { areaId } },
          signal: controller.signal,
        })
        if (!controller.signal.aborted) setSnapshot({ areaId, seats: response.data?.data ?? [] })
      } catch (error) {
        if (!controller.signal.aborted) {
          setSnapshot({ areaId, seats: [] })
          setError(getApiErrorMessage(error, "Không thể tải sơ đồ ghế."))
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [areaId, enabled, revision])
  return {
    availableSeats: enabled && snapshot.areaId === areaId ? snapshot.seats : [],
    isLoadingSeats,
    seatsError,
    refreshSeats: () => setRevision((value) => value + 1),
  }
}
