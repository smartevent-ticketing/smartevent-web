"use client"

import { useEffect, useState } from "react"
import type { components } from "@/lib/api/schema"
import { ApiRequestError, getApiErrorMessage } from "@/lib/api/result"
import { bookingApi } from "../api/booking-api"

export function useActiveReservation(eventId: string | undefined, authenticated: boolean) {
  const [reservation, setReservation] = useState<
    components["schemas"]["ReservationResponse"] | null
  >(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setReservation(null)
      setError(null)
      if (!eventId || !authenticated) return
      try {
        const response = await bookingApi.getActiveReservation({
          params: { query: { eventId } },
          signal: controller.signal,
        })
        if (!controller.signal.aborted) setReservation(response.data?.data ?? null)
      } catch (error) {
        if (
          !controller.signal.aborted &&
          !(error instanceof ApiRequestError && error.status === 404)
        )
          setError(getApiErrorMessage(error, "Không thể kiểm tra phiên giữ chỗ."))
      }
    }
    void load()
    return () => controller.abort()
  }, [eventId, authenticated])
  return {
    activeReservation: reservation?.eventId === eventId ? reservation : null,
    clearActiveReservation: () => setReservation(null),
    reservationError: error,
  }
}
