"use client"
import { TicketPicker } from "./components/ticket-picker"
import { EventInformation } from "./components/event-information"
import { EventHero } from "./components/event-hero"

import Link from "next/link"
import { AlertCircle } from "lucide-react"

import { useEventDetail } from "./hooks/use-event-detail"

export function EventDetailView({ eventId }: { eventId: string }) {
  const {
    bannerUrl,
    isLoading,
    isNotFound,
    setSelectedTierId,
    quantity,
    setQuantity,
    shared,
    availableTiers,
    isSaleActive,
    effectiveTierId,
    currentTier,
    totalPrice,
    maxAllowedQty,
    handleShare,
    title,
    categoryName,
    date,
    time,
    locationName,
    cityName,
    descriptionText,
    targetEventId,
  } = useEventDetail({ eventId })
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 animate-pulse">
        <div className="w-full h-[320px] sm:h-[420px] rounded-3xl bg-gray-200" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-20 bg-gray-100 rounded-2xl" />
            <div className="h-40 bg-gray-100 rounded-2xl" />
            <div className="h-40 bg-gray-100 rounded-2xl" />
          </div>
          <div className="lg:col-span-4 h-96 bg-gray-100 rounded-3xl" />
        </div>
      </div>
    )
  }

  if (isNotFound) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="size-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertCircle className="size-10" />
        </div>
        <h1 className="text-2xl font-bold text-on-surface">Không tìm thấy sự kiện</h1>
        <p className="text-sm text-on-surface-variant">
          Sự kiện bạn đang tìm kiếm không tồn tại hoặc chưa được công bố chính thức trên hệ thống.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover transition shadow-md"
        >
          <span>Khám phá các sự kiện khác</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col gap-8">
      {/* 1. Hero Event Banner */}
      <EventHero {...{ bannerUrl, isSaleActive, title, date, time, locationName, cityName }} />

      {/* 2. Grid Layout: Left Content & Right Sticky Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content (Left - 8 cols) */}
        <EventInformation {...{ isSaleActive, categoryName, locationName, descriptionText }} />

        {/* Sticky Sidebar Booking (Right - 4 cols) */}
        <TicketPicker
          {...{
            setSelectedTierId,
            quantity,
            setQuantity,
            shared,
            availableTiers,
            isSaleActive,
            effectiveTierId,
            currentTier,
            totalPrice,
            maxAllowedQty,
            handleShare,
            targetEventId,
          }}
        />
      </div>
    </div>
  )
}
