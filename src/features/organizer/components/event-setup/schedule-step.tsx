"use client"

import { ArrowRight } from "lucide-react"
import type { useEventSetup } from "@/features/organizer/hooks/use-event-setup"

type Props = Pick<
  ReturnType<typeof useEventSetup>,
  | "setCurrentStep"
  | "venues"
  | "startDate"
  | "setStartDate"
  | "startTime"
  | "setStartTime"
  | "selectedVenueId"
  | "setSelectedVenueId"
>
export function EventScheduleStep({
  setCurrentStep,
  venues,
  startDate,
  setStartDate,
  startTime,
  setStartTime,
  selectedVenueId,
  setSelectedVenueId,
}: Props) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-outline-variant/60 shadow-xs space-y-5">
      <h2 className="text-xl font-bold text-on-surface">Bước 2: Thời gian & Địa điểm tổ chức</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Ngày tổ chức <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Giờ bắt đầu</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface mb-1">
            Địa điểm tổ chức (Venue) <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedVenueId}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm text-on-surface focus:outline-none cursor-pointer"
          >
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.city || "Việt Nam"})
              </option>
            ))}
            {venues.length === 0 && <option value="">Chưa tải được địa điểm</option>}
          </select>
        </div>
      </div>

      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="px-5 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold hover:bg-surface-container cursor-pointer"
        >
          Quay lại
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
        >
          <span>Tiếp tục</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
