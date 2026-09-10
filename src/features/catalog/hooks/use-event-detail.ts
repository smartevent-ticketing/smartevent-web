"use client"
import { useState } from "react"
import { useClock } from "@/hooks/use-clock"
import { useEventCatalog } from "./use-event-catalog"
import { buildTicketTiers } from "../model/sale-phases"

export function useEventDetail({ eventId }: { eventId: string }) {
  const catalog = useEventCatalog(eventId)
  const [selectedTierId, setSelectedTierId] = useState("")
  const [requestedQuantity, setQuantity] = useState(1)
  const [shared, setShared] = useState(false)
  const now = useClock()
  const data = catalog.data
  const event = data?.event
  const availableTiers = data
    ? buildTicketTiers(data.types, data.areas, data.phases, data.inventory, now)
    : []
  const currentTier = availableTiers.find((tier) => tier.id === selectedTierId) ?? availableTiers[0]
  const maxAllowedQty = currentTier ? Math.min(currentTier.maxPerOrder, currentTier.available) : 0
  const quantity = Math.min(Math.max(1, requestedQuantity), Math.max(1, maxAllowedQty))
  const dateValue = new Date(event?.startTime ?? "")
  const validDate = Number.isFinite(dateValue.getTime())
  async function handleShare() {
    try {
      if (navigator.share) await navigator.share({ title: event?.name, url: window.location.href })
      else {
        await navigator.clipboard.writeText(window.location.href)
        setShared(true)
      }
    } catch {
      setShared(false)
    }
  }
  return {
    bannerUrl: data?.bannerUrl ?? "/images/concert-banner.jpg",
    isLoading: catalog.isLoading,
    isNotFound: catalog.isNotFound,
    loadError: catalog.error,
    setSelectedTierId,
    quantity,
    setQuantity,
    shared,
    availableTiers,
    isSaleActive: availableTiers.length > 0,
    effectiveTierId: currentTier?.id ?? "",
    currentTier,
    totalPrice: (currentTier?.price ?? 0) * quantity,
    maxAllowedQty,
    handleShare,
    title: event?.name ?? "Sự kiện",
    categoryName: event?.categories?.[0]?.name ?? "Sự kiện",
    date: validDate
      ? dateValue.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "Asia/Ho_Chi_Minh",
        })
      : "Chưa công bố",
    time: validDate
      ? dateValue.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Ho_Chi_Minh",
        })
      : "",
    locationName: event?.venue?.name ?? "Địa điểm thông báo sau",
    cityName: event?.city ?? event?.venue?.city ?? "",
    descriptionText: event?.description ?? "Thông tin chi tiết sẽ được cập nhật.",
    targetEventId: event?.id ?? eventId,
  }
}
