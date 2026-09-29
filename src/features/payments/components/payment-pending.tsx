"use client"

import Link from "next/link"
import { Clock, RefreshCw } from "lucide-react"

import { usePaymentResult } from "@/features/payments/hooks/use-payment-result"

type Props = Pick<
  ReturnType<typeof usePaymentResult>,
  "orderCode" | "status" | "handleManualRetry" | "displayAmount" | "hasVerifiedOrder"
>

export function PaymentPending({
  orderCode,
  status,
  handleManualRetry,
  displayAmount,
  hasVerifiedOrder,
}: Props) {
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
              {hasVerifiedOrder ? "Chưa xác nhận thanh toán" : "Chưa tải được trạng thái đơn hàng"}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
              {hasVerifiedOrder
                ? "Đơn hàng vẫn đang chờ kết quả từ cổng thanh toán."
                : "Không thể kiểm tra đơn hàng lúc này. Vui lòng đăng nhập và thử kiểm tra lại."}
              <strong> Vui lòng không thực hiện thanh toán lại</strong> để tránh bị trừ tiền nhiều
              lần.
            </p>
          </div>

          <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200 text-xs text-amber-900 space-y-1.5 text-left">
            <div className="flex justify-between">
              <span>Mã đơn hàng:</span>
              <span className="font-mono font-bold">{orderCode}</span>
            </div>
            {displayAmount !== undefined && (
              <div className="flex justify-between">
                <span>Giá trị đơn hàng:</span>
                <span className="font-bold">{displayAmount.toLocaleString("vi-VN")} ₫</span>
              </div>
            )}
            <p className="text-amber-800 text-[11px] pt-1 border-t border-amber-200">
              Chọn “Kiểm tra lại trạng thái” để tải kết quả mới nhất.
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
