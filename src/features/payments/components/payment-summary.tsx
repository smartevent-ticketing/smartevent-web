"use client"

import { Copy } from "lucide-react"
import { usePayment } from "@/features/payments/hooks/use-payment"

type Props = Pick<
  ReturnType<typeof usePayment>,
  "copied" | "effectiveAmount" | "effectiveCode" | "handleCopyOrderId"
>

export function PaymentSummary({
  copied,
  effectiveAmount,
  effectiveCode,
  handleCopyOrderId,
}: Props) {
  return (
    <>
      <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/60 space-y-3">
        <div className="flex justify-between items-center text-xs text-on-surface-variant">
          <span>Mã đơn hàng:</span>
          <div className="flex items-center gap-1.5 font-mono font-bold text-on-surface">
            <span>{effectiveCode}</span>
            <button
              type="button"
              onClick={handleCopyOrderId}
              className="text-primary hover:underline cursor-pointer"
              title="Sao chép mã đơn"
            >
              {copied ? (
                <span className="text-xs text-green-600 font-sans">Đã chép</span>
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-on-surface-variant">
          <span>Phương thức:</span>
          <span className="font-semibold text-on-surface">VNPAY (Thẻ / QR / Mobile Banking)</span>
        </div>

        <div className="border-t border-outline-variant/60 pt-3 flex justify-between items-center">
          <span className="text-xs font-bold text-on-surface">Tổng tiền thanh toán:</span>
          <span className="text-2xl font-black text-primary">
            {effectiveAmount.toLocaleString("vi-VN")} ₫
          </span>
        </div>
      </div>
    </>
  )
}
