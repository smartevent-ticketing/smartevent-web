"use client"

import { Loader2 } from "lucide-react"
import type { components } from "@/lib/api/schema"
import { isSeatSelectable } from "../model/available-seat-selection"

type EventSeat = components["schemas"]["EventSeatResponse"]

interface Props {
  availableSeats: EventSeat[]
  isLoadingSeats?: boolean
  selectedSeats: EventSeat[]
  selectedArea?: { name?: string } | null
  isSeated?: boolean
  maxAllowed?: number
  unavailableSeatIds?: ReadonlySet<string>
  handleToggleSeat: (seat: EventSeat) => void
}

export function SeatMap({
  availableSeats,
  isLoadingSeats,
  selectedSeats,
  selectedArea,
  isSeated,
  maxAllowed,
  unavailableSeatIds,
  handleToggleSeat,
}: Props) {
  return (
    <>
      {isSeated ? (
        <div className="space-y-4 pt-4 border-t border-outline-variant/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-on-surface">
                Sơ đồ ghế ngồi: {selectedArea?.name}
              </h4>
              <p className="text-xs text-on-surface-variant">
                Nhấp vào ghế trống để chọn (Tối đa {maxAllowed} ghế)
              </p>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 text-xs flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="size-3.5 rounded border-2 border-primary/50 bg-white" />
                <span>Còn trống</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-3.5 rounded bg-primary border-2 border-primary" />
                <span>Đang chọn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-3.5 rounded bg-amber-500 border-2 border-amber-600" />
                <span>Đang giữ chỗ (10p)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-3.5 rounded bg-yellow-400 border-2 border-yellow-500" />
                <span>Đã bán</span>
              </div>
            </div>
          </div>

          {isLoadingSeats ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs">Đang tải danh sách ghế từ máy chủ...</span>
            </div>
          ) : availableSeats.length === 0 ? (
            <div className="py-12 text-center bg-surface-container-low rounded-2xl border border-outline-variant text-xs text-on-surface-variant">
              Khu vực này hiện chưa có cấu hình sơ đồ ghế ngồi hoặc đã hết vé.
            </div>
          ) : (
            <div className="max-h-[380px] overflow-y-auto p-4 bg-surface-container-low rounded-2xl border border-outline-variant/60">
              {/* Sân khấu chính */}
              <div className="w-full bg-[#273143] text-white text-xs font-bold text-center py-2 rounded-xl mb-6 shadow-xs">
                ★ HƯỚNG SÂN KHẤU CHÍNH ★
              </div>

              {/* Lưới ghế thật */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                {availableSeats.map((seat) => {
                  const isSelected =
                    isSeatSelectable(seat) && selectedSeats.some((s) => s.id === seat.id)
                  const isHeld = !isSelected && seat.status === "HELD"
                  const isSold = !isSelected && seat.status === "SOLD"
                  const isBlocked = !isSelected && seat.status === "BLOCKED"
                  const isInOtherTier = Boolean(seat.id && unavailableSeatIds?.has(seat.id))
                  const isDisabled =
                    isHeld || isSold || isBlocked || isInOtherTier || !isSeatSelectable(seat)
                  const seatText = seat.label || `${seat.rowName || ""}${seat.seatNumber || ""}`

                  let statusClasses =
                    "bg-white border-2 border-primary/50 text-primary hover:bg-primary/10 hover:border-primary cursor-pointer"
                  let tooltip = `Ghế ${seatText}: Còn trống - Bấm để chọn`

                  if (isSelected) {
                    statusClasses =
                      "bg-primary text-white border-2 border-primary shadow-sm cursor-pointer"
                    tooltip = `Ghế ${seatText}: Đang chọn - Bấm để hủy chọn`
                  } else if (isHeld) {
                    statusClasses =
                      "bg-amber-500 text-white border-2 border-amber-600 cursor-not-allowed opacity-90"
                    tooltip = `Ghế ${seatText}: Đang được giữ chỗ (10 phút)`
                  } else if (isSold) {
                    statusClasses =
                      "bg-yellow-400 text-yellow-950 border-2 border-yellow-500 cursor-not-allowed font-extrabold"
                    tooltip = `Ghế ${seatText}: Đã bán`
                  } else if (isBlocked) {
                    statusClasses =
                      "bg-slate-200 text-slate-500 border-2 border-slate-300 cursor-not-allowed"
                    tooltip = `Ghế ${seatText}: Tạm khóa`
                  } else if (isInOtherTier) {
                    statusClasses =
                      "bg-slate-200 text-slate-500 border-2 border-slate-300 cursor-not-allowed"
                    tooltip = `Ghế ${seatText}: Đã chọn ở hạng vé khác`
                  }

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={isDisabled}
                      title={tooltip}
                      aria-label={tooltip}
                      onClick={() => !isDisabled && handleToggleSeat(seat)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center ${statusClasses}`}
                    >
                      <span>{seatText}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Khu đứng (STANDING) */
        <div className="pt-4 border-t border-outline-variant/60 space-y-3">
          <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant text-center space-y-2">
            <div className="w-full bg-[#273143] text-white text-xs font-bold text-center py-2 rounded-xl mb-4 shadow-xs">
              ★ HƯỚNG SÂN KHẤU CHÍNH ★
            </div>
            <h4 className="text-sm font-bold text-on-surface">
              Khu vực đứng tự do (Standing Zone)
            </h4>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              Khán giả tự do chọn vị trí đứng trong phân khu này khi vào cửa. Vui lòng chọn số lượng
              vé ở cột bên phải.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
