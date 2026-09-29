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
  | "isEnded"
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
  isEnded,
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
        <div className="space-y-6 rounded-3xl border border-white/15 bg-[#242331] p-6 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div>
              <span className="text-xs text-[#aaa6b7]">
                {isSaleActive ? "Chọn hạng vé" : "Tình trạng"}
              </span>
              <h3 className="text-lg font-bold text-white">
                {isSaleActive ? "Đặt vé ngay" : isEnded ? "Đã kết thúc" : "Chưa mở bán"}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {shared && <span className="text-xs font-medium text-[#aee8c3]">Đã sao chép!</span>}
              <button
                type="button"
                onClick={handleShare}
                className="cursor-pointer rounded-full p-2 text-[#bcb7c4] transition hover:bg-white/10 hover:text-white"
                aria-label="Chia sẻ sự kiện"
              >
                <Share2 className="size-5" />
              </button>
            </div>
          </div>

          {/* Condition: Not Active */}
          {!isSaleActive ? (
            <div className="space-y-3 rounded-2xl border border-white/15 bg-white/5 p-6 text-center">
              <AlertCircle className="mx-auto size-8 text-[#bcb7c4]" />
              <h4 className="text-sm font-bold text-white">
                {isEnded ? "Sự kiện đã kết thúc" : "Chưa mở bán hoặc đợt bán đã kết thúc"}
              </h4>
              <p className="text-xs leading-relaxed text-[#bcb7c4]">
                {isEnded
                  ? "Sự kiện này đã diễn ra. Vé mới không còn được phát hành."
                  : "Sự kiện hiện chưa có đợt bán vé nào đang hoạt động. Vui lòng quay lại sau khi ban tổ chức mở bán."}
              </p>
              <Link
                href="/events"
                className="mt-2 inline-block text-xs font-semibold text-[#ffad95] hover:underline"
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
                          ? "border-[#ff9479] bg-[#ff9479]/10 shadow-xs"
                          : "border-white/15 bg-white/5 hover:border-[#ff9479]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-white">{tier.name}</h4>
                        <span className="text-sm font-bold text-[#ffad95]">
                          {tier.price.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                      <p className="text-xs text-[#bcb7c4]">{tier.description}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="font-medium text-[#aee8c3]">
                          {tier.available > 0 ? `Còn ${tier.available} vé` : "Hết vé"}
                        </span>
                        {tier.areaName && (
                          <span className="font-medium text-[#bcb7c4]">{tier.areaName}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-white">Số lượng</span>
                <div className="flex items-center overflow-hidden rounded-xl border border-white/15">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="cursor-pointer px-3.5 py-1.5 text-base font-bold text-white transition hover:bg-white/10"
                  >
                    -
                  </button>
                  <span className="min-w-8 px-3 py-1.5 text-center text-sm font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(maxAllowedQty, quantity + 1))}
                    className="cursor-pointer px-3.5 py-1.5 text-base font-bold text-white transition hover:bg-white/10"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price Summary & Checkout Button */}
              <div className="space-y-3 border-t border-white/15 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#bcb7c4]">Tổng tiền</span>
                  <span className="text-2xl font-extrabold text-[#ffad95]">
                    {totalPrice.toLocaleString("vi-VN")} ₫
                  </span>
                </div>

                <Link
                  href={`/reservations/${targetEventId}?tier=${currentTier?.ticketTypeId || currentTier?.id}&phase=${currentTier?.salePhaseId}&qty=${quantity}`}
                  className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#ff8063] text-sm font-bold text-[#261621] transition hover:bg-[#ff9b83]"
                >
                  <Ticket className="size-4" />
                  <span>Tiến hành giữ chỗ</span>
                </Link>

                <div className="flex items-center justify-center gap-1.5 text-center text-xs text-[#bcb7c4]">
                  <ShieldCheck className="size-4 text-[#aee8c3]" />
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
