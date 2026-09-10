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

  const [selectedCategory, setSelectedCategory] = useState("Tất cả")

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

  const filteredRealEvents = events.filter((e) => {
    const matchCat =
      selectedCategory === "Tất cả" || e.categories?.some((c) => c.name === selectedCategory)
    const matchSearch =
      !searchQuery ||
      e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCity =
      selectedCity === "all" ||
      (selectedCity === "hcm" &&
        (e.city?.includes("Hồ Chí Minh") || e.venue?.city?.includes("Hồ Chí Minh"))) ||
      (selectedCity === "hn" && (e.city?.includes("Hà Nội") || e.venue?.city?.includes("Hà Nội")))
    return matchCat && matchSearch && matchCity
  })

  return {
    categories,
    events,
    isLoading,
    loadError,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    displayCategories,
    filteredRealEvents,
  }
}
