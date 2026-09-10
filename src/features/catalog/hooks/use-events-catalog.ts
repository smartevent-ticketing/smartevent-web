"use client"

import { catalogApi } from "@/features/catalog/api/catalog-api"
import { useEffect, useState } from "react"

import type { components } from "@/lib/api/schema"
type EventResponse = components["schemas"]["EventResponse"]

export function useEventsCatalog() {
  const [events, setEvents] = useState<EventResponse[]>([])

  const [currentPage, setCurrentPage] = useState(0)

  const [totalPages, setTotalPages] = useState(0)

  const [totalElements, setTotalElements] = useState(0)

  const [isLoading, setIsLoading] = useState(true)

  const [loadError, setLoadError] = useState<string | null>(null)

  const pageSize = 9

  useEffect(() => {
    let isMounted = true

    async function loadEvents() {
      setIsLoading(true)
      setLoadError(null)
      try {
        const res = await catalogApi.getPublishedEvents({
          params: {
            query: {
              pageable: {
                page: currentPage,
                size: pageSize,
              },
            },
          },
        })

        if (isMounted) {
          if (res.data?.data) {
            setEvents(res.data.data.content || [])
            setTotalPages(res.data.data.totalPages || 0)
            setTotalElements(res.data.data.totalElements || 0)
          }
        }
      } catch {
        if (isMounted) {
          setLoadError("Không thể kết nối máy chủ để tải danh sách sự kiện.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadEvents()
    return () => {
      isMounted = false
    }
  }, [currentPage])

  return {
    events,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    isLoading,
    loadError,
  }
}
