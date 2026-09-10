"use client"

import Link from "next/link"
import { AlertTriangle, Home } from "lucide-react"

import { usePaymentResult } from "@/features/payments/hooks/use-payment-result"

type Props = Pick<
  ReturnType<typeof usePaymentResult>,
  "vnp_TransactionNo" | "orderCode" | "status" | "displayAmount"
>

export function PaymentLate({ vnp_TransactionNo, orderCode, status, displayAmount }: Props) {
  return (
    <>
      {status === "late_payment" && (
        <div className="text-center space-y-6">
          <div className="size-20 rounded-full bg-amber-100 border-4 border-amber-200 flex items-center justify-center text-amber-600 mx-auto shadow-sm">
            <AlertTriangle className="size-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase">
              Ghi nhận thanh toán muộn
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
              Thanh toán đã được ghi nhận. Hệ thống đang xử lý đối soát, vui lòng liên hệ hỗ trợ nếu
              cần
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
              Khoản thanh toán của bạn đã được trừ qua VNPay, nhưng phiên giữ vé 10 phút trước đó có
              thể đã kết thúc. Bộ phận hỗ trợ SmartEvent sẽ đối soát với ngân hàng và hỗ trợ giải
              quyết thỏa đáng.
            </p>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/60 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Mã đơn hàng:</span>
              <span className="font-mono font-bold text-on-surface">{orderCode}</span>
            </div>
            {vnp_TransactionNo && (
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Mã giao dịch VNPay:</span>
                <span className="font-mono text-on-surface">{vnp_TransactionNo}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Số tiền:</span>
              <span className="font-bold text-primary">
                {displayAmount.toLocaleString("vi-VN")} ₫
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/account?tab=orders"
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Xem thông tin đơn hàng</span>
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
