"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  Armchair,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Ticket,
  Timer,
  Trash2,
  User,
  X,
} from "lucide-react"

import { useBookingCart, type EventSeat } from "./hooks/use-booking-cart"
import { ActiveReservationNotice } from "./components/active-reservation-notice"
import { SeatMap } from "./components/seat-map"

function getSeatLabel(s: EventSeat) {
  return s.label || `${s.rowName || ""}${s.seatNumber || ""}` || "Ghế"
}

export function SeatSelectionView({ eventId }: { eventId: string }) {
  const {
    isAuthLoading,
    event,
    availableTiers,
    cart,
    totalCartCount,
    totalCartPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    // Seat modal for SEATED tickets
    seatModalTier,
    seatModalSelectedSeats,
    openSeatModal,
    closeSeatModal,
    handleToggleSeatModal,
    confirmSeatSelection,
    modalAvailableSeats,
    isLoadingModalSeats,
    // Actions & states
    activeReservation,
    handleCancelActiveReservation,
    handleConfirmReservation,
    isLoading,
    isSubmitting,
    errorMessage,
    setErrorMessage,
    eventTitle,
    locationName,
  } = useBookingCart({ eventId })

  const [activeFilter, setActiveFilter] = useState<"ALL" | "STANDING" | "SEATED">("ALL")

  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3 text-on-surface-variant">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Đang tải thông tin đặt vé và giỏ hàng...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-outline-variant/60 shadow-lg text-center space-y-4">
          <div className="size-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-on-surface">Không tìm thấy sự kiện</h2>
          <p className="text-sm text-on-surface-variant">
            {errorMessage || "Sự kiện không tồn tại hoặc đã ngừng mở bán vé."}
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover transition"
          >
            <ArrowLeft className="size-4" />
            <span>Khám phá các sự kiện khác</span>
          </Link>
        </div>
      </div>
    )
  }

  const filteredTiers = availableTiers.filter((tier) => {
    if (activeFilter === "ALL") return true
    return tier.areaType === activeFilter
  })

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* Top Reservation Bar */}
      <div className="bg-white border-b border-outline-variant/60 sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/events/${eventId}`}
            className="text-xs sm:text-sm font-semibold text-primary hover:underline shrink-0"
          >
            ← Quay lại sự kiện
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-xs sm:text-sm font-bold text-on-surface truncate">
            {eventTitle} — Đặt vé & Giữ chỗ
          </span>
        </div>

        {/* 10-Minute Timer Badge */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-xs shrink-0">
          <Timer className="size-4 animate-pulse text-amber-600" />
          <span className="hidden sm:inline">Thời gian giữ chỗ:</span>
          <span className="font-mono text-sm sm:text-base">10 phút</span>
        </div>
      </div>

      {/* Cảnh báo nếu đang có phiên giữ chỗ cũ */}
      <ActiveReservationNotice
        {...{ activeReservation, isSubmitting, handleCancelActiveReservation }}
      />

      {/* Thông báo lỗi nếu có */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs sm:text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container: Ticket List (Left) + Cart & Checkout (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 gap-8 items-start">
        {/* Left Column: Danh sách các hạng vé đang mở bán */}
        <div className="flex-1 bg-white rounded-3xl border border-outline-variant/60 p-6 space-y-6 shadow-sm w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-outline-variant/60 pb-4">
            <div>
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <Ticket className="size-5 text-primary" />
                <span>Danh sách vé đang mở bán</span>
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Chọn hạng vé và số lượng để thêm vào giỏ hàng bên phải
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  activeFilter === "ALL"
                    ? "bg-on-surface text-surface"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Tất cả ({availableTiers.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("STANDING")}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  activeFilter === "STANDING"
                    ? "bg-primary text-white"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Khu đứng ({availableTiers.filter((t) => t.areaType === "STANDING").length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("SEATED")}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  activeFilter === "SEATED"
                    ? "bg-purple-700 text-white"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Khu có ghế ({availableTiers.filter((t) => t.areaType === "SEATED").length})
              </button>
            </div>
          </div>

          {/* List of Tiers */}
          {filteredTiers.length === 0 ? (
            <div className="py-16 text-center space-y-3 text-on-surface-variant">
              <Ticket className="size-10 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-on-surface">Không có vé phù hợp</h3>
              <p className="text-xs">Hiện không có hạng vé nào thuộc danh mục này đang mở bán.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTiers.map((tier) => {
                const cartItemId = `${tier.id}-${tier.phaseId}`
                const cartItem = cart.find((item) => item.id === cartItemId)
                const inCartQty = cartItem?.quantity || 0

                return (
                  <div
                    key={cartItemId}
                    className={`rounded-2xl border p-5 transition flex flex-col justify-between space-y-4 ${
                      inCartQty > 0
                        ? "border-primary bg-primary/3 shadow-xs"
                        : "border-outline-variant/60 bg-white hover:border-primary/40 hover:shadow-2xs"
                    }`}
                  >
                    {/* Header */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-on-surface">{tier.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {tier.areaType === "STANDING" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                <User className="size-3" />
                                <span>Khu đứng</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                <Armchair className="size-3" />
                                <span>Khu có ghế</span>
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-surface-container text-on-surface-variant">
                              {tier.phaseName}
                            </span>
                          </div>
                        </div>

                        {inCartQty > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                            <CheckCircle2 className="size-3.5" />
                            <span>Đã trong giỏ</span>
                          </span>
                        )}
                      </div>

                      {tier.description && (
                        <p className="text-xs text-on-surface-variant line-clamp-2">
                          {tier.description}
                        </p>
                      )}
                    </div>

                    {/* Pricing & Stock */}
                    <div className="pt-2 border-t border-outline-variant/40 flex items-baseline justify-between">
                      <div>
                        <div className="text-lg font-black text-primary">
                          {tier.price.toLocaleString("vi-VN")} ₫
                        </div>
                        <span className="text-[11px] text-green-700 font-semibold block">
                          {tier.available > 0 ? `Còn ${tier.available} vé` : "Hết vé"}
                        </span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant">
                        Tối đa {tier.maxAllowed} vé/đơn
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-1">
                      {tier.areaType === "STANDING" ? (
                        inCartQty > 0 ? (
                          <div className="flex items-center justify-between bg-surface-container-low p-2 rounded-xl border border-primary/30">
                            <span className="text-xs font-bold text-on-surface pl-2">
                              Số lượng trong giỏ:
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden bg-white">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(cartItemId, inCartQty - 1)}
                                  className="px-2.5 py-1 text-xs font-bold text-on-surface hover:bg-surface-container transition cursor-pointer"
                                  title="Giảm số lượng"
                                >
                                  -
                                </button>
                                <span className="px-3 py-1 text-xs font-bold text-primary min-w-7 text-center">
                                  {inCartQty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(cartItemId, inCartQty + 1)}
                                  className="px-2.5 py-1 text-xs font-bold text-on-surface hover:bg-surface-container transition cursor-pointer disabled:opacity-40"
                                  disabled={
                                    inCartQty >= tier.maxAllowed || inCartQty >= tier.available
                                  }
                                  title="Tăng số lượng"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFromCart(cartItemId)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                title="Xóa khỏi giỏ"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(tier, 1)}
                            disabled={tier.available <= 0}
                            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="size-4" />
                            <span>Thêm vào giỏ hàng</span>
                          </button>
                        )
                      ) : /* SEATED Ticket */
                      inCartQty > 0 ? (
                        <div className="flex items-center justify-between bg-purple-50/50 p-2.5 rounded-xl border border-purple-200">
                          <div>
                            <span className="text-xs font-bold text-purple-900 block">
                              Đã chọn {cartItem?.selectedSeats?.length || 0} ghế
                            </span>
                            <span className="text-[11px] text-purple-700 font-mono">
                              {cartItem?.selectedSeats?.map((s) => getSeatLabel(s)).join(", ")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openSeatModal(tier)}
                              className="px-3 py-1.5 text-xs font-bold text-purple-800 bg-purple-100 hover:bg-purple-200 rounded-lg transition cursor-pointer"
                            >
                              Đổi ghế
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFromCart(cartItemId)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                              title="Xóa vé"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openSeatModal(tier)}
                          disabled={tier.available <= 0}
                          className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Armchair className="size-4" />
                          <span>Chọn vị trí ghế ngồi & Thêm</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Giỏ hàng vé & Xác nhận giữ chỗ */}
        <div className="w-full lg:w-[420px] flex flex-col gap-6 sticky top-20">
          <div className="bg-white rounded-3xl p-6 border border-outline-variant/60 shadow-lg space-y-6">
            {/* Cart Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-4">
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
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-1.5 text-xs text-on-surface-variant">
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
              <div className="py-10 text-center space-y-3 text-on-surface-variant border-y border-outline-variant/40">
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
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 border-y border-outline-variant/40 py-3">
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
                        <span className="text-xs font-bold text-on-surface">
                          x{item.quantity} vé
                        </span>
                      )}
                    </div>

                    <div className="text-right text-xs font-black text-on-surface pt-1 border-t border-outline-variant/30">
                      Thành tiền: {(item.unitPrice * item.quantity).toLocaleString("vi-VN")} ₫
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Price Breakdown */}
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
              <div className="flex items-center justify-between text-base font-extrabold text-on-surface pt-3 border-t border-outline-variant/40">
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

      {/* Seat Selection Modal (Cho các hạng vé SEATED) */}
      {seatModalTier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 border border-outline-variant/60 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
              <div>
                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <Armchair className="size-5 text-purple-700" />
                  <span>Chọn vị trí ghế ngồi: {seatModalTier.name}</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Khu vực: <strong>{seatModalTier.areaName}</strong> — Tối đa{" "}
                  {seatModalTier.maxAllowed} ghế
                </p>
              </div>
              <button
                type="button"
                onClick={closeSeatModal}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Seat Map */}
            <SeatMap
              availableSeats={modalAvailableSeats}
              isLoadingSeats={isLoadingModalSeats}
              selectedSeats={seatModalSelectedSeats}
              selectedArea={{ name: seatModalTier.areaName }}
              isSeated={true}
              maxAllowed={seatModalTier.maxAllowed}
              handleToggleSeat={handleToggleSeatModal}
            />

            {/* Modal Footer */}
            <div className="pt-3 border-t border-outline-variant/60 flex items-center justify-between">
              <div className="text-xs font-semibold text-on-surface">
                Đã chọn:{" "}
                <span className="text-primary font-bold text-sm">
                  {seatModalSelectedSeats.length}
                </span>{" "}
                / {seatModalTier.maxAllowed} ghế
                {seatModalSelectedSeats.length > 0 && (
                  <span className="text-on-surface-variant ml-2 font-mono">
                    ({seatModalSelectedSeats.map((s) => getSeatLabel(s)).join(", ")})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeSeatModal}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-outline-variant hover:bg-surface-container transition"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmSeatSelection}
                  disabled={seatModalSelectedSeats.length === 0}
                  className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Xác nhận chọn ghế
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
