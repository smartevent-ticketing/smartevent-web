"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  X,
  Clock,
  Ticket,
  Calendar,
  MapPin,
  CreditCard,
  AlertCircle,
  FileText,
  ShieldCheck,
  Ban,
} from "lucide-react"

interface OrderDetailDialogProps {
  order: any | null
  isOpen: boolean
  onClose: () => void
  onRequestCancel: (orderId: string) => void
}

export function OrderDetailDialog({
  order,
  isOpen,
  onClose,
  onRequestCancel,
}: OrderDetailDialogProps) {
  const [timeLeft, setTimeLeft] = useState<number>(600) // 10 minutes default for pending

  useEffect(() => {
    if (!order || order.status !== "PENDING_PAYMENT") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [order])

  if (!isOpen || !order) return null

  const isPending = order.status === "PENDING_PAYMENT"
  const isPaid = order.status === "PAID"
  const isCancelled = order.status === "CANCELLED"
  const isExpired = order.status === "EXPIRED"

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const countdownFormatted = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`

  const items = order.items || [
    {
      id: "item-1",
      ticketTypeName: "Vé VIP Khán Đài A",
      seatCode: "Hàng A - Ghế 12",
      price: (order.totalAmount || 1250000) / 2,
    },
    {
      id: "item-2",
      ticketTypeName: "Vé VIP Khán Đài A",
      seatCode: "Hàng A - Ghế 13",
      price: (order.totalAmount || 1250000) / 2,
    },
  ]

  const subtotal = order.totalAmount || 1250000
  const serviceFee = 0
  const vat = 0

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-outline-variant/60 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-on-surface font-mono">
                Đơn hàng #{order.orderCode || order.id}
              </h3>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                  isPaid
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : isPending
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : isCancelled
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-gray-100 text-gray-600"
                }`}
              >
                {isPaid
                  ? "Đã thanh toán"
                  : isPending
                    ? "Chờ thanh toán"
                    : isCancelled
                      ? "Đã hủy"
                      : isExpired
                        ? "Hết hạn"
                        : order.status}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Ngày tạo:{" "}
              {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "Gần đây"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Countdown Hold Banner (if Pending) */}
          {isPending && (
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Clock className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950">Thanh toán ngay để giữ vé!</h4>
                  <p className="text-xs text-amber-800">
                    Vé sẽ được giữ tối đa trong 10 phút. Vui lòng hoàn tất thanh toán trước hạn.
                  </p>
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-900 tabular-nums shrink-0">
                {countdownFormatted}
              </div>
            </div>
          )}

          {/* Event Information Card */}
          <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/60 flex items-start gap-4">
            <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Ticket className="size-6" />
            </div>
            <div className="space-y-1 text-xs">
              <h4 className="text-sm font-bold text-on-surface">
                {order.eventName || "Sự kiện biểu diễn SMART EVENT"}
              </h4>
              <p className="text-on-surface-variant flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary" />
                <span>{order.eventDate || "Thời gian theo thông tin vé"}</span>
              </p>
              <p className="text-on-surface-variant flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" />
                <span>{order.venueName || "Địa điểm tổ chức sự kiện"}</span>
              </p>
            </div>
          </div>

          {/* Tickets list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Danh sách vé ({items.length})
            </h4>
            <div className="divide-y divide-outline-variant/40 rounded-2xl border border-outline-variant/60 overflow-hidden">
              {items.map((it: any, idx: number) => (
                <div
                  key={it.id || idx}
                  className="p-4 bg-white flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-on-surface block">
                      {it.ticketTypeName || "Vé sự kiện"}
                    </span>
                    <span className="text-on-surface-variant">
                      {it.seatCode || it.seatName || "Khu vực tự do"}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-on-surface">
                    {(it.price || 0).toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="bg-surface-container-low/60 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-on-surface-variant">
              <span>Tạm tính ({items.length} vé)</span>
              <span className="font-mono">{subtotal.toLocaleString("vi-VN")} ₫</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Phí dịch vụ hệ thống</span>
              <span className="font-mono">{serviceFee.toLocaleString("vi-VN")} ₫</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Thuế VAT (Hóa đơn điện tử)</span>
              <span className="font-mono">Đã bao gồm trong giá vé</span>
            </div>
            <div className="border-t border-outline-variant/60 pt-2 flex justify-between items-center text-sm font-bold text-on-surface">
              <span>Tổng thanh toán</span>
              <span className="text-base font-mono text-primary font-bold">
                {subtotal.toLocaleString("vi-VN")} ₫
              </span>
            </div>
          </div>

          {/* Customer Note if present */}
          {order.customerNote && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-on-surface-variant">Ghi chú đơn hàng:</span>
              <p className="text-xs p-3 rounded-xl bg-surface-container-low text-on-surface italic">
                &ldquo;{order.customerNote}&rdquo;
              </p>
            </div>
          )}

          {/* Payment Method */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-outline-variant/60 bg-white text-xs">
            <div className="flex items-center gap-2.5">
              <CreditCard className="size-4 text-primary" />
              <div>
                <span className="font-bold text-on-surface block">Cổng thanh toán VNPay</span>
                <span className="text-[11px] text-on-surface-variant">
                  Thẻ ATM nội địa, QR Pay, Visa/Mastercard
                </span>
              </div>
            </div>
            <ShieldCheck className="size-4 text-green-600" />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-outline-variant/60 bg-surface-container-low/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isPending && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onRequestCancel(order.id)
                }}
                className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <Ban className="size-3.5" />
                <span>Hủy đơn hàng</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition cursor-pointer"
            >
              Đóng
            </button>
            {isPending && (
              <Link
                href={`/payment?orderId=${order.id}&orderCode=${order.orderCode}&amount=${order.totalAmount}`}
                className="px-6 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow-xs inline-block"
              >
                Tiến hành thanh toán
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
