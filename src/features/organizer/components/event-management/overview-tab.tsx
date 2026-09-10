"use client"

import { CheckCircle2, Circle, AlertTriangle, CreditCard, Ticket, ListChecks } from "lucide-react"

interface OverviewTabProps {
  event: {
    id?: string
    name?: string
    status?: string
    expectedRevenue?: number
    totalTickets?: number
    vipTickets?: number
    regularTickets?: number
  }
  onSwitchTab: (tab: string) => void
}

export function OverviewTab({ event, onSwitchTab }: OverviewTabProps) {
  const isDraft = !event.status || event.status === "DRAFT"
  const expectedRev = event.expectedRevenue || 0
  const totalTix = event.totalTickets || 1500
  const vipTix = event.vipTickets || 300
  const regularTix = event.regularTickets || totalTix - vipTix

  return (
    <div className="space-y-6">
      {/* Alert Banner for Draft */}
      {isDraft && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5 flex items-start gap-4 shadow-xs">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="text-sm font-bold text-amber-950">Hoàn thiện thông tin sự kiện</h4>
            <p className="text-xs text-amber-900 leading-relaxed">
              Sự kiện của bạn đang ở trạng thái bản nháp. Vui lòng kiểm tra và hoàn thiện các mục
              Khu vực, Hạng vé và Đợt mở bán trước khi gửi ban quản trị phê duyệt.
            </p>
            <button
              type="button"
              onClick={() => onSwitchTab("ticket-types")}
              className="text-xs font-bold text-primary hover:underline pt-1 inline-block cursor-pointer"
            >
              Đi tới cài đặt vé &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Metrics & Setup Progress Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Doanh thu dự kiến */}
        <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-on-surface-variant mb-6">
            <CreditCard className="size-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Doanh thu dự kiến
            </span>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-on-surface">
              {expectedRev.toLocaleString("vi-VN")} ₫
            </p>
            <p className="text-xs text-on-surface-variant mt-1.5">
              Dựa trên cấu hình giá vé hiện tại
            </p>
          </div>
        </div>

        {/* Tổng vé thiết lập */}
        <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-on-surface-variant mb-6">
            <Ticket className="size-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Tổng vé thiết lập
            </span>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-on-surface">
              {totalTix.toLocaleString("vi-VN")}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-primary" />
                VIP: {vipTix}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-slate-400" />
                Thường: {regularTix}
              </span>
            </div>
          </div>
        </div>

        {/* Tiến độ thiết lập */}
        <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-on-surface-variant mb-4">
            <ListChecks className="size-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Tiến độ thiết lập
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-on-surface">75%</span>
              <span className="text-on-surface-variant">3/4 Hạng mục</span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: "75%" }}
              />
            </div>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-2 text-primary font-medium">
                <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                <span>Thông tin cơ bản & Thời gian</span>
              </li>
              <li className="flex items-center gap-2 text-primary font-medium">
                <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                <span>Địa điểm & Hình ảnh</span>
              </li>
              <li className="flex items-center gap-2 text-primary font-medium">
                <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                <span>Phân khu & Ghế ngồi</span>
              </li>
              <li className="flex items-center gap-2 text-on-surface-variant/60">
                <Circle className="size-3.5 text-outline-variant shrink-0" />
                <span>Hoàn tất Đợt mở bán vé</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
