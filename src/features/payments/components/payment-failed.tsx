"use client"

import Link from "next/link"
import { AlertCircle, ArrowRight, Home } from "lucide-react"
const VNPAY_ERROR_CODES: Record<string, string> = {
  "07": "Trừ tiền thành công nhưng giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
  "09": "Thẻ/Tài khoản của bạn chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
  "10": "Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.",
  "11": "Đã hết hạn chờ thanh toán. Phiên giao dịch đã kết thúc.",
  "12": "Thẻ/Tài khoản của bạn bị khóa.",
  "13": "Bạn đã nhập sai mật khẩu xác thực giao dịch (OTP).",
  "24": "Giao dịch đã bị hủy bởi người dùng.",
  "51": "Tài khoản của bạn không đủ số dư để thực hiện giao dịch.",
  "65": "Tài khoản của bạn đã vượt quá hạn mức giao dịch trong ngày.",
  "75": "Ngân hàng thanh toán đang bảo trì.",
  "79": "Bạn đã nhập sai mật khẩu thanh toán quá số lần quy định.",
  "99": "Lỗi không xác định từ cổng thanh toán VNPay.",
}
import { usePaymentResult } from "@/features/payments/hooks/use-payment-result"

type Props = Pick<
  ReturnType<typeof usePaymentResult>,
  "vnp_ResponseCode" | "orderCode" | "status" | "errorMessage"
>

export function PaymentFailed({ vnp_ResponseCode, orderCode, status, errorMessage }: Props) {
  return (
    <>
      {status === "failed" && (
        <div className="text-center space-y-6">
          <div className="size-20 rounded-full bg-red-100 border-4 border-red-200 flex items-center justify-center text-red-600 mx-auto shadow-sm">
            <AlertCircle className="size-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase">
              Giao dịch không thành công
            </span>
            <h1 className="text-2xl font-black text-on-surface">Thanh toán chưa hoàn tất</h1>
            <p className="text-xs sm:text-sm text-red-700 max-w-md mx-auto leading-relaxed">
              {errorMessage ||
                (vnp_ResponseCode && VNPAY_ERROR_CODES[vnp_ResponseCode]) ||
                "Giao dịch thanh toán đã bị hủy hoặc không thể hoàn thành qua cổng VNPay."}
            </p>
          </div>

          {orderCode && (
            <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/60 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Mã đơn hàng:</span>
                <span className="font-mono font-bold text-on-surface">{orderCode}</span>
              </div>
              {vnp_ResponseCode && (
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Mã phản hồi VNPay:</span>
                  <span className="font-mono font-semibold text-red-600">{vnp_ResponseCode}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Link
              href="/events"
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Thử đặt vé lại</span>
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
