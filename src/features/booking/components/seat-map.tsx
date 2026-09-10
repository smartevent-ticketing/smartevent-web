"use client"

import { Loader2 } from "lucide-react"
import { useSeatSelection } from "@/features/booking/hooks/use-seat-selection"

type Props = Pick<
  ReturnType<typeof useSeatSelection>,
  | "availableSeats"
  | "isLoadingSeats"
  | "selectedSeats"
  | "selectedArea"
  | "isSeated"
  | "maxAllowed"
  | "handleToggleSeat"
>

export function SeatMap({
  availableSeats,
  isLoadingSeats,
  selectedSeats,
  selectedArea,
  isSeated,
  maxAllowed,
  handleToggleSeat,
}: Props) {
  return (
    <>
      {isSeated ? (
        <div className="space-y-4 pt-4 border-t border-outline-variant/60">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-on-surface">
                Sơ đồ ghế ngồi: {selectedArea?.name}
              </h4>
              <p className="text-xs text-on-surface-variant">
                Nhấp vào ghế trống để chọn (Tối đa {maxAllowed} ghế)
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="size-3.5 rounded border border-primary/40 bg-primary/10" />
                <span>Ghế trống</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-3.5 rounded bg-primary" />
                <span>Đang chọn</span>
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
              Khu vực này hiện chưa có ghế trống khả dụng hoặc đã hết vé.
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
                  const isSelected = selectedSeats.some((s) => s.id === seat.id)
                  const seatText = seat.label || `${seat.rowName || ""}${seat.seatNumber || ""}`

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      onClick={() => handleToggleSeat(seat)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white border-primary/30 text-primary hover:bg-primary/10"
                      }`}
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
