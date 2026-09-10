"use client"

import { useEffect, useState } from "react"
import { checkinApi } from "../api/checkin-api"
import { mapCheckinHistory, type ScanRecord } from "../model/checkin"
import { getApiErrorMessage } from "@/lib/api/result"

export function useCheckinHistory(eventId: string) {
  const [snapshot, setSnapshot] = useState<{ eventId: string; items: ScanRecord[] }>({
    eventId: "",
    items: [],
  })
  const [refresh, setRefresh] = useState(0)
  const [isLoadingHistory, setLoading] = useState(false)
  const [historyError, setError] = useState<string | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      if (!eventId) return
      setLoading(true)
      setError(null)
      try {
        const result = await checkinApi.getHistory({
          params: { path: { eventId } },
          signal: controller.signal,
        })
        if (!controller.signal.aborted)
          setSnapshot({ eventId, items: mapCheckinHistory(result.data?.data ?? []) })
      } catch (error) {
        if (!controller.signal.aborted)
          setError(getApiErrorMessage(error, "Không thể tải lịch sử soát vé."))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [eventId, refresh])
  const history = snapshot.eventId === eventId ? snapshot.items : []
  return {
    history,
    historyError,
    isLoadingHistory,
    refreshHistory: () => setRefresh((value) => value + 1),
  }
}
