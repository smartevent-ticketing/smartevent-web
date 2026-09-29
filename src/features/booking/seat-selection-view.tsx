"use client"

import Link from "next/link"
import { AlertCircle, ArrowLeft, Loader2, Timer, X } from "lucide-react"
import { useBookingCart } from "./hooks/use-booking-cart"
import { ActiveReservationNotice } from "./components/active-reservation-notice"
import { BookingTierList } from "./components/booking-tier-list"
import { BookingCartPanel } from "./components/booking-cart-panel"
import { BookingSeatDialog } from "./components/booking-seat-dialog"

export function SeatSelectionView({ eventId }: { eventId: string }) {
  const booking = useBookingCart({ eventId })
  const {
    isAuthLoading,
    event,
    isLoading,
    errorMessage,
    setErrorMessage,
    activeReservation,
    isSubmitting,
    handleCancelActiveReservation,
    eventTitle,
  } = booking

  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3 text-on-surface-variant">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Đang tải thông tin đặt vé và giỏ hàng...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-outline-variant/60 shadow-lg text-center space-y-4">
          <div className="size-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-on-surface">Không tìm thấy sự kiện</h2>
          <p className="text-sm text-on-surface-variant">
            {errorMessage || "Sự kiện không tồn tại hoặc đã ngừng mở bán vé."}
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover transition"
          >
            <ArrowLeft className="size-4" />
            <span>Khám phá các sự kiện khác</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* Top Reservation Bar */}
      <div className="bg-white border-b border-outline-variant/60 sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/events/${eventId}`}
            className="text-xs sm:text-sm font-semibold text-primary hover:underline shrink-0"
          >
            ← Quay lại sự kiện
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-xs sm:text-sm font-bold text-on-surface truncate">
            {eventTitle} — Đặt vé & Giữ chỗ
          </span>
        </div>

        {/* 10-Minute Timer Badge */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-xs shrink-0">
          <Timer className="size-4 animate-pulse text-amber-600" />
          <span className="hidden sm:inline">Thời gian giữ chỗ:</span>
          <span className="font-mono text-sm sm:text-base">10 phút</span>
        </div>
      </div>

      {/* Cảnh báo nếu đang có phiên giữ chỗ cũ */}
      <ActiveReservationNotice
        {...{ activeReservation, isSubmitting, handleCancelActiveReservation }}
      />

      {/* Thông báo lỗi nếu có */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs sm:text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container: Ticket List (Left) + Cart & Checkout (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 gap-8 items-start">
        <BookingTierList booking={booking} />
        <BookingCartPanel booking={booking} />
      </div>

      <BookingSeatDialog booking={booking} />
    </div>
  )
}
