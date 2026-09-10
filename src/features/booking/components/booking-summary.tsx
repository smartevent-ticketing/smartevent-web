"use client"

import { ArrowRight, Calendar, Loader2, MapPin, ShieldCheck } from "lucide-react"
import { useSeatSelection } from "@/features/booking/hooks/use-seat-selection"

type Props = Pick<
  ReturnType<typeof useSeatSelection>,
  | "event"
  | "areas"
  | "isSubmitting"
  | "setSelectedTicketTypeId"
  | "selectedSeats"
  | "quantity"
  | "setQuantity"
  | "selectedArea"
  | "isSeated"
  | "areaTicketTypes"
  | "effectiveTicketTypeId"
  | "unitPrice"
  | "effectiveQty"
  | "totalPrice"
  | "maxAllowed"
  | "handleConfirmReservation"
  | "locationName"
>

export function BookingSummary({
  event,
  areas,
  isSubmitting,
  setSelectedTicketTypeId,
  selectedSeats,
  quantity,
  setQuantity,
  selectedArea,
  isSeated,
  areaTicketTypes,
  effectiveTicketTypeId,
  unitPrice,
  effectiveQty,
  totalPrice,
  maxAllowed,
  handleConfirmReservation,
  locationName,
}: Props) {
  if (!event) return null
  return (
    <>
      <div className="w-full lg:w-[420px] flex flex-col gap-6">
        <div className="bg-white rounded-3xl p-6 border border-outline-variant/60 shadow-lg space-y-6">
          {/* Event Header Summary */}
          <div className="space-y-2 border-b border-outline-variant/60 pb-5">
            <h2 className="text-lg font-bold text-on-surface">Thông tin sự kiện</h2>
            <div className="space-y-1.5 text-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5 text-primary" />
                <span>
                  {event.startTime
                    ? new Date(event.startTime).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "Thời gian chưa cập nhật"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-primary" />
                <span>{locationName}</span>
              </div>
            </div>
          </div>

          {/* Selected Zone & Price */}
          <div className="bg-surface-container-low rounded-2xl p-4 border border-primary/40 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-on-surface-variant font-medium block">
                  Khu vực đã chọn
                </span>
                <h3 className="text-base font-bold text-on-surface">
                  {selectedArea?.name || "Chưa chọn phân khu"}
                </h3>
                <span className="text-xs text-primary font-semibold">
                  {isSeated ? "Khu có ghế (Seated)" : "Khu đứng (Standing)"}
                </span>
              </div>
              <span className="text-base font-bold text-primary">
                {unitPrice.toLocaleString("vi-VN")} ₫
              </span>
            </div>

            {/* Lựa chọn loại vé trong khu vực nếu có nhiều hơn 1 loại vé */}
            {areaTicketTypes.length > 1 && (
              <div className="pt-2 border-t border-outline-variant/40 space-y-1.5">
                <span className="text-xs font-semibold text-on-surface block">
                  Hạng vé trong khu vực:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {areaTicketTypes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTicketTypeId(t.id || "")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        effectiveTicketTypeId === t.id
                          ? "border-primary bg-primary text-white"
                          : "border-outline-variant/60 bg-white text-on-surface hover:border-primary/40"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isSeated && selectedSeats.length > 0 && (
              <div className="pt-2 border-t border-outline-variant/50 text-xs">
                <span className="text-on-surface-variant">Ghế đã chọn: </span>
                <span className="font-bold text-primary">
                  {selectedSeats
                    .map((s) => s.label || `${s.rowName || ""}${s.seatNumber || ""}`)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>

          {/* Quantity Selector for Standing Zone */}
          {!isSeated && (
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-sm font-bold text-on-surface block">Số lượng vé</span>
                <span className="text-xs text-on-surface-variant">
                  Tối đa {maxAllowed} vé / giao dịch
                </span>
              </div>
              <div className="flex items-center border border-outline-variant rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 text-base font-bold text-on-surface hover:bg-surface-container transition cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-sm font-bold text-on-surface min-w-10 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maxAllowed, quantity + 1))}
                  className="px-3.5 py-1.5 text-base font-bold text-on-surface hover:bg-surface-container transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="pt-4 border-t border-outline-variant/60 space-y-2.5 text-xs text-on-surface-variant">
            <div className="flex items-center justify-between">
              <span>Đơn giá ({effectiveQty} vé)</span>
              <span>{totalPrice.toLocaleString("vi-VN")} ₫</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Phí dịch vụ tiện ích</span>
              <span className="text-green-600 font-semibold">Miễn phí</span>
            </div>
            <div className="flex items-center justify-between text-base font-extrabold text-on-surface pt-2 border-t border-outline-variant/40">
              <span>Tổng thanh toán</span>
              <span className="text-primary text-xl font-extrabold">
                {totalPrice.toLocaleString("vi-VN")} ₫
              </span>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="button"
            onClick={handleConfirmReservation}
            disabled={
              isSubmitting || areas.length === 0 || (isSeated && selectedSeats.length === 0)
            }
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
            <ShieldCheck className="size-4 text-green-600" />
            <span>Ghế và vé được giữ an toàn trong 10 phút sau khi xác nhận</span>
          </div>
        </div>
      </div>
    </>
  )
}
