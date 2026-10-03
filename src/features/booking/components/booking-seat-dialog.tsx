"use client"

import { useEffect, useRef } from "react"
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
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const dialog = dialogRef.current
    if (seatModalTier && dialog && !dialog.open) {
      triggerRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      dialog.showModal()
    }
    return () => {
      dialog?.close()
      if (triggerRef.current?.isConnected) triggerRef.current.focus()
    }
  }, [seatModalTier])
  return (
    <>
      {/* Seat Selection Modal (Cho các hạng vé SEATED) */}
      {seatModalTier && (
        <dialog
          ref={dialogRef}
          aria-labelledby="seat-dialog-heading"
          onCancel={(event) => {
            event.preventDefault()
            closeSeatModal()
          }}
          className="m-auto w-[calc(100%_-_1.5rem)] max-w-2xl max-h-[90dvh] overflow-y-auto rounded-2xl border border-outline-variant bg-white p-0 text-on-surface shadow-2xl backdrop:bg-on-surface/45 backdrop:backdrop-blur-xs"
        >
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
              <div>
                <h3
                  id="seat-dialog-heading"
                  className="text-lg font-bold text-on-surface flex items-center gap-2"
                >
                  <Armchair className="size-5 shrink-0 text-primary" />
                  <span>Chọn ghế · {seatModalTier.name}</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Khu vực: <strong>{seatModalTier.areaName}</strong> — Tối đa {modalMaxAllowed} ghế
                </p>
              </div>
              <button
                type="button"
                aria-label="Đóng chọn ghế"
                onClick={closeSeatModal}
                className="flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-surface text-on-surface-variant transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  aria-label="Đóng thông báo lỗi"
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
            <div className="pt-5 border-t border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs font-semibold text-on-surface">
                Đã chọn:{" "}
                <span className="text-primary font-bold text-sm">
                  {seatModalSelectedSeats.length}
                </span>{" "}
                / {modalMaxAllowed} ghế
                {seatModalSelectedSeats.length > 0 && (
                  <span className="text-on-surface-variant ml-2 font-mono break-words">
                    ({seatModalSelectedSeats.map((s) => getSeatLabel(s)).join(", ")})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeSeatModal}
                  className="min-h-11 px-4 py-2 text-sm font-semibold rounded-lg border border-outline-variant hover:bg-surface transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmSeatSelection}
                  disabled={seatModalSelectedSeats.length === 0}
                  className="min-h-11 flex-1 sm:flex-none px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Xác nhận chọn ghế
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}
    </>
  )
}
