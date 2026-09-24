"use client"

import { organizerApi } from "../api/organizer-api"
import { catalogApi } from "@/features/catalog"

import { useEffect, useRef, useState } from "react"

import type { components } from "@/lib/api/schema"
import type { EventMediaResponse } from "@/lib/api/event-setup-contract"
import { getApiErrorMessage } from "@/lib/api/result"
import { requireSubmittedEvent, type TicketTierSetup } from "../model/event-setup-input"

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

  // Media states
  const [createdEventId, setCreatedEventId] = useState<string | null>(null)
  const [bannerMedia, setBannerMedia] = useState<EventMediaResponse | null>(null)
  const [galleryMedia, setGalleryMedia] = useState<EventMediaResponse[]>([])
  const [isCreatingDraft, setIsCreatingDraft] = useState(false)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)

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

  async function handleProceedToMedia() {
    setErrorMessage(null)
    if (!eventName.trim() || !selectedCategoryId || !selectedVenueId) {
      setErrorMessage("Vui lòng nhập tên sự kiện, chọn danh mục và địa điểm.")
      return
    }
    const now = Date.now()
    const start = new Date(`${startDate}T${startTime}:00+07:00`)
    const end = new Date(`${startDate}T23:59:00+07:00`)
    if (!Number.isFinite(start.getTime()) || start.getTime() <= now || start >= end) {
      setErrorMessage("Vui lòng chọn thời gian bắt đầu trong tương lai, trước 23:59 cùng ngày.")
      return
    }

    if (createdEventId) {
      setCurrentStep(3)
      return
    }

    setIsCreatingDraft(true)
    try {
      const venue = venues.find((v) => v.id === selectedVenueId)
      const res = await organizerApi.createDraftEvent({
        name: eventName.trim(),
        description: description.trim(),
        venueId: selectedVenueId,
        categoryIds: [selectedCategoryId],
        city: venue?.city || "Hà Nội",
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      })
      const id = res.data?.data?.id
      if (!id) throw new Error("Không nhận được mã sự kiện sau khi tạo bản nháp.")
      setCreatedEventId(id)
      setCurrentStep(3)
    } catch (err) {
      setErrorMessage(
        getApiErrorMessage(err, "Không thể khởi tạo bản nháp sự kiện. Vui lòng thử lại."),
      )
    } finally {
      setIsCreatingDraft(false)
    }
  }

  async function handleUploadBanner(file: File) {
    if (!createdEventId) {
      setMediaError("Chưa khởi tạo được sự kiện. Vui lòng quay lại Bước 2.")
      return
    }
    setIsUploadingBanner(true)
    setMediaError(null)
    try {
      const res = await organizerApi.uploadEventMedia(createdEventId, file, "BANNER")
      const media = res.data?.data
      if (media) {
        setBannerMedia(media)
      }
    } catch (err) {
      setMediaError(getApiErrorMessage(err, "Không thể tải ảnh bìa lên. Vui lòng thử lại."))
      throw err
    } finally {
      setIsUploadingBanner(false)
    }
  }

  async function handleDeleteBanner() {
    if (!createdEventId || !bannerMedia?.eventFileId) return
    setIsUploadingBanner(true)
    setMediaError(null)
    try {
      await organizerApi.deleteEventMedia(createdEventId, bannerMedia.eventFileId)
      setBannerMedia(null)
    } catch (err) {
      setMediaError(getApiErrorMessage(err, "Không thể xóa ảnh bìa."))
    } finally {
      setIsUploadingBanner(false)
    }
  }

  async function handleUploadGallery(file: File) {
    if (!createdEventId) {
      setMediaError("Chưa khởi tạo được sự kiện. Vui lòng quay lại Bước 2.")
      return
    }
    setIsUploadingGallery(true)
    setMediaError(null)
    try {
      const res = await organizerApi.uploadEventMedia(createdEventId, file, "GALLERY")
      const media = res.data?.data
      if (media) {
        setGalleryMedia((prev) => [...prev, media])
      }
    } catch (err) {
      setMediaError(getApiErrorMessage(err, "Không thể tải ảnh bộ sưu tập."))
      throw err
    } finally {
      setIsUploadingGallery(false)
    }
  }

  async function handleDeleteGallery(eventFileId: string) {
    if (!createdEventId) return
    setIsUploadingGallery(true)
    setMediaError(null)
    try {
      await organizerApi.deleteEventMedia(createdEventId, eventFileId)
      setGalleryMedia((prev) => prev.filter((m) => m.eventFileId !== eventFileId))
    } catch (err) {
      setMediaError(getApiErrorMessage(err, "Không thể xóa ảnh."))
    } finally {
      setIsUploadingGallery(false)
    }
  }

  async function handleComplete() {
    if (submitInFlight.current) return
    submitInFlight.current = true
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      if (!createdEventId) {
        throw new Error("Không tìm thấy mã sự kiện bản nháp. Vui lòng quay lại Bước 2.")
      }
      if (!bannerMedia) {
        throw new Error("Sự kiện bắt buộc phải có ít nhất 1 ảnh bìa (Banner) trước khi gửi duyệt.")
      }
      const venue = venues.find((v) => v.id === selectedVenueId)
      if (
        venue?.capacity != null &&
        ticketTiers.reduce((sum, tier) => sum + tier.capacity, 0) > venue.capacity
      ) {
        throw new Error("Tổng sức chứa các hạng vé vượt quá sức chứa địa điểm.")
      }

      // 1. Tạo các Area, Seat & Ticket Types theo từng tier
      let sortOrder = 0
      for (const tier of ticketTiers) {
        const areaRes = await organizerApi.createArea(createdEventId, {
          name: tier.name.trim(),
          areaType: tier.areaType,
          capacity: tier.capacity,
          sortOrder: sortOrder++,
        })
        const areaId = areaRes.data?.data?.id
        if (!areaId) {
          throw new Error(`Không thể tạo khu vực vé "${tier.name}".`)
        }

        if (tier.areaType === "SEATED") {
          const capacity = tier.capacity
          const rows = Math.min(26, Math.floor((capacity - 1) / 25) + 1)
          const seatsPerRow = Math.floor(capacity / rows)
          const fromRow = "A"
          const toRow = String.fromCharCode(65 + rows - 1)
          await organizerApi.generateSeats(areaId, {
            fromRow,
            toRow,
            seatsPerRow: seatsPerRow > 0 ? seatsPerRow : capacity,
          })
        }

        const typeRes = await organizerApi.createTicketType(createdEventId, {
          eventAreaId: areaId,
          name: tier.name.trim(),
          status: "ACTIVE",
        })
        const typeId = typeRes.data?.data?.id
        if (!typeId) {
          throw new Error(`Không thể tạo hạng vé "${tier.name}".`)
        }

        const end = new Date(`${startDate}T23:59:00+07:00`)
        await organizerApi.createSalePhase(typeId, {
          name: "Mở bán chính thức",
          price: tier.price,
          quantity: tier.capacity,
          saleStartAt: new Date().toISOString(),
          saleEndAt: end.toISOString(),
          maxPerOrder: 4,
          status: "ACTIVE",
        })
      }

      // 2. Gửi duyệt sự kiện lên Admin
      const submitRes = await organizerApi.submitEvent(createdEventId)
      requireSubmittedEvent(submitRes.data?.data)
      setIsDone(true)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Không thể gửi duyệt sự kiện. Vui lòng thử lại."))
    } finally {
      submitInFlight.current = false
      setIsSubmitting(false)
    }
  }

  const steps = [
    { num: 1, label: "Thông tin cơ bản" },
    { num: 2, label: "Thời gian & Địa điểm" },
    { num: 3, label: "Ảnh sự kiện" },
    { num: 4, label: "Thiết lập hạng vé" },
    { num: 5, label: "Xem lại & Gửi duyệt" },
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
    createdEventId,
    bannerMedia,
    galleryMedia,
    isCreatingDraft,
    isUploadingBanner,
    isUploadingGallery,
    mediaError,
    handleProceedToMedia,
    handleUploadBanner,
    handleDeleteBanner,
    handleUploadGallery,
    handleDeleteGallery,
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
