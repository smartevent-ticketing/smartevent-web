"use client"

import { useState } from "react"
import { ArrowRight, AlertCircle } from "lucide-react"
import type { useEventSetup } from "@/features/organizer/hooks/use-event-setup"
import { parseTicketPurchaseLimit } from "@/features/organizer/model/ticket-purchase-limit"

type Props = Pick<
  ReturnType<typeof useEventSetup>,
  | "setCurrentStep"
  | "categories"
  | "eventName"
  | "setEventName"
  | "selectedCategoryId"
  | "setSelectedCategoryId"
  | "description"
  | "setDescription"
  | "maxTicketsPerUser"
  | "setMaxTicketsPerUser"
>
export function EventBasicInfoStep({
  setCurrentStep,
  categories,
  eventName,
  setEventName,
  selectedCategoryId,
  setSelectedCategoryId,
  description,
  setDescription,
  maxTicketsPerUser,
  setMaxTicketsPerUser,
}: Props) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleNext = () => {
    setErrorMsg(null)
    if (!eventName.trim()) {
      setErrorMsg("Vui lòng nhập tên sự kiện trước khi tiếp tục.")
      return
    }
    if (!description.trim()) {
      setErrorMsg("Vui lòng nhập mô tả / giới thiệu chi tiết cho sự kiện trước khi tiếp tục.")
      return
    }
    try {
      parseTicketPurchaseLimit(maxTicketsPerUser)
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Giới hạn vé không hợp lệ.")
      return
    }
    setCurrentStep(2)
  }

  return (
    <div className="workspace-card space-y-5 p-5 sm:p-8">
      <h2 className="text-xl font-extrabold text-[#251f29]">Bước 1: Thông tin sự kiện cơ bản</h2>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-on-surface mb-1">
            Tên sự kiện <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={eventName}
            onChange={(e) => {
              setEventName(e.target.value)
              if (errorMsg) setErrorMsg(null)
            }}
            placeholder="Ví dụ: Symphony of Lights 2026 — Live Concert"
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface mb-1">
            Danh mục sự kiện <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm text-on-surface focus:outline-none cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
            {categories.length === 0 && <option value="">Chưa tải được danh mục</option>}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface mb-1">
            Mô tả / Giới thiệu chi tiết sự kiện <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={5}
            required
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              if (errorMsg) setErrorMsg(null)
            }}
            placeholder="Giới thiệu nội dung nghệ sĩ, lịch trình biểu diễn, quy định và các lưu ý quan trọng cho khán giả..."
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-[11px] text-on-surface-variant mt-1">
            * Bắt buộc có thông tin giới thiệu để hiển thị trên trang bán vé cho khán giả theo dõi.
          </p>
        </div>

        <div>
          <label
            htmlFor="max-tickets-per-user"
            className="block text-xs font-bold text-on-surface mb-1"
          >
            Giới hạn số vé tối đa mỗi tài khoản
          </label>
          <input
            id="max-tickets-per-user"
            type="number"
            min={1}
            max={2147483647}
            step={1}
            value={maxTicketsPerUser}
            onChange={(e) => setMaxTicketsPerUser(e.target.value)}
            placeholder="Mặc định: Không giới hạn (hoặc nhập số vé tối đa, ví dụ: 4)"
            aria-describedby="max-tickets-per-user-help"
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p id="max-tickets-per-user-help" className="text-[11px] text-on-surface-variant mt-1">
            Giới hạn số vé tối đa một tài khoản được phép mua cho toàn bộ sự kiện (cơ chế chống phe
            vé).
          </p>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
        >
          <span>Tiếp tục</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
