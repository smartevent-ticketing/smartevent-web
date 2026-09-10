"use client"

import Link from "next/link"
import { Clock, RefreshCw } from "lucide-react"

import { usePaymentResult } from "@/features/payments/hooks/use-payment-result"

type Props = Pick<
  ReturnType<typeof usePaymentResult>,
  "orderCode" | "status" | "handleManualRetry" | "displayAmount"
>

export function PaymentPending({ orderCode, status, handleManualRetry, displayAmount }: Props) {
  return (
    <>
      {status === "pending_unconfirmed" && (
        <div className="text-center space-y-6">
          <div className="size-20 rounded-full bg-amber-100 border-4 border-amber-200 flex items-center justify-center text-amber-600 mx-auto shadow-sm">
            <Clock className="size-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase">
              Đang chờ đồng bộ
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-on-surface">
              Chưa xác nhận thanh toán
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
              Cổng thanh toán VNPay đang xử lý giao dịch hoặc hệ thống chưa nhận được thông báo IPN
              từ ngân hàng.
              <strong> Vui lòng không thực hiện thanh toán lại</strong> để tránh bị trừ tiền nhiều
              lần.
            </p>
          </div>

          <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200 text-xs text-amber-900 space-y-1.5 text-left">
            <div className="flex justify-between">
              <span>Mã đơn hàng:</span>
              <span className="font-mono font-bold">{orderCode}</span>
            </div>
            <div className="flex justify-between">
              <span>Số tiền:</span>
              <span className="font-bold">{displayAmount.toLocaleString("vi-VN")} ₫</span>
            </div>
            <p className="text-amber-800 text-[11px] pt-1 border-t border-amber-200">
              Giao dịch của bạn sẽ được tự động cập nhật ngay khi VNPay hoàn tất đối soát.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleManualRetry}
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="size-4" />
              <span>Kiểm tra lại trạng thái</span>
            </button>

            <Link
              href="/account?tab=orders"
              className="w-full h-11 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <span>Xem đơn hàng của tôi</span>
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
