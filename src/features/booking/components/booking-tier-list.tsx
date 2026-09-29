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
    </>
  )
}
