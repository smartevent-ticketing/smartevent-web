"use client"

import Link from "next/link"
import { AlertCircle, ArrowRight, Check, Clock3, Minus, Plus, Share2, Ticket } from "lucide-react"
import type { useEventDetail } from "@/features/catalog/hooks/use-event-detail"

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
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_12px_40px_-20px_rgba(24,34,48,0.18)]">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-container text-primary">
            <Ticket className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              {isSaleActive ? "Vé tham gia" : "Tình trạng sự kiện"}
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-foreground">
              {isSaleActive ? "Chọn vé của bạn" : isEnded ? "Đã kết thúc" : "Chưa mở bán"}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={handleShare}
          aria-label="Chia sẻ sự kiện"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary/30 hover:bg-primary-container hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Share2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        {shared && (
          <p
            role="status"
            className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700"
          >
            Đã sao chép liên kết sự kiện.
          </p>
        )}

        {!isSaleActive ? (
          <div className="rounded-xl border border-border bg-surface px-4 py-7 text-center">
            <AlertCircle className="mx-auto size-7 text-slate-400" aria-hidden="true" />
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              {isEnded ? "Sự kiện đã kết thúc" : "Hiện chưa có vé đang mở bán"}
            </h3>
            <p className="mt-2 text-xs leading-6 text-muted">
              {isEnded
                ? "Sự kiện này đã diễn ra. Vé mới không còn được phát hành."
                : "Sự kiện hiện chưa có đợt bán vé nào đang hoạt động. Vui lòng quay lại sau khi ban tổ chức mở bán."}
            </p>
            <Link
              href="/events"
              className="se-text-link mt-5 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              Khám phá sự kiện khác
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <>
            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-foreground">Hạng vé</legend>
              <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                {availableTiers.map((tier) => {
                  const isSelected = effectiveTierId === tier.id
                  return (
                    <label
                      key={tier.id}
                      className={
                        "relative block cursor-pointer rounded-xl border p-4 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary " +
                        (isSelected
                          ? "border-primary bg-primary-container"
                          : "border-border bg-white hover:border-primary/40 hover:bg-surface")
                      }
                    >
                      <input
                        type="radio"
                        name="event-ticket-tier"
                        value={tier.id}
                        checked={isSelected}
                        onChange={() => setSelectedTierId(tier.id)}
                        className="sr-only"
                      />
                      <span className="flex items-start justify-between gap-3">
                        <span className="flex min-w-0 items-start gap-2.5">
                          <span
                            className={
                              "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border " +
                              (isSelected
                                ? "border-primary bg-primary text-on-primary"
                                : "border-slate-300 bg-white")
                            }
                            aria-hidden="true"
                          >
                            {isSelected && <Check className="size-2.5" strokeWidth={3} />}
                          </span>
                          <span className="break-words text-sm font-semibold leading-6 text-foreground">
                            {tier.name}
                          </span>
                        </span>
                        <span className="shrink-0 pt-0.5 text-sm font-bold text-primary">
                          {tier.price > 0 ? tier.price.toLocaleString("vi-VN") + " ₫" : "Miễn phí"}
                        </span>
                      </span>
                      {tier.description && (
                        <span className="mt-2 block break-words text-xs leading-6 text-muted">
                          {tier.description}
                        </span>
                      )}
                      <span className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        {tier.areaName && (
                          <span className="rounded-md border border-border bg-white/70 px-2 py-1 text-muted">
                            {tier.areaName}
                          </span>
                        )}
                        <span
                          className={
                            "ml-auto font-medium " +
                            (tier.available > 0 ? "text-emerald-700" : "text-muted")
                          }
                        >
                          {tier.available > 0 ? "Còn " + tier.available + " vé" : "Hết vé"}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Số lượng</p>
                <p className="mt-1 text-[11px] text-muted">Tối đa {maxAllowedQty} vé / lần đặt</p>
              </div>
              <div className="flex items-center rounded-xl border border-border bg-white p-1">
                <button
                  type="button"
                  aria-label="Giảm số lượng vé"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  <Minus className="size-4" aria-hidden="true" />
                </button>
                <span
                  aria-live="polite"
                  aria-atomic="true"
                  className="min-w-10 text-center text-sm font-semibold tabular-nums text-foreground"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Tăng số lượng vé"
                  onClick={() => setQuantity(Math.min(maxAllowedQty, quantity + 1))}
                  disabled={quantity >= maxAllowedQty}
                  className="flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  <Plus className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="space-y-4 border-t border-border pt-5">
              <div className="flex items-center justify-between gap-3 text-xs text-muted">
                <span>
                  {currentTier?.name} × {quantity}
                </span>
                <span className="shrink-0 tabular-nums">
                  {totalPrice.toLocaleString("vi-VN")} ₫
                </span>
              </div>
              <div className="flex items-end justify-between gap-3">
                <span className="text-sm font-semibold text-foreground">Tổng tiền</span>
                <span className="text-2xl font-bold tracking-tight tabular-nums text-primary">
                  {totalPrice.toLocaleString("vi-VN")} <span className="text-base">₫</span>
                </span>
              </div>
              <Link
                href={
                  "/reservations/" +
                  targetEventId +
                  "?tier=" +
                  (currentTier?.ticketTypeId || currentTier?.id) +
                  "&phase=" +
                  currentTier?.salePhaseId +
                  "&qty=" +
                  quantity
                }
                className="se-button flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary hover:bg-primary-hover"
              >
                <span>Tiến hành giữ chỗ</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <p className="flex items-start justify-center gap-2 text-[11px] leading-5 text-muted">
                <Clock3 className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                <span>Chỗ được giữ trong 10 phút sau khi xác nhận ở bước tiếp theo.</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
