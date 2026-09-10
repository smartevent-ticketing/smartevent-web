"use client"
import { PaymentActions } from "./components/payment-actions"
import { PaymentSummary } from "./components/payment-summary"

import Link from "next/link"

import { AlertCircle, ArrowLeft, Loader2, QrCode, ShieldCheck, Timer } from "lucide-react"

import { usePayment } from "./hooks/use-payment"

export function PaymentView() {
  const {
    isRealOrder,
    order,
    isLoadingOrder,
    isCreatingPayment,
    paymentUrl,
    errorMessage,
    autoRedirectSeconds,
    copied,
    isExpired,
    timerDisplay,
    effectiveAmount,
    effectiveCode,
    handleCopyOrderId,
    handleDirectToVNPay,
    retryPayment,
  } = usePayment()
  if (isLoadingOrder) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-on-surface-variant">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Đang chuẩn bị phiên kết nối cổng VNPay...</p>
        </div>
      </div>
    )
  }

  if (!isRealOrder || !order) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-outline-variant/60 shadow-lg text-center space-y-4">
          <div className="size-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-on-surface">Không tìm thấy đơn hàng</h2>
          <p className="text-sm text-on-surface-variant">
            {errorMessage ||
              "Đơn hàng không tồn tại, đã hoàn tất hoặc phiên thanh toán đã kết thúc."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/events"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-primary-hover transition"
            >
              <ArrowLeft className="size-4" />
              <span>Khám phá sự kiện</span>
            </Link>
            <Link
              href="/account?tab=orders"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-surface-container text-on-surface text-xs sm:text-sm font-semibold rounded-xl hover:bg-surface-container-high transition"
            >
              <span>Xem đơn hàng của tôi</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[560px] bg-white rounded-3xl p-6 sm:p-8 border border-outline-variant/60 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase mb-2">
            <QrCode className="size-3.5" />
            <span>Cổng thanh toán VNPay</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Chuyển tiếp thanh toán</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Kết nối trực tiếp đến cổng thanh toán bảo mật VNPay
          </p>
        </div>

        {/* Lỗi nếu có */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs sm:text-sm flex items-start gap-2.5 shadow-xs">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">Khởi tạo không thành công</span>
              <span className="text-xs leading-relaxed">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Countdown Timer Banner */}
        <div
          className={`p-4 rounded-2xl flex items-center justify-between shadow-xs transition ${
            isExpired ? "bg-red-600 text-white" : "bg-primary-container text-on-primary-container"
          }`}
        >
          <div className="flex items-center gap-2">
            <Timer className={`size-5 text-white ${!isExpired ? "animate-pulse" : ""}`} />
            <span className="text-xs sm:text-sm font-semibold text-white">
              {isExpired ? "Đơn hàng đã hết hạn thanh toán!" : "Thời gian hoàn tất giao dịch còn:"}
            </span>
          </div>
          <span className="font-mono text-lg font-bold text-white tracking-widest">
            {isExpired ? "00:00" : timerDisplay}
          </span>
        </div>

        {/* Order Amount Info Box */}
        <PaymentSummary {...{ copied, effectiveAmount, effectiveCode, handleCopyOrderId }} />

        {/* Action Button & Auto Redirect */}
        <PaymentActions
          {...{
            isCreatingPayment,
            paymentUrl,
            autoRedirectSeconds,
            isExpired,
            handleDirectToVNPay,
            retryPayment,
          }}
        />

        <div className="flex items-center justify-center gap-1.5 text-xs text-on-surface-variant text-center pt-1">
          <ShieldCheck className="size-4 text-green-600 shrink-0" />
          <span>Kết nối được mã hóa bảo mật chuẩn SSL / TLS với cổng VNPay</span>
        </div>
      </div>
    </div>
  )
}
