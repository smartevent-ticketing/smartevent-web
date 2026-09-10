"use client"

import { Loader2 } from "lucide-react"
import type { useEventSetup } from "@/features/organizer/hooks/use-event-setup"

type Props = Pick<
  ReturnType<typeof useEventSetup>,
  | "setCurrentStep"
  | "venues"
  | "eventName"
  | "startDate"
  | "startTime"
  | "selectedVenueId"
  | "ticketTiers"
  | "isSubmitting"
  | "handleComplete"
>
export function EventReviewStep({
  setCurrentStep,
  venues,
  eventName,
  startDate,
  startTime,
  selectedVenueId,
  ticketTiers,
  isSubmitting,
  handleComplete,
}: Props) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-outline-variant/60 shadow-xs space-y-6">
      <h2 className="text-xl font-bold text-on-surface">Bước 4: Rà soát & Gửi duyệt sự kiện</h2>

      <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/60 text-xs sm:text-sm space-y-3">
        <div className="flex justify-between py-1 border-b border-outline-variant/40">
          <span className="text-on-surface-variant font-medium">Tên sự kiện:</span>
          <span className="font-bold text-on-surface">{eventName || "Chưa đặt tên"}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-outline-variant/40">
          <span className="text-on-surface-variant font-medium">Thời gian:</span>
          <span className="text-on-surface">
            {startDate || "Chưa chọn ngày"} lúc {startTime}
          </span>
        </div>
        <div className="flex justify-between py-1 border-b border-outline-variant/40">
          <span className="text-on-surface-variant font-medium">Địa điểm:</span>
          <span className="text-on-surface">
            {venues.find((v) => v.id === selectedVenueId)?.name || "Địa điểm theo đăng ký"}
          </span>
        </div>
        <div className="py-1 space-y-2">
          <span className="text-on-surface-variant font-medium block">Hạng vé phát hành:</span>
          <div className="space-y-1.5 pl-2">
            {ticketTiers.map((t, i) => (
              <div key={i} className="flex justify-between font-semibold text-xs text-on-surface">
                <span>
                  • {t.name} ({t.areaType === "STANDING" ? "Khu đứng" : "Khu ghế"})
                </span>
                <span className="text-primary">{t.price.toLocaleString("vi-VN")} ₫</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
        <span className="font-bold block">Quy trình duyệt:</span>
        <p>
          Sau khi bấm gửi, sự kiện sẽ chuyển sang trạng thái{" "}
          <strong>CHỜ DUYỆT (PENDING_APPROVAL)</strong>. Bạn sẽ nhận được thông báo khi ban quản trị
          SmartEvent phê duyệt và công bố sự kiện lên cổng bán vé.
        </p>
      </div>

      <div className="pt-4 flex justify-between items-center">
        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className="px-5 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold hover:bg-surface-container cursor-pointer"
        >
          Quay lại
        </button>
        <button
          type="button"
          onClick={handleComplete}
          disabled={isSubmitting}
          className="px-7 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Đang gửi sự kiện lên hệ thống...</span>
            </>
          ) : (
            <span>Gửi duyệt sự kiện</span>
          )}
        </button>
      </div>
    </div>
  )
}
