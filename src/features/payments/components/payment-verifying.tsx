"use client"

import { Clock, Loader2 } from "lucide-react"

import { usePaymentResult } from "@/features/payments/hooks/use-payment-result"

type Props = Pick<ReturnType<typeof usePaymentResult>, "status" | "pollCount">

export function PaymentVerifying({ status, pollCount }: Props) {
  return (
    <>
      {status === "verifying" && (
        <div className="text-center space-y-6 py-6">
          <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto animate-pulse">
            <Loader2 className="size-10 animate-spin" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-on-surface">
              Đang xác thực thanh toán VNPay...
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
              Hệ thống đang đồng bộ kết quả giao dịch từ cổng thanh toán VNPay. Vui lòng không đóng
              hoặc tải lại trang trong giây lát.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low border border-outline-variant/60 text-xs font-semibold text-primary">
            <Clock className="size-3.5" />
            <span>Đang kiểm tra lần {pollCount}/5...</span>
          </div>
        </div>
      )}
    </>
  )
}
