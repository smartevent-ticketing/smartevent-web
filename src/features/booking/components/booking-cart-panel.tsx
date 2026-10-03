"use client"

import {
  ArrowRight,
  Calendar,
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Timer,
  Trash2,
} from "lucide-react"
import type { useBookingCart } from "../hooks/use-booking-cart"
import { getSeatLabel } from "../model/booking-cart"

interface Props {
  booking: ReturnType<typeof useBookingCart>
}

export function BookingCartPanel({ booking }: Props) {
  const {
    event,
    cart,
    totalCartCount,
    totalCartPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
    handleConfirmReservation,
    isSubmitting,
    eventTitle,
    locationName,
  } = booking
  if (!event) return null

  return (
    <aside aria-label="Vé đã chọn" className="w-full lg:sticky lg:top-24 lg:w-[380px] lg:shrink-0">
      <div className="flex flex-col rounded-2xl border border-outline-variant bg-white shadow-sm lg:max-h-[calc(100dvh-7rem)]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-outline-variant px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary-container text-primary">
              <ShoppingCart className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Vé đã chọn</h2>
              <p className="mt-0.5 text-xs text-on-surface-variant">
                {totalCartCount} vé trong giỏ hàng
              </p>
            </div>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="min-h-11 text-xs font-medium text-on-surface-variant hover:text-red-600"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        <div className="shrink-0 space-y-2 px-5 py-5 sm:px-6">
          <h3 className="text-sm font-semibold leading-6">{eventTitle}</h3>
          <p className="flex items-start gap-2 text-xs leading-5 text-on-surface-variant">
            <Calendar className="mt-0.5 size-3.5 shrink-0" />
            <span>
              {event.startTime
                ? new Date(event.startTime).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Chưa cập nhật ngày"}
            </span>
          </p>
          <p className="flex items-start gap-2 text-xs leading-5 text-on-surface-variant">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            <span>{locationName}</span>
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="mx-5 mb-5 rounded-xl border border-dashed border-outline-variant bg-surface px-5 py-8 text-center sm:mx-6">
            <ShoppingCart className="mx-auto size-7 text-on-surface-variant/60" />
            <h3 className="mt-4 text-sm font-semibold">Chưa có vé trong giỏ</h3>
            <p className="mt-2 text-xs leading-5 text-on-surface-variant">
              Chọn hạng vé và số lượng. Các vé đã chọn sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto border-t border-outline-variant px-5 py-5 sm:px-6">
            {cart.map((item) => (
              <div
                key={item.id}
                className="space-y-3 border-b border-outline-variant pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold">{item.ticketTypeName}</h3>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                      {item.salePhaseName} · {item.areaName}
                    </p>
                    {item.areaType === "SEATED" && item.selectedSeats && (
                      <p className="mt-1 text-xs leading-5 text-primary">
                        Ghế: {item.selectedSeats.map((s) => getSeatLabel(s)).join(", ")}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={"Xóa vé " + item.ticketTypeName}
                    className="flex size-11 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-on-surface-variant">
                    {item.unitPrice.toLocaleString("vi-VN")} ₫ / vé
                  </span>
                  {item.areaType === "STANDING" ? (
                    <div className="inline-flex items-center overflow-hidden rounded-lg border border-outline-variant bg-white">
                      <button
                        type="button"
                        aria-label={"Giảm số lượng vé " + item.ticketTypeName}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex size-10 items-center justify-center hover:bg-surface"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="min-w-7 text-center text-sm font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={"Tăng số lượng vé " + item.ticketTypeName}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={
                          item.quantity >= item.maxAllowed || item.quantity >= item.available
                        }
                        className="flex size-10 items-center justify-center hover:bg-surface disabled:opacity-40"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-medium">{item.quantity} vé</span>
                  )}
                </div>
                <p className="text-right text-sm font-semibold tabular-nums">
                  {(item.unitPrice * item.quantity).toLocaleString("vi-VN")} ₫
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="shrink-0 space-y-5 border-t border-outline-variant bg-surface/40 px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs text-on-surface-variant">Tổng tiền vé</p>
              <p className="mt-1 text-sm font-medium">{totalCartCount} vé đã chọn</p>
            </div>
            <p className="text-2xl font-bold tracking-tight tabular-nums">
              {totalCartPrice.toLocaleString("vi-VN")} <span className="text-base">₫</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleConfirmReservation}
            disabled={isSubmitting || cart.length === 0}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-primary/40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Đang xử lý giữ chỗ...</span>
              </>
            ) : (
              <>
                <span>Giữ vé & tiếp tục</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
          <p className="flex items-start gap-2 text-xs leading-5 text-on-surface-variant">
            <Timer className="mt-0.5 size-4 shrink-0" />
            <span>Thời hạn thanh toán được hiển thị sau khi xác nhận giữ chỗ.</span>
          </p>
        </div>
      </div>
    </aside>
  )
}
