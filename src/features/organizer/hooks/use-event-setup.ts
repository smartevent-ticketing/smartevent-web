"use client"

import { organizerApi } from "../api/organizer-api"
import { catalogApi } from "@/features/catalog"

import { useEffect, useRef, useState } from "react"

import type { components } from "@/lib/api/schema"
import { getApiErrorMessage } from "@/lib/api/result"
import {
  buildEventSetupRequest,
  requireSubmittedEvent,
  type TicketTierSetup,
} from "../model/event-setup-input"

type CategoryResponse = components["schemas"]["CategoryResponse"]
type VenueResponse = components["schemas"]["VenueResponse"]

export function useEventSetup() {
  const submitInFlight = useRef(false)
  const [currentStep, setCurrentStep] = useState(1)

  const [categories, setCategories] = useState<CategoryResponse[]>([])

  const [venues, setVenues] = useState<VenueResponse[]>([])

  const [eventName, setEventName] = useState("")

  const [selectedCategoryId, setSelectedCategoryId] = useState("")

  const [description, setDescription] = useState("")

  const [startDate, setStartDate] = useState("")

  const [startTime, setStartTime] = useState("19:00")

  const [selectedVenueId, setSelectedVenueId] = useState("")

  const [ticketTiers, setTicketTiers] = useState<TicketTierSetup[]>([
    {
      id: "1",
      name: "Vé Khu đứng GA",
      areaType: "STANDING",
      price: 500000,
      capacity: 5000,
    },
    {
      id: "2",
      name: "Vé Khán đài A (Có ghế)",
      areaType: "SEATED",
      price: 1200000,
      capacity: 2000,
    },
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isDone, setIsDone] = useState(false)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function addTier() {
    setTicketTiers([
      ...ticketTiers,
      {
        id: crypto.randomUUID(),
        name: "Hạng vé mới",
        areaType: "SEATED",
        price: 800000,
        capacity: 1000,
      },
    ])
  }

  function removeTier(id: string) {
    setTicketTiers(ticketTiers.filter((t) => t.id !== id))
  }

  async function handleComplete() {
    if (submitInFlight.current) return
    submitInFlight.current = true
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const venue = venues.find((v) => v.id === selectedVenueId)
      if (!venue || !categories.some((c) => c.id === selectedCategoryId))
        throw new Error("Vui lòng chọn danh mục và địa điểm đã tải từ hệ thống.")
      const body = buildEventSetupRequest({
        eventName,
        description,
        startDate,
        startTime,
        selectedVenueId,
        selectedCategoryId,
        city: venue.city || "",
        ticketTiers,
      })
      if (
        venue.capacity != null &&
        body.tiers.reduce((sum, tier) => sum + tier.capacity, 0) > venue.capacity
      ) {
        throw new Error("Tổng sức chứa các hạng vé vượt quá sức chứa địa điểm.")
      }
      const result = await organizerApi.createEventSetup({ body })
      requireSubmittedEvent(result.data?.data)
      setIsDone(true)
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Không thể tạo và gửi duyệt sự kiện. Vui lòng thử lại."),
      )
    } finally {
      submitInFlight.current = false
      setIsSubmitting(false)
    }
  }

  const steps = [
    { num: 1, label: "Thông tin cơ bản" },
    { num: 2, label: "Thời gian & Địa điểm" },
    { num: 3, label: "Thiết lập hạng vé" },
    { num: 4, label: "Xem lại & Gửi duyệt" },
  ]
  useEffect(() => {
    let isMounted = true

    async function loadMetadata() {
      try {
        const [catRes, venueRes] = await Promise.all([
          catalogApi.getCategories(),
          catalogApi.getVenues(),
        ])

        if (!isMounted) return

        if (catRes.data?.data) {
          const cats = catRes.data.data
          setCategories(cats)
          if (cats.length > 0 && cats[0].id) {
            setSelectedCategoryId(cats[0].id)
          }
        }

        if (venueRes.data?.data) {
          const vens = venueRes.data.data
          setVenues(vens)
          if (vens.length > 0 && vens[0].id) {
            setSelectedVenueId(vens[0].id)
          }
        }
      } catch (error) {
        if (isMounted)
          setErrorMessage(getApiErrorMessage(error, "Không thể tải danh mục và địa điểm."))
      }
    }

    loadMetadata()

    return () => {
      isMounted = false
    }
  }, [])
  return {
    currentStep,
    setCurrentStep,
    categories,
    venues,
    eventName,
    setEventName,
    selectedCategoryId,
    setSelectedCategoryId,
    description,
    setDescription,
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    selectedVenueId,
    setSelectedVenueId,
    ticketTiers,
    setTicketTiers,
    isSubmitting,
    isDone,
    errorMessage,
    addTier,
    removeTier,
    handleComplete,
    steps,
  }
}
