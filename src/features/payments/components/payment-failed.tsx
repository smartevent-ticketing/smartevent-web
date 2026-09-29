"use client"

import Link from "next/link"
import { AlertCircle, ArrowRight, Home } from "lucide-react"
import { usePaymentResult } from "@/features/payments/hooks/use-payment-result"

type Props = Pick<ReturnType<typeof usePaymentResult>, "orderCode" | "status" | "errorMessage">

export function PaymentFailed({ orderCode, status, errorMessage }: Props) {
  return (
    <>
      {status === "failed" && (
        <div className="text-center space-y-6">
          <div className="size-20 rounded-full bg-red-100 border-4 border-red-200 flex items-center justify-center text-red-600 mx-auto shadow-sm">
            <AlertCircle className="size-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase">
              {errorMessage ? "Thiếu thông tin xác thực" : "Giao dịch không thành công"}
            </span>
            <h1 className="text-2xl font-black text-on-surface">
              {errorMessage ? "Không thể kiểm tra thanh toán" : "Thanh toán chưa hoàn tất"}
            </h1>
            <p className="text-xs sm:text-sm text-red-700 max-w-md mx-auto leading-relaxed">
              {errorMessage ||
                "Đơn hàng đã hết hạn hoặc bị hủy. Vui lòng kiểm tra đơn hàng trước khi đặt vé lại."}
            </p>
          </div>

          {orderCode && (
            <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/60 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Mã đơn hàng:</span>
                <span className="font-mono font-bold text-on-surface">{orderCode}</span>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Link
              href={errorMessage ? "/account?tab=orders" : "/events"}
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{errorMessage ? "Xem đơn hàng của tôi" : "Thử đặt vé lại"}</span>
              <ArrowRight className="size-4" />
            </Link>

            <Link
              href="/"
              className="w-full h-11 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <Home className="size-4" />
              <span>Quay về trang chủ</span>
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
