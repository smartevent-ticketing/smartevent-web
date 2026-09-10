"use client"

import { ArrowRight } from "lucide-react"
import type { useEventSetup } from "@/features/organizer/hooks/use-event-setup"

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
}: Props) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-outline-variant/60 shadow-xs space-y-5">
      <h2 className="text-xl font-bold text-on-surface">Bước 1: Thông tin sự kiện cơ bản</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-on-surface mb-1">
            Tên sự kiện <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
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
            Mô tả chi tiết sự kiện
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Giới thiệu nội dung nghệ sĩ, lịch trình biểu diễn và các lưu ý..."
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
        >
          <span>Tiếp tục</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
