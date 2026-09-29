"use client"

import { useEffect, useState } from "react"
import type { components } from "@/lib/api/schema"
import { getApiErrorMessage } from "@/lib/api/result"
import { bookingApi } from "../api/booking-api"

type EventSeat = components["schemas"]["EventSeatResponse"]

export function useAvailableSeats(
  areaId: string,
  enabled: boolean,
  onSeatsLoaded?: (areaId: string, seats: EventSeat[]) => void,
) {
  const [snapshot, setSnapshot] = useState<{
    areaId: string
    seats: EventSeat[]
    loaded: boolean
  }>({ areaId: "", seats: [], loaded: false })
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
        if (!controller.signal.aborted) {
          const refreshed = response.data?.data ?? []
          setSnapshot({ areaId, seats: refreshed, loaded: true })
          onSeatsLoaded?.(areaId, refreshed)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setSnapshot({ areaId, seats: [], loaded: false })
          setError(getApiErrorMessage(error, "Không thể tải sơ đồ ghế."))
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [areaId, enabled, revision, onSeatsLoaded])
  return {
    availableSeats: enabled && snapshot.areaId === areaId ? snapshot.seats : [],
    hasLoadedSeats: enabled && snapshot.areaId === areaId && snapshot.loaded,
    isLoadingSeats,
    seatsError,
    refreshSeats: () => setRevision((value) => value + 1),
  }
}
