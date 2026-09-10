"use client"
import { CheckoutSummary } from "./components/checkout-summary"
import { CheckoutContact } from "./components/checkout-contact"

import Link from "next/link"

import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Timer, X } from "lucide-react"

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
    setEnteredFullName,
    setEnteredEmail,
    setEnteredPhone,
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
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3 text-on-surface-variant">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    )
  }

  if (!reservationId || !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-outline-variant/60 shadow-lg text-center space-y-4">
          <div className="size-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-on-surface">Chưa có thông tin giữ chỗ</h2>
          <p className="text-sm text-on-surface-variant">
            {errorMessage ||
              "Bạn chưa có phiên giữ chỗ nào hoặc phiên giữ chỗ đã hết hạn. Vui lòng chọn sự kiện và giữ chỗ trước khi thanh toán."}
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover transition"
          >
            <ArrowLeft className="size-4" />
            <span>Khám phá các sự kiện</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header navigation */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white border border-outline-variant/60 hover:bg-surface-container cursor-pointer transition"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
              Xác nhận & Thanh toán đơn hàng
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Rà soát thông tin nhận vé và chuyển sang cổng thanh toán VNPay.
            </p>
          </div>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs sm:text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* 10-Min Timer banner */}
        <div
          className={`p-4 rounded-2xl flex items-center justify-between shadow-xs transition ${
            isExpired ? "bg-red-600 text-white" : "bg-primary-container text-on-primary-container"
          }`}
        >
          <div className="flex items-center gap-2">
            <Timer className={`size-5 text-white ${!isExpired ? "animate-pulse" : ""}`} />
            <span className="text-sm font-semibold text-white">
              {isExpired ? "Phiên giữ chỗ đã hết hạn!" : "Vé và ghế đang được bảo lưu trong:"}
            </span>
          </div>
          <span className="font-mono text-xl font-bold text-white tracking-widest">
            {isExpired ? "00:00" : timerDisplay}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Information (Left - 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Info Card */}
            <CheckoutContact
              {...{
                setEnteredFullName,
                setEnteredEmail,
                setEnteredPhone,
                customerNote,
                setCustomerNote,
                fullName,
                email,
                phone,
              }}
            />

            {/* Payment Method Card */}
            <div className="bg-white rounded-3xl p-6 border border-outline-variant/60 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-on-surface">Phương thức thanh toán</h3>

              <div className="p-4 rounded-2xl border-2 border-primary bg-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-white border border-outline-variant/60 flex items-center justify-center font-bold text-xs text-primary shadow-xs">
                    VNPay
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">
                      Cổng thanh toán điện tử VNPAY
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      Hỗ trợ quét mã VNPAY-QR, thẻ ATM nội địa, Mobile Banking và thẻ quốc tế
                      Visa/Mastercard.
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="size-5 text-primary shrink-0" />
              </div>
            </div>
          </div>

          {/* Order Summary (Right - 5 cols) */}
          <CheckoutSummary
            {...{ isProcessing, isExpired, handlePayment, eventName, totalAmount, items }}
          />
        </div>
      </div>
    </div>
  )
}
