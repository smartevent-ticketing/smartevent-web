"use client"

import { catalogApi } from "@/features/catalog/api/catalog-api"
import { useEffect, useState } from "react"

import { Compass, Music, PartyPopper, Sparkles, Trophy, Users } from "lucide-react"
import type { components } from "@/lib/api/schema"
type EventResponse = components["schemas"]["EventResponse"]
type CategoryResponse = components["schemas"]["CategoryResponse"]
function getCategoryIcon(name?: string) {
  if (!name) return Compass
  const n = name.toLowerCase()
  if (n.includes("nhạc") || n.includes("concert")) return Music
  if (n.includes("thể thao") || n.includes("esport")) return Trophy
  if (n.includes("sân khấu") || n.includes("kịch")) return Sparkles
  if (n.includes("hội thảo") || n.includes("workshop")) return Users
  if (n.includes("lễ hội") || n.includes("festival")) return PartyPopper
  return Compass
}

export function useHome() {
  const [categories, setCategories] = useState<CategoryResponse[]>([])

  const [events, setEvents] = useState<EventResponse[]>([])

  const [isLoading, setIsLoading] = useState(true)

  const [loadError, setLoadError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")

  const [selectedCity, setSelectedCity] = useState("all")

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setIsLoading(true)
      setLoadError(null)
      try {
        const [catRes, eventRes] = await Promise.all([
          catalogApi.getCategories(),
          catalogApi.getPublishedEvents({
            params: {
              query: {
                pageable: { page: 0, size: 6 },
              },
            },
          }),
        ])

        if (isMounted) {
          if (catRes.data?.data) {
            setCategories(catRes.data.data)
          }
          if (eventRes.data?.data?.content) {
            setEvents(eventRes.data.data.content)
          }
        }
      } catch {
        if (isMounted) {
          setLoadError("Không thể kết nối máy chủ backend.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  const displayCategories = [
    { id: "all", name: "Tất cả", icon: Compass },
    ...categories.map((c) => ({
      id: c.id || c.name || "",
      name: c.name || "Danh mục",
      icon: getCategoryIcon(c.name),
    })),
  ]

  return {
    categories,
    events,
    isLoading,
    loadError,
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    displayCategories,
    filteredRealEvents: events,
  }
}
