"use client"

import Link from "next/link"
import { Ban, Clock, CreditCard, X } from "lucide-react"
import type { components } from "@/lib/api/schema"
import { useDeadline } from "@/hooks/use-deadline"
import { getOrderDetailState } from "../model/order-detail"

type Order = components["schemas"]["OrderResponse"]

interface OrderDetailDialogProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onRequestCancel: (orderId: string) => void
}

const money = (amount: number | undefined) =>
  typeof amount === "number" ? `${amount.toLocaleString("vi-VN")} ₫` : "Chưa có thông tin"

export function OrderDetailDialog({
  order,
  isOpen,
  onClose,
  onRequestCancel,
}: OrderDetailDialogProps) {
  const deadline = useDeadline(order?.paymentDeadline)

  if (!isOpen || !order) return null

  const { isPending, isPaid, isCancelled, isExpired, items, ticketCount } = getOrderDetailState(
    order,
    deadline.secondsLeft,
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-outline-variant/60 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-on-surface font-mono">
                Đơn hàng #{order.orderCode ?? order.id}
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
                        : (order.status ?? "Chưa rõ")}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Ngày tạo:{" "}
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString("vi-VN")
                : "Chưa có thông tin"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết đơn hàng"
            className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isPending && (
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <Clock className="size-5 text-amber-800 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-950">Thanh toán trước khi hết hạn</h4>
                  <p className="text-xs text-amber-800">
                    Hạn:{" "}
                    {order.paymentDeadline
                      ? new Date(order.paymentDeadline).toLocaleString("vi-VN")
                      : "Chưa có thông tin"}
                  </p>
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-900 tabular-nums shrink-0">
                {deadline.timerDisplay}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Danh sách vé ({ticketCount})
            </h4>
            {items.length === 0 ? (
              <p className="rounded-2xl border border-outline-variant/60 p-4 text-xs text-on-surface-variant">
                Chưa có thông tin chi tiết vé cho đơn hàng này.
              </p>
            ) : (
              <div className="divide-y divide-outline-variant/40 rounded-2xl border border-outline-variant/60 overflow-hidden">
                {items.map((item, index) => (
                  <div
                    key={item.id ?? index}
                    className="p-4 bg-white flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-on-surface block">
                        {item.ticketTypeName ?? "Vé sự kiện"}
                      </span>
                      <span className="text-on-surface-variant block">
                        {item.seatCode ?? "Khu vực tự do"} · Số lượng: {item.quantity ?? "Chưa rõ"}
                      </span>
                      <span className="text-on-surface-variant block">
                        Đơn giá: {money(item.unitPrice)}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-on-surface">
                      {money(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-surface-container-low/60 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-on-surface-variant">
              <span>Tạm tính ({ticketCount} vé)</span>
              <span className="font-mono">{money(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Giảm giá</span>
              <span className="font-mono">{money(order.discountAmount)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Phí dịch vụ</span>
              <span className="font-mono">{money(order.feeAmount)}</span>
            </div>
            <div className="border-t border-outline-variant/60 pt-2 flex justify-between items-center text-sm font-bold text-on-surface">
              <span>Tổng thanh toán</span>
              <span className="text-base font-mono text-primary font-bold">
                {money(order.totalAmount)}
              </span>
            </div>
          </div>

          {order.customerNote && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-on-surface-variant">Ghi chú đơn hàng:</span>
              <p className="text-xs p-3 rounded-xl bg-surface-container-low text-on-surface italic">
                {order.customerNote}
              </p>
            </div>
          )}

          {order.selectedPaymentMethod && (
            <div className="flex items-center gap-2.5 p-4 rounded-2xl border border-outline-variant/60 bg-white text-xs">
              <CreditCard className="size-4 text-primary" />
              <span className="font-bold text-on-surface">
                Phương thức thanh toán: {order.selectedPaymentMethod}
              </span>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-outline-variant/60 bg-surface-container-low/40 flex flex-wrap items-center justify-between gap-3">
          <div>
            {isPending && order.id && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onRequestCancel(order.id!)
                }}
                className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <Ban className="size-3.5" /> Hủy đơn hàng
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
            {isPending && order.id && (
              <Link
                href={`/payment?orderId=${encodeURIComponent(order.id)}`}
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
