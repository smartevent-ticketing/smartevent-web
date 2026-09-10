"use client"

import { Calendar, Loader2, MapPin, ShieldCheck } from "lucide-react"
import { useCheckout } from "@/features/booking/hooks/use-checkout"

type Props = Pick<
  ReturnType<typeof useCheckout>,
  "isProcessing" | "isExpired" | "handlePayment" | "eventName" | "totalAmount" | "items"
>

export function CheckoutSummary({
  isProcessing,
  isExpired,
  handlePayment,
  eventName,
  totalAmount,
  items,
}: Props) {
  return (
    <>
      <div className="lg:col-span-5">
        <div className="bg-white rounded-3xl p-6 border border-outline-variant/60 shadow-md space-y-6 sticky top-6">
          <h3 className="text-base font-bold text-on-surface border-b border-outline-variant/60 pb-4">
            Tóm tắt đơn hàng
          </h3>

          {/* Event mini card */}
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=300"
              alt="Event thumbnail"
              className="size-20 rounded-xl object-cover shrink-0"
            />
            <div className="space-y-1 min-w-0">
              <h4 className="text-sm font-bold text-on-surface line-clamp-2">{eventName}</h4>
              <p className="text-xs text-on-surface-variant flex items-center gap-1">
                <Calendar className="size-3.5 text-primary shrink-0" />
                <span>Sự kiện trực tiếp</span>
              </p>
              <p className="text-xs text-on-surface-variant flex items-center gap-1 truncate">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span>Địa điểm theo thông tin sự kiện</span>
              </p>
            </div>
          </div>

          {/* Ticket Breakdown */}
          <div className="p-4 rounded-2xl bg-surface-container-low space-y-2.5 border border-outline-variant/60 text-xs">
            {items.length > 0 ? (
              items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="space-y-1 pb-2 border-b border-outline-variant/40 last:border-b-0 last:pb-0"
                >
                  <div className="flex justify-between font-bold text-on-surface">
                    <span>{item.ticketTypeName || "Hạng vé"}</span>
                    <span>x {item.quantity}</span>
                  </div>
                  {item.seatCode && (
                    <div className="text-primary font-semibold">Số ghế: {item.seatCode}</div>
                  )}
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Đơn giá</span>
                    <span>{(item.unitPrice || 0).toLocaleString("vi-VN")} ₫</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-on-surface-variant py-2 text-center">
                Chưa có vé trong phiên giữ chỗ.
              </div>
            )}
          </div>

          {/* Financial Calculation */}
          <div className="space-y-2 text-xs text-on-surface-variant border-t border-outline-variant/60 pt-4">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>{totalAmount.toLocaleString("vi-VN")} ₫</span>
            </div>
            <div className="flex justify-between">
              <span>Thuế VAT (8%)</span>
              <span>Đã bao gồm trong giá vé</span>
            </div>
            <div className="flex justify-between">
              <span>Phí cổng thanh toán VNPay</span>
              <span className="text-green-600 font-semibold">0 ₫ (Miễn phí)</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-on-surface pt-3 border-t border-outline-variant/60">
              <span>Tổng thanh toán</span>
              <span className="text-2xl font-black text-primary">
                {totalAmount.toLocaleString("vi-VN")} ₫
              </span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            type="button"
            onClick={handlePayment}
            disabled={isProcessing || isExpired}
            className="w-full h-12 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Đang tạo đơn & kết nối VNPay...</span>
              </>
            ) : (
              <span>Thanh toán ngay qua VNPay</span>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-on-surface-variant text-center">
            <ShieldCheck className="size-4 text-green-600" />
            <span>Bảo mật cổng thanh toán chuẩn quốc tế SSL / TLS</span>
          </div>
        </div>
      </div>
    </>
  )
}
