"use client"

import Link from "next/link"
import { AlertCircle, ArrowLeft, Loader2, Ticket, X } from "lucide-react"
import { useBookingCart } from "./hooks/use-booking-cart"
import { ActiveReservationNotice } from "./components/active-reservation-notice"
import { BookingTierList } from "./components/booking-tier-list"
import { BookingCartPanel } from "./components/booking-cart-panel"
import { BookingSeatDialog } from "./components/booking-seat-dialog"
import { BookingProgress } from "./components/booking-progress"

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
      <div className="flex min-h-screen items-center justify-center bg-surface px-6">
        <div role="status" className="flex flex-col items-center gap-4 text-on-surface-variant">
          <Loader2 className="size-7 animate-spin text-primary" />
          <p className="text-sm">Đang chuẩn bị các hạng vé cho bạn...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <div className="w-full max-w-md space-y-5 rounded-2xl border border-outline-variant bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle className="size-6" />
          </div>
          <h1 className="text-xl font-bold text-on-surface">Không tìm thấy sự kiện</h1>
          <p className="text-sm leading-6 text-on-surface-variant">
            {errorMessage || "Sự kiện không tồn tại hoặc đã ngừng mở bán vé."}
          </p>
          <Link
            href="/events"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <ArrowLeft className="size-4" /> Khám phá sự kiện
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="border-b border-outline-variant bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href={"/events/" + eventId}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Quay lại sự kiện
          </Link>
          <div className="mt-4 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div className="min-w-0 max-w-2xl">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <Ticket className="size-4" /> Đặt vé sự kiện
              </p>
              <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                {eventTitle}
              </h1>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                Chọn hạng vé, số lượng hoặc vị trí ghế để tiếp tục thanh toán.
              </p>
            </div>
            <div className="w-full lg:max-w-md">
              <BookingProgress currentStep={1} />
            </div>
          </div>
        </div>
      </header>

      <ActiveReservationNotice
        {...{ activeReservation, isSubmitting, handleCancelActiveReservation }}
      />

      {errorMessage && (
        <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              aria-label="Đóng thông báo lỗi"
              onClick={() => setErrorMessage(null)}
              className="flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-red-100"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto flex w-full max-w-7xl flex-col items-start gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8 lg:py-10">
        <BookingTierList booking={booking} />
        <BookingCartPanel booking={booking} />
      </main>
      <BookingSeatDialog booking={booking} />
    </div>
  )
}
