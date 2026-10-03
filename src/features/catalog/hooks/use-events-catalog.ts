"use client"

import { catalogApi } from "@/features/catalog/api/catalog-api"
import { useEffect, useState } from "react"

import type { components } from "@/lib/api/schema"
import type { CatalogFilters } from "../model/catalog-url"
type EventResponse = components["schemas"]["EventResponse"]
type CategoryResponse = components["schemas"]["CategoryResponse"]

export function useEventsCatalog({ q, city, categoryId }: CatalogFilters) {
  const [events, setEvents] = useState<EventResponse[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])

  const [currentPage, setCurrentPage] = useState(0)

  const [totalPages, setTotalPages] = useState(0)

  const [totalElements, setTotalElements] = useState(0)

  const [isLoading, setIsLoading] = useState(true)

  const [loadError, setLoadError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const pageSize = 9

  useEffect(() => {
    let active = true
    catalogApi
      .getCategories()
      .then((response) => {
        if (active) setCategories(response.data?.data ?? [])
      })
      .catch(() => {
        if (active) setCategories([])
      })
    return () => {
      active = false
    }
  }, [])

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
              q: q || undefined,
              city: city || undefined,
              categoryId: categoryId || undefined,
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
  }, [currentPage, q, city, categoryId, retryCount])

  return {
    events,
    categories,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    isLoading,
    loadError,
    retry: () => setRetryCount((count) => count + 1),
  }
}
