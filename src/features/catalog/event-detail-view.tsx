"use client"

import Link from "next/link"
import { AlertCircle, ArrowLeft, ChevronRight, Home } from "lucide-react"

import { TicketPicker } from "./components/ticket-picker"
import { EventInformation } from "./components/event-information"
import { EventHero } from "./components/event-hero"
import { useEventDetail } from "./hooks/use-event-detail"

export function EventDetailView({ eventId }: { eventId: string }) {
  const {
    bannerUrl,
    seatMapUrl,
    galleryUrls,
    minPrice,
    isLoading,
    isNotFound,
    isEnded,
    loadError,
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
      <div
        role="status"
        aria-label="Đang tải thông tin sự kiện"
        className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10"
      >
        <span className="sr-only">Đang tải thông tin sự kiện...</span>
        <div aria-hidden="true" className="space-y-8 animate-pulse">
          <div className="h-4 w-56 rounded bg-surface-container" />
          <div className="grid overflow-hidden rounded-3xl border border-border bg-white lg:grid-cols-2">
            <div className="h-72 bg-surface-container sm:h-96" />
            <div className="space-y-5 p-8">
              <div className="h-6 w-28 rounded-full bg-surface-container" />
              <div className="h-16 rounded-xl bg-surface-container" />
              <div className="h-12 rounded-xl bg-surface-container" />
              <div className="h-12 rounded-xl bg-surface-container" />
            </div>
          </div>
          <div className="grid items-start gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <div className="h-28 rounded-2xl bg-white" />
              <div className="h-64 rounded-2xl bg-white" />
            </div>
            <div className="h-96 rounded-3xl bg-white lg:col-span-4" />
          </div>
        </div>
      </div>
    )
  }

  if (isNotFound) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600">
          <AlertCircle className="size-8" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
          Không tìm thấy sự kiện
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          Sự kiện bạn đang tìm kiếm không tồn tại hoặc chưa được công bố chính thức trên hệ thống.
        </p>
        <Link
          href="/events"
          className="se-button mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary hover:bg-primary-hover"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Khám phá các sự kiện khác
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 py-6 sm:px-6 lg:gap-9 lg:px-8 lg:py-9">
      <nav
        aria-label="Đường dẫn trang"
        className="flex min-w-0 items-center gap-2 text-xs text-muted sm:gap-3 sm:text-sm"
      >
        <Link href="/" aria-label="Trang chủ" className="shrink-0 rounded p-1 hover:text-primary">
          <Home className="size-4" aria-hidden="true" />
        </Link>
        <ChevronRight className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
        <Link href="/events" className="shrink-0 hover:text-primary">
          Sự kiện
        </Link>
        <ChevronRight className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
        <span aria-current="page" className="truncate font-medium text-foreground">
          {title}
        </span>
      </nav>

      {loadError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{loadError}</span>
        </div>
      )}

      <EventHero
        {...{
          bannerUrl,
          isSaleActive,
          isEnded,
          title,
          date,
          time,
          locationName,
          cityName,
          minPrice,
        }}
      />

      <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12 lg:gap-8">
        <EventInformation
          {...{
            isSaleActive,
            isEnded,
            categoryName,
            locationName,
            descriptionText,
            seatMapUrl,
            galleryUrls,
          }}
        />
        <aside
          id="ticket-picker-section"
          aria-label="Chọn vé sự kiện"
          className="order-first w-full scroll-mt-28 lg:order-none lg:sticky lg:top-28 lg:col-span-4"
        >
          <TicketPicker
            {...{
              setSelectedTierId,
              quantity,
              setQuantity,
              shared,
              availableTiers,
              isSaleActive,
              isEnded,
              effectiveTierId,
              currentTier,
              totalPrice,
              maxAllowedQty,
              handleShare,
              targetEventId,
            }}
          />
        </aside>
      </div>
    </div>
  )
}
