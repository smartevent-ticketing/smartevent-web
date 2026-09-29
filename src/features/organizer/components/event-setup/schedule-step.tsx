"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight, Loader2, Plus } from "lucide-react"
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
  | "createVenue"
  | "isCreatingVenue"
  | "venueError"
  | "handleProceedToMedia"
  | "isCreatingDraft"
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
  createVenue,
  isCreatingVenue,
  venueError,
  handleProceedToMedia,
  isCreatingDraft,
}: Props) {
  const [showNewVenue, setShowNewVenue] = useState(false)
  const [venueName, setVenueName] = useState("")
  const [venueAddress, setVenueAddress] = useState("")
  const [venueCity, setVenueCity] = useState("")
  const [venueCapacity, setVenueCapacity] = useState("")

  async function handleCreateVenue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const capacity = Number(venueCapacity)
    if (
      !venueName.trim() ||
      !venueAddress.trim() ||
      !venueCity.trim() ||
      !Number.isInteger(capacity) ||
      capacity <= 0
    )
      return
    try {
      await createVenue({
        name: venueName.trim(),
        address: venueAddress.trim(),
        city: venueCity.trim(),
        capacity,
      })
      setShowNewVenue(false)
    } catch {
      // The hook displays the API error beside this form.
    }
  }

  return (
    <div className="workspace-card space-y-5 p-5 sm:p-8">
      <h2 className="text-xl font-extrabold text-[#251f29]">
        Bước 2: Thời gian & Địa điểm tổ chức
      </h2>

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
            <option value="">Chọn địa điểm tổ chức</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.city || "Việt Nam"})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewVenue((current) => !current)}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
          >
            <Plus className="size-4" /> Thêm địa điểm mới
          </button>
          {showNewVenue && (
            <form
              onSubmit={handleCreateVenue}
              className="mt-3 space-y-3 rounded-2xl border border-outline-variant bg-surface-container-low p-4"
            >
              <p className="text-sm font-bold text-on-surface">Địa điểm của sự kiện</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  aria-label="Tên địa điểm"
                  required
                  value={venueName}
                  onChange={(event) => setVenueName(event.target.value)}
                  placeholder="Tên địa điểm *"
                  className="w-full rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-sm"
                />
                <input
                  aria-label="Thành phố"
                  required
                  value={venueCity}
                  onChange={(event) => setVenueCity(event.target.value)}
                  placeholder="Thành phố *"
                  className="w-full rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-sm"
                />
                <input
                  aria-label="Địa chỉ"
                  required
                  value={venueAddress}
                  onChange={(event) => setVenueAddress(event.target.value)}
                  placeholder="Địa chỉ cụ thể *"
                  className="w-full rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-sm sm:col-span-2"
                />
                <input
                  aria-label="Sức chứa"
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={venueCapacity}
                  onChange={(event) => setVenueCapacity(event.target.value)}
                  placeholder="Sức chứa tối đa *"
                  className="w-full rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-sm"
                />
              </div>
              {venueError && (
                <p role="alert" className="text-sm text-red-600">
                  {venueError}
                </p>
              )}
              <button
                type="submit"
                disabled={isCreatingVenue}
                className="workspace-primary-button disabled:opacity-50"
              >
                {isCreatingVenue ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Lưu và chọn địa điểm
              </button>
            </form>
          )}
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
          disabled={isCreatingDraft}
          onClick={handleProceedToMedia}
          className="px-6 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
        >
          {isCreatingDraft ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Đang tạo bản nháp...</span>
            </>
          ) : (
            <>
              <span>Tiếp tục: Tải ảnh</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
