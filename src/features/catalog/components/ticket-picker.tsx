"use client"

import Link from "next/link"
import { AlertCircle, Share2, ShieldCheck, Ticket } from "lucide-react"
import { useEventDetail } from "@/features/catalog/hooks/use-event-detail"

type Props = Pick<
  ReturnType<typeof useEventDetail>,
  | "setSelectedTierId"
  | "quantity"
  | "setQuantity"
  | "shared"
  | "availableTiers"
  | "isSaleActive"
  | "effectiveTierId"
  | "currentTier"
  | "totalPrice"
  | "maxAllowedQty"
  | "handleShare"
  | "targetEventId"
>

export function TicketPicker({
  setSelectedTierId,
  quantity,
  setQuantity,
  shared,
  availableTiers,
  isSaleActive,
  effectiveTierId,
  currentTier,
  totalPrice,
  maxAllowedQty,
  handleShare,
  targetEventId,
}: Props) {
  return (
    <>
      <div className="lg:col-span-4 sticky top-24 space-y-4">
        <div className="bg-white rounded-3xl p-6 border border-outline-variant/70 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/60 pb-4">
            <div>
              <span className="text-xs text-on-surface-variant">
                {isSaleActive ? "Chọn hạng vé" : "Tình trạng"}
              </span>
              <h3 className="text-lg font-bold text-on-surface">
                {isSaleActive ? "Đặt vé ngay" : "Chưa mở bán"}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {shared && <span className="text-xs text-green-600 font-medium">Đã sao chép!</span>}
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition cursor-pointer"
                aria-label="Chia sẻ sự kiện"
              >
                <Share2 className="size-5" />
              </button>
            </div>
          </div>

          {/* Condition: Not Active */}
          {!isSaleActive ? (
            <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant text-center space-y-3">
              <AlertCircle className="size-8 text-on-surface-variant mx-auto" />
              <h4 className="text-sm font-bold text-on-surface">
                Chưa mở bán hoặc đợt bán đã kết thúc
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Sự kiện hiện chưa có đợt bán vé nào ở trạng thái hoạt động (ACTIVE). Vui lòng quay
                lại sau khi Ban tổ chức mở đợt bán tiếp theo.
              </p>
              <Link
                href="/events"
                className="inline-block mt-2 text-xs font-semibold text-primary hover:underline"
              >
                Xem các sự kiện khác
              </Link>
            </div>
          ) : (
            <>
              {/* Ticket Tiers Selection */}
              <div className="space-y-3">
                {availableTiers.map((tier) => {
                  const isSelected = effectiveTierId === tier.id
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTierId(tier.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-outline-variant/60 hover:border-primary/40 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-on-surface">{tier.name}</h4>
                        <span className="text-sm font-bold text-primary">
                          {tier.price.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant">{tier.description}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-green-600 font-medium">
                          {tier.available > 0 ? `Còn ${tier.available} vé` : "Hết vé"}
                        </span>
                        {tier.areaName && (
                          <span className="text-on-surface-variant font-medium">
                            {tier.areaName}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-on-surface">Số lượng</span>
                <div className="flex items-center border border-outline-variant rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-1.5 text-base font-bold text-on-surface hover:bg-surface-container transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-sm font-bold text-on-surface min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(maxAllowedQty, quantity + 1))}
                    className="px-3.5 py-1.5 text-base font-bold text-on-surface hover:bg-surface-container transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price Summary & Checkout Button */}
              <div className="pt-4 border-t border-outline-variant/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Tổng tiền</span>
                  <span className="text-2xl font-extrabold text-primary">
                    {totalPrice.toLocaleString("vi-VN")} ₫
                  </span>
                </div>

                <Link
                  href={`/reservations/${targetEventId}?tier=${currentTier?.ticketTypeId || currentTier?.id}&phase=${currentTier?.salePhaseId}&qty=${quantity}`}
                  className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Ticket className="size-4" />
                  <span>Tiến hành giữ chỗ</span>
                </Link>

                <div className="flex items-center justify-center gap-1.5 text-xs text-on-surface-variant text-center">
                  <ShieldCheck className="size-4 text-green-600" />
                  <span>Vé được giữ chỗ trong 10 phút sau khi nhấn</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
