"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle2, Home, Ticket } from "lucide-react"

import { usePaymentResult } from "@/features/payments/hooks/use-payment-result"

type Props = Pick<
  ReturnType<typeof usePaymentResult>,
  | "vnp_TransactionNo"
  | "vnp_BankCode"
  | "vnp_PayDate"
  | "orderCode"
  | "status"
  | "displayAmount"
  | "formatPayDate"
>

export function PaymentSuccess({
  vnp_TransactionNo,
  vnp_BankCode,
  vnp_PayDate,
  orderCode,
  status,
  displayAmount,
  formatPayDate,
}: Props) {
  return (
    <>
      {status === "success" && (
        <div className="text-center space-y-6">
          <div className="size-20 rounded-full bg-green-100 border-4 border-green-200 flex items-center justify-center text-green-600 mx-auto shadow-sm animate-bounce-short">
            <CheckCircle2 className="size-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase">
              Giao dịch hợp lệ
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-on-surface">
              Thanh toán thành công!
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto">
              Đơn hàng của bạn đã hoàn tất. Vé điện tử kèm mã QR đã được tạo và sẵn sàng sử dụng.
            </p>
          </div>

          {/* Chi tiết đơn hàng */}
          <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/60 text-xs space-y-2.5 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/40">
              <span className="text-on-surface-variant">Mã đơn hàng</span>
              <span className="font-mono font-bold text-on-surface text-sm">{orderCode}</span>
            </div>
            {vnp_TransactionNo && (
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Mã giao dịch VNPay</span>
                <span className="font-mono font-semibold text-on-surface">{vnp_TransactionNo}</span>
              </div>
            )}
            {vnp_BankCode && (
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Ngân hàng / Kênh</span>
                <span className="font-semibold text-on-surface">{vnp_BankCode}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Thời gian thanh toán</span>
              <span className="text-on-surface">{formatPayDate(vnp_PayDate)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-outline-variant/40">
              <span className="font-bold text-on-surface text-sm">Số tiền đã thanh toán</span>
              <span className="font-black text-primary text-lg">
                {displayAmount.toLocaleString("vi-VN")} ₫
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3 pt-2">
            <Link
              href="/account?tab=tickets"
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Ticket className="size-4" />
              <span>Xem vé của bạn ngay</span>
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
