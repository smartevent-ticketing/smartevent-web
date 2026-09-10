"use client"

import { useEffect, useState } from "react"
import { loadEventCatalog } from "../application/load-event-catalog"
import { ApiRequestError, getApiErrorMessage } from "@/lib/api/result"

export function useEventCatalog(identifier: string) {
  const [snapshot, setSnapshot] = useState<{
    identifier: string
    data: Awaited<ReturnType<typeof loadEventCatalog>>
  }>()
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isNotFound, setNotFound] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      setNotFound(false)
      try {
        const data = await loadEventCatalog(identifier, controller.signal)
        if (!controller.signal.aborted) setSnapshot({ identifier, data })
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(getApiErrorMessage(error, "Không thể tải thông tin sự kiện."))
          setNotFound(error instanceof ApiRequestError && error.status === 404)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [identifier])
  return {
    data: snapshot?.identifier === identifier ? snapshot.data : undefined,
    isLoading,
    error,
    isNotFound,
  }
}
