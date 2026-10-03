"use client"

import { useState } from "react"
import { Armchair, CheckCircle2, Plus, Ticket, Trash2, User } from "lucide-react"
import type { useBookingCart } from "../hooks/use-booking-cart"
import { getSeatLabel } from "../model/booking-cart"

interface Props {
  booking: ReturnType<typeof useBookingCart>
}

export function BookingTierList({ booking }: Props) {
  const { availableTiers, cart, addToCart, updateQuantity, removeFromCart, openSeatModal } = booking
  const [activeFilter, setActiveFilter] = useState<"ALL" | "STANDING" | "SEATED">("ALL")
  const filteredTiers = availableTiers.filter(
    (tier) => activeFilter === "ALL" || tier.areaType === activeFilter,
  )
  return (
    <>
      {/* Left Column: Danh sách các hạng vé đang mở bán */}
      <div className="min-w-0 flex-1 bg-white rounded-2xl border border-outline-variant p-5 sm:p-6 space-y-6 shadow-sm w-full">
        <div className="flex flex-col gap-5 border-b border-outline-variant pb-5">
          <div>
            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <Ticket className="size-5 text-primary" />
              <span>Chọn hạng vé</span>
            </h2>
            <p className="text-sm text-on-surface-variant mt-2 leading-6">
              Các hạng vé và đợt mở bán hiện có của sự kiện.
            </p>
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <button
              type="button"
              aria-pressed={activeFilter === "ALL"}
              onClick={() => setActiveFilter("ALL")}
              className={`min-h-10 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                activeFilter === "ALL"
                  ? "bg-on-surface text-white"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              Tất cả ({availableTiers.length})
            </button>
            <button
              type="button"
              aria-pressed={activeFilter === "STANDING"}
              onClick={() => setActiveFilter("STANDING")}
              className={`min-h-10 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                activeFilter === "STANDING"
                  ? "bg-on-surface text-white"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              Khu đứng ({availableTiers.filter((t) => t.areaType === "STANDING").length})
            </button>
            <button
              type="button"
              aria-pressed={activeFilter === "SEATED"}
              onClick={() => setActiveFilter("SEATED")}
              className={`min-h-10 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                activeFilter === "SEATED"
                  ? "bg-on-surface text-white"
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
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredTiers.map((tier) => {
              const cartItemId = `${tier.id}-${tier.phaseId}`
              const cartItem = cart.find((item) => item.id === cartItemId)
              const inCartQty = cartItem?.quantity || 0

              return (
                <div
                  key={cartItemId}
                  className={`rounded-xl border p-5 transition-colors duration-200 flex flex-col justify-between space-y-5 ${
                    inCartQty > 0
                      ? "border-primary/45 bg-primary-container/50"
                      : "border-outline-variant bg-white hover:border-primary/35"
                  }`}
                >
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-on-surface">{tier.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {tier.areaType === "STANDING" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-surface text-on-surface-variant border border-outline-variant">
                              <User className="size-3" />
                              <span>Khu đứng</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-surface text-on-surface-variant border border-outline-variant">
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
                      <p className="text-sm leading-6 text-on-surface-variant line-clamp-2">
                        {tier.description}
                      </p>
                    )}
                  </div>

                  {/* Pricing & Stock */}
                  <div className="pt-4 border-t border-outline-variant flex flex-wrap gap-2 items-baseline justify-between">
                    <div>
                      <div className="text-2xl font-bold tracking-tight text-on-surface">
                        {tier.price.toLocaleString("vi-VN")} ₫
                      </div>
                      <span
                        className={
                          "text-xs font-medium block mt-1 " +
                          (tier.available > 0 ? "text-on-surface-variant" : "text-red-700")
                        }
                      >
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
                        <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-2 rounded-lg border border-outline-variant">
                          <span className="text-xs font-bold text-on-surface pl-2">
                            Số lượng trong giỏ:
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden bg-white">
                              <button
                                type="button"
                                onClick={() => updateQuantity(cartItemId, inCartQty - 1)}
                                className="size-10 text-sm font-semibold text-on-surface hover:bg-surface transition-colors cursor-pointer"
                                title="Giảm số lượng"
                              >
                                -
                              </button>
                              <span className="px-2 py-1 text-sm font-semibold text-on-surface min-w-7 text-center">
                                {inCartQty}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(cartItemId, inCartQty + 1)}
                                className="size-10 text-sm font-semibold text-on-surface hover:bg-surface transition-colors cursor-pointer disabled:opacity-40"
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
                              className="flex size-10 items-center justify-center text-on-surface-variant hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
                          className="w-full min-h-11 px-3 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="size-4" />
                          <span>Thêm vào giỏ hàng</span>
                        </button>
                      )
                    ) : /* SEATED Ticket */
                    inCartQty > 0 ? (
                      <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-3 rounded-lg border border-outline-variant">
                        <div>
                          <span className="text-xs font-semibold text-on-surface block">
                            Đã chọn {cartItem?.selectedSeats?.length || 0} ghế
                          </span>
                          <span className="text-xs text-on-surface-variant font-mono break-words">
                            {cartItem?.selectedSeats?.map((s) => getSeatLabel(s)).join(", ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openSeatModal(tier)}
                            className="min-h-10 px-3 py-2 text-xs font-semibold text-primary bg-primary-container hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                          >
                            Đổi ghế
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(cartItemId)}
                            className="flex size-10 items-center justify-center text-on-surface-variant hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
                        className="w-full min-h-11 px-3 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Armchair className="size-4" />
                        <span>Chọn vị trí ghế</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
