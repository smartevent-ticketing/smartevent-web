"use client"

import {
  ArrowRight,
  Calendar,
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
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
    <>
      {/* Right Column: Giỏ hàng vé & Xác nhận giữ chỗ */}
      <div className="w-full lg:w-[420px] sticky top-20">
        <div className="bg-white rounded-3xl p-6 border border-outline-variant/60 shadow-lg flex flex-col max-h-[calc(100vh-6rem)]">
          {/* Cart Header */}
          <div className="shrink-0 flex items-center justify-between border-b border-outline-variant/60 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <ShoppingCart className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">Giỏ hàng giữ chỗ</h3>
                <span className="text-xs text-on-surface-variant font-medium">
                  Tổng cộng: {totalCartCount} vé
                </span>
              </div>
            </div>

            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
              >
                Xóa giỏ hàng
              </button>
            )}
          </div>

          {/* Event Info Brief */}
          <div className="shrink-0 p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-1.5 text-xs text-on-surface-variant mb-4">
            <h4 className="font-bold text-on-surface line-clamp-1 text-xs">{eventTitle}</h4>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3 text-primary shrink-0" />
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
            </div>
            <div className="flex items-center gap-1.5 line-clamp-1">
              <MapPin className="size-3 text-primary shrink-0" />
              <span>{locationName}</span>
            </div>
          </div>

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div className="py-8 text-center space-y-3 text-on-surface-variant border-y border-outline-variant/40 mb-4 shrink-0">
              <div className="size-12 rounded-2xl bg-surface-container text-on-surface-variant mx-auto flex items-center justify-center">
                <ShoppingCart className="size-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-on-surface">Giỏ hàng đang trống</h4>
                <p className="text-xs max-w-xs mx-auto">
                  Vui lòng chọn loại vé từ danh sách bên trái để tiến hành giữ chỗ và thanh toán.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 border-y border-outline-variant/40 py-3 mb-4 space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{item.ticketTypeName}</h4>
                      <div className="text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                        <span>{item.salePhaseName}</span>
                        <span>•</span>
                        <span>{item.areaName}</span>
                      </div>
                      {item.areaType === "SEATED" && item.selectedSeats && (
                        <div className="text-[11px] font-semibold text-purple-700 mt-1">
                          Ghế: {item.selectedSeats.map((s) => getSeatLabel(s)).join(", ")}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-on-surface-variant hover:text-red-600 transition p-1"
                      title="Xóa vé này"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-primary">
                      {item.unitPrice.toLocaleString("vi-VN")} ₫ / vé
                    </span>

                    {/* Stepper for Standing */}
                    {item.areaType === "STANDING" ? (
                      <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-xs font-bold text-on-surface hover:bg-surface-container transition"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="px-2.5 py-1 text-xs font-bold text-on-surface min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={
                            item.quantity >= item.maxAllowed || item.quantity >= item.available
                          }
                          className="px-2.5 py-1 text-xs font-bold text-on-surface hover:bg-surface-container transition disabled:opacity-40"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-on-surface">x{item.quantity} vé</span>
                    )}
                  </div>

                  <div className="text-right text-xs font-black text-on-surface pt-1 border-t border-outline-variant/30">
                    Thành tiền: {(item.unitPrice * item.quantity).toLocaleString("vi-VN")} ₫
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer: Price breakdown + CTA button + guarantee */}
          <div className="shrink-0 pt-1 space-y-4">
            <div className="space-y-2 text-xs text-on-surface-variant">
              <div className="flex items-center justify-between">
                <span>Tạm tính ({totalCartCount} vé)</span>
                <span className="font-semibold text-on-surface">
                  {totalCartPrice.toLocaleString("vi-VN")} ₫
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Phí dịch vụ tiện ích</span>
                <span className="text-green-600 font-semibold">Miễn phí</span>
              </div>
              <div className="flex items-center justify-between text-base font-extrabold text-on-surface pt-2.5 border-t border-outline-variant/40">
                <span>Tổng thanh toán</span>
                <span className="text-primary text-2xl font-black">
                  {totalCartPrice.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>

            {/* Confirm CTA Button */}
            <button
              type="button"
              onClick={handleConfirmReservation}
              disabled={isSubmitting || cart.length === 0}
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Đang xử lý giữ chỗ...</span>
                </>
              ) : (
                <>
                  <span>Xác nhận & Giữ chỗ 10 phút</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-on-surface-variant text-center">
              <ShieldCheck className="size-4 text-green-600 shrink-0" />
              <span>Ghế và vé được giữ an toàn trong 10 phút sau khi xác nhận</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
