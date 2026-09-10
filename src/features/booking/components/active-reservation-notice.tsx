"use client"

import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { useSeatSelection } from "@/features/booking/hooks/use-seat-selection"

type Props = Pick<
  ReturnType<typeof useSeatSelection>,
  "activeReservation" | "isSubmitting" | "handleCancelActiveReservation"
>

export function ActiveReservationNotice({
  activeReservation,
  isSubmitting,
  handleCancelActiveReservation,
}: Props) {
  return (
    <>
      {activeReservation && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Bạn đang có một phiên giữ chỗ cho sự kiện này
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Tổng tiền: {activeReservation.totalAmount?.toLocaleString("vi-VN")} ₫ • Hết hạn
                  lúc: {new Date(activeReservation.expiresAt || "").toLocaleTimeString("vi-VN")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCancelActiveReservation}
                disabled={isSubmitting}
                className="px-3 py-1.5 border border-amber-400 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Hủy để chọn lại
              </button>
              <Link
                href={`/checkout?reservationId=${activeReservation.id}`}
                className="px-4 py-1.5 bg-primary text-white hover:bg-primary-hover rounded-xl text-xs font-bold transition shadow-xs"
              >
                Tiếp tục thanh toán
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
