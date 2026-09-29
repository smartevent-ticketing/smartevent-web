"use client"

import { Sparkles, AlertTriangle, Loader2 } from "lucide-react"
import type { AreasSeatsController } from "../../hooks/use-areas-seats"

interface Props {
  controller: AreasSeatsController
  canEdit: boolean
}

export function SeatManagementDialogs({ controller, canEdit }: Props) {
  const {
    showSingleSeatModal,
    setShowSingleSeatModal,
    singleSeatRow,
    setSingleSeatRow,
    singleSeatNumber,
    setSingleSeatNumber,
    singleSeatLabel,
    setSingleSeatLabel,
    isSavingSingleSeat,
    showGenerateModal,
    setShowGenerateModal,
    fromRow,
    setFromRow,
    toRow,
    setToRow,
    seatsPerRowInput,
    setSeatsPerRowInput,
    isGenerating,
    seatMessage,
    selectedArea,
    handleAutoFillByCapacity,
    calculatedRowCount,
    calculatedTotalSeats,
    isExceedingCapacity,
    handleGenerateSeats,
    handleCreateSingleSeat,
  } = controller
  return (
    <>
      {/* Generate Seats Modal */}
      {showSingleSeatModal && canEdit && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-on-surface">Thêm một ghế vào phân khu</h3>
            {seatMessage?.type === "error" && (
              <p role="alert" className="text-xs text-red-600">
                {seatMessage.text}
              </p>
            )}
            <form onSubmit={handleCreateSingleSeat} className="space-y-4">
              <label className="block text-xs font-semibold">
                Hàng ghế
                <input
                  required
                  maxLength={50}
                  value={singleSeatRow}
                  onChange={(event) => setSingleSeatRow(event.target.value)}
                  placeholder="Ví dụ: A"
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-outline-variant"
                />
              </label>
              <label className="block text-xs font-semibold">
                Số ghế
                <input
                  required
                  maxLength={50}
                  value={singleSeatNumber}
                  onChange={(event) => setSingleSeatNumber(event.target.value)}
                  placeholder="Ví dụ: 01"
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-outline-variant"
                />
              </label>
              <label className="block text-xs font-semibold">
                Nhãn hiển thị (tùy chọn)
                <input
                  maxLength={100}
                  value={singleSeatLabel}
                  onChange={(event) => setSingleSeatLabel(event.target.value)}
                  placeholder="Ví dụ: A-01"
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-outline-variant"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSingleSeatModal(false)}
                  disabled={isSavingSingleSeat}
                  className="px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingSingleSeat}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {isSavingSingleSeat ? "Đang thêm..." : "Thêm ghế"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGenerateModal && canEdit && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-on-surface">Sinh sơ đồ ghế ngồi tự động</h3>
            <p className="text-xs text-on-surface-variant">
              Tạo hàng loạt mã ghế cho phân khu <strong>{selectedArea?.name}</strong> (Sức chứa:{" "}
              <strong>{selectedArea?.capacity} vé</strong>).
            </p>

            {/* Quick autofill button */}
            <button
              type="button"
              onClick={handleAutoFillByCapacity}
              className="w-full py-2.5 px-4 bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-primary/20"
            >
              <Sparkles className="size-3.5" />
              <span>⚡ Tự động tính theo sức chứa ({selectedArea?.capacity} ghế)</span>
            </button>

            <form onSubmit={handleGenerateSeats} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">
                    Hàng bắt đầu
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={fromRow}
                    onChange={(e) => setFromRow(e.target.value.toUpperCase())}
                    placeholder="A"
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs font-mono font-bold uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">
                    Hàng kết thúc
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={toRow}
                    onChange={(e) => setToRow(e.target.value.toUpperCase())}
                    placeholder="E"
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Số ghế mỗi hàng
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={seatsPerRowInput}
                  onChange={(e) => setSeatsPerRowInput(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs font-mono font-bold"
                />
              </div>

              {/* Calculated Summary Badge */}
              <div
                className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
                  isExceedingCapacity
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                <span>
                  Dự kiến tạo: <strong>{calculatedTotalSeats} ghế</strong> ({calculatedRowCount}{" "}
                  hàng × {seatsPerRowInput} ghế)
                </span>
                <span className="font-semibold text-on-surface-variant">
                  Sức chứa: {selectedArea?.capacity} vé
                </span>
              </div>

              {isExceedingCapacity && (
                <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  <span>
                    Vượt quá sức chứa phân khu ({selectedArea?.capacity} vé). Vui lòng giảm số hàng
                    hoặc số ghế mỗi hàng!
                  </span>
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || isExceedingCapacity || calculatedTotalSeats === 0}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
                >
                  {isGenerating && <Loader2 className="size-3.5 animate-spin" />}
                  <span>{isGenerating ? "Đang sinh ghế..." : "Tạo sơ đồ ghế"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
