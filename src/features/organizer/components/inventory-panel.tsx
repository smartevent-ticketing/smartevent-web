"use client"

import type { useOrganizerEvents } from "@/features/organizer/hooks/use-organizer-events"

type Props = Pick<ReturnType<typeof useOrganizerEvents>, never>
export function OrganizerInventoryPanel({}: Props) {
  return (
    <div className="bg-white rounded-3xl border border-outline-variant/60 shadow-xs p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-on-surface">Báo cáo tồn kho & Phân phối vé</h2>
        <p className="text-xs text-on-surface-variant">
          Theo dõi tiến độ phân bổ vé theo từng phân khu và trạng thái giữ chỗ 10 phút.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-2">
          <span className="text-xs font-semibold text-on-surface-variant">
            Khu vực đứng (GA Standing)
          </span>
          <div className="text-xl font-bold text-on-surface">5.000 / 5.000 vé</div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="w-4/5 h-full bg-primary rounded-full" />
          </div>
          <span className="text-[11px] text-green-600 font-semibold block">
            Đã bán 80% sức chứa
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-2">
          <span className="text-xs font-semibold text-on-surface-variant">Khán đài A (Seated)</span>
          <div className="text-xl font-bold text-on-surface">1.850 / 2.000 vé</div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="w-[92%] h-full bg-primary rounded-full" />
          </div>
          <span className="text-[11px] text-green-600 font-semibold block">
            Đã bán 92% sức chứa
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-2">
          <span className="text-xs font-semibold text-on-surface-variant">Khu VVIP Ghế ngồi</span>
          <div className="text-xl font-bold text-on-surface">500 / 500 vé</div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="w-full h-full bg-green-500 rounded-full" />
          </div>
          <span className="text-[11px] text-primary font-bold block">
            Đã bán hết 100% (Sold Out)
          </span>
        </div>
      </div>
    </div>
  )
}
