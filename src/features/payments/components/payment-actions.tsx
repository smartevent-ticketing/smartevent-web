"use client"

import Link from "next/link"
import { ExternalLink, Loader2 } from "lucide-react"
import { usePayment } from "@/features/payments/hooks/use-payment"

type Props = Pick<
  ReturnType<typeof usePayment>,
  | "isCreatingPayment"
  | "paymentUrl"
  | "autoRedirectSeconds"
  | "isExpired"
  | "handleDirectToVNPay"
  | "retryPayment"
>

export function PaymentActions({
  isCreatingPayment,
  paymentUrl,
  autoRedirectSeconds,
  isExpired,
  handleDirectToVNPay,
  retryPayment,
}: Props) {
  return (
    <>
      <div className="space-y-3 pt-2">
        {isCreatingPayment ? (
          <div className="w-full h-12 bg-surface-container rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-on-surface-variant">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span>Đang kết nối cổng VNPay...</span>
          </div>
        ) : paymentUrl && !isExpired ? (
          <>
            <button
              type="button"
              onClick={handleDirectToVNPay}
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Chuyển sang cổng VNPay để thanh toán</span>
              <ExternalLink className="size-4" />
            </button>

            {autoRedirectSeconds !== null && autoRedirectSeconds > 0 && (
              <p className="text-xs text-center text-on-surface-variant animate-pulse">
                Tự động chuyển hướng sau <strong>{autoRedirectSeconds}s</strong>...
              </p>
            )}
          </>
        ) : isExpired ? (
          <Link
            href="/events"
            className="block w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition text-center leading-[48px]"
          >
            Đơn hàng đã hết hạn — Quay lại chọn vé
          </Link>
        ) : (
          <button
            type="button"
            onClick={retryPayment}
            className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Thử kết nối lại cổng VNPay</span>
          </button>
        )}

        <Link
          href="/"
          className="block w-full text-center text-xs font-semibold text-on-surface-variant hover:text-primary transition py-1"
        >
          Hủy thanh toán và quay về trang chủ
        </Link>
      </div>
    </>
  )
}
