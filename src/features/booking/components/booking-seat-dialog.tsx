"use client"

import { AlertCircle, Armchair, X } from "lucide-react"
import { SeatMap } from "./seat-map"
import type { useBookingCart } from "../hooks/use-booking-cart"
import { getSeatLabel } from "../model/booking-cart"

interface Props {
  booking: ReturnType<typeof useBookingCart>
}

export function BookingSeatDialog({ booking }: Props) {
  const {
    seatModalTier,
    seatModalSelectedSeats,
    modalMaxAllowed,
    seatsInOtherTiers,
    closeSeatModal,
    handleToggleSeatModal,
    confirmSeatSelection,
    modalAvailableSeats,
    isLoadingModalSeats,
    errorMessage,
    setErrorMessage,
  } = booking
  return (
    <>
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
                  Khu vực: <strong>{seatModalTier.areaName}</strong> — Tối đa {modalMaxAllowed} ghế
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

            {/* Modal Error Banner */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            {/* Seat Map */}
            <SeatMap
              availableSeats={modalAvailableSeats}
              isLoadingSeats={isLoadingModalSeats}
              selectedSeats={seatModalSelectedSeats}
              selectedArea={{ name: seatModalTier.areaName }}
              isSeated={true}
              maxAllowed={modalMaxAllowed}
              unavailableSeatIds={seatsInOtherTiers}
              handleToggleSeat={handleToggleSeatModal}
            />

            {/* Modal Footer */}
            <div className="pt-3 border-t border-outline-variant/60 flex items-center justify-between">
              <div className="text-xs font-semibold text-on-surface">
                Đã chọn:{" "}
                <span className="text-primary font-bold text-sm">
                  {seatModalSelectedSeats.length}
                </span>{" "}
                / {modalMaxAllowed} ghế
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
    </>
  )
}
