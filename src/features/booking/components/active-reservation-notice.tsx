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
          <div className="bg-amber-50 border border-amber-200 p-4 sm:p-5 rounded-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Bạn đang có một phiên giữ chỗ cho sự kiện này
                </h4>
                <p className="text-xs leading-5 text-amber-800 mt-1">
                  Tổng tiền: {activeReservation.totalAmount?.toLocaleString("vi-VN")} ₫ • Hết hạn
                  lúc: {new Date(activeReservation.expiresAt || "").toLocaleTimeString("vi-VN")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0">
              <button
                type="button"
                onClick={handleCancelActiveReservation}
                disabled={isSubmitting}
                className="min-h-11 px-4 py-2 border border-amber-300 text-amber-900 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy để chọn lại
              </button>
              <Link
                href={`/checkout?reservationId=${activeReservation.id}`}
                className="inline-flex min-h-11 items-center px-4 py-2 bg-primary text-white hover:bg-primary-hover rounded-lg text-xs font-semibold transition-colors"
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
