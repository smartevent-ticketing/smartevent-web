"use client"

import Link from "next/link"
import { AlertCircle, ArrowLeft, CheckCircle2, CreditCard, Loader2, Timer, X } from "lucide-react"
import { CheckoutSummary } from "./components/checkout-summary"
import { CheckoutContact } from "./components/checkout-contact"
import { BookingProgress } from "./components/booking-progress"
import { useCheckout } from "./hooks/use-checkout"

export function CheckoutView() {
  const {
    router,
    isAuthLoading,
    reservationId,
    reservation,
    isLoadingReservation,
    errorMessage,
    setErrorMessage,
    isProcessing,
    customerNote,
    setCustomerNote,
    fullName,
    email,
    phone,
    isExpired,
    timerDisplay,
    handlePayment,
    eventName,
    totalAmount,
    items,
  } = useCheckout()

  if (isLoadingReservation || isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6">
        <div role="status" className="flex flex-col items-center gap-4 text-on-surface-variant">
          <Loader2 className="size-7 animate-spin text-primary" />
          <p className="text-sm">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    )
  }

  if (!reservationId || !reservation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <div className="w-full max-w-md space-y-5 rounded-2xl border border-outline-variant bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertCircle className="size-6" />
          </div>
          <h1 className="text-xl font-bold text-on-surface">Chưa có thông tin giữ chỗ</h1>
          <p className="text-sm leading-6 text-on-surface-variant">
            {errorMessage ||
              "Bạn chưa có phiên giữ chỗ nào hoặc phiên giữ chỗ đã hết hạn. Vui lòng chọn sự kiện và giữ chỗ trước khi thanh toán."}
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

  const confirmed = reservation.status === "CONFIRMED"
  const cancelled = reservation.status === "CANCELLED"

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="border-b border-outline-variant bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Quay lại
          </button>
          <div className="mt-4 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Xác nhận đơn hàng
              </p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {confirmed ? "Thông tin thanh toán" : "Hoàn tất đặt vé"}
              </h1>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                Kiểm tra vé và thông tin tài khoản trước khi thanh toán.
              </p>
            </div>
            <div className="w-full lg:max-w-md">
              <BookingProgress currentStep={confirmed ? 3 : 2} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {errorMessage && (
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
        )}

        <div
          className={
            "flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 sm:px-5 " +
            (confirmed
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : cancelled
                ? "border-outline-variant bg-white text-on-surface"
                : isExpired
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-amber-200 bg-amber-50 text-amber-900")
          }
        >
          <div className="flex items-start gap-3">
            {confirmed ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            ) : (
              <Timer className="mt-0.5 size-5 shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold">
                {confirmed
                  ? "Phiên giữ chỗ đã thanh toán"
                  : cancelled
                    ? "Phiên giữ chỗ đã hủy"
                    : isExpired
                      ? "Phiên giữ chỗ đã hết hạn"
                      : "Thời gian giữ vé còn lại"}
              </p>
              <p className="mt-1 text-xs opacity-80">
                {confirmed
                  ? "Bạn có thể xem vé trong tài khoản sau khi đơn hàng được cập nhật."
                  : cancelled || isExpired
                    ? "Vui lòng chọn vé lại để tạo phiên giữ chỗ mới."
                    : "Hoàn tất thanh toán trước khi thời gian giữ chỗ kết thúc."}
              </p>
            </div>
          </div>
          {!confirmed && !cancelled && (
            <span className="rounded-lg bg-white/75 px-4 py-2 font-mono text-2xl font-bold tabular-nums tracking-wide">
              {isExpired ? "—" : timerDisplay}
            </span>
          )}
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <CheckoutContact {...{ customerNote, setCustomerNote, fullName, email, phone }} />

            <section className="space-y-5 rounded-2xl border border-outline-variant bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-surface text-on-surface">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Phương thức thanh toán</h2>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    Tiếp tục tại cổng thanh toán VNPAY
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-primary/25 bg-primary-container p-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-white text-[10px] font-extrabold tracking-tight text-on-surface">
                  VNPAY
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">Cổng thanh toán VNPAY</h3>
                  <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                    Bạn sẽ được chuyển đến VNPAY để chọn phương thức và hoàn tất thanh toán.
                  </p>
                </div>
                <CheckCircle2 className="size-5 shrink-0 text-primary" />
              </div>
            </section>
          </div>
          <CheckoutSummary
            {...{ isProcessing, isExpired, handlePayment, eventName, totalAmount, items }}
          />
        </div>
      </main>
    </div>
  )
}
