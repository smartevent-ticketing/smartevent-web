"use client"

import { useState } from "react"
import { CheckCircle2, Circle, AlertTriangle, CreditCard, Ticket, ListChecks } from "lucide-react"
import type {
  AreaItem,
  EventManagementData,
  SalePhaseItem,
  TicketTypeItem,
} from "@/features/organizer/model/event-management.types"
import { parseTicketPurchaseLimit } from "@/features/organizer/model/ticket-purchase-limit"

interface OverviewTabProps {
  event: EventManagementData
  areas?: AreaItem[]
  ticketTypes?: TicketTypeItem[]
  salePhases?: SalePhaseItem[]
  onSwitchTab: (tab: string) => void
  onUpdateTicketLimit: (limit: number | undefined) => Promise<void>
  isSavingTicketLimit: boolean
}

export function OverviewTab({
  event,
  areas = [],
  ticketTypes = [],
  salePhases = [],
  onSwitchTab,
  onUpdateTicketLimit,
  isSavingTicketLimit,
}: OverviewTabProps) {
  const isDraft = !event.status || event.status === "DRAFT"
  const canEditTicketLimit = event.status !== "CANCELLED" && event.status !== "COMPLETED"
  const [ticketLimitInput, setTicketLimitInput] = useState(
    event.maxTicketsPerUser?.toString() ?? "",
  )
  const [ticketLimitError, setTicketLimitError] = useState<string | null>(null)

  async function saveTicketLimit(eventForm: React.FormEvent<HTMLFormElement>) {
    eventForm.preventDefault()
    setTicketLimitError(null)
    try {
      const limit = parseTicketPurchaseLimit(ticketLimitInput)
      if (limit === (event.maxTicketsPerUser ?? undefined)) return
      await onUpdateTicketLimit(limit)
    } catch (error) {
      setTicketLimitError(
        error instanceof Error ? error.message : "Không thể cập nhật giới hạn vé.",
      )
    }
  }

  // 1. Tính toán doanh thu và vé THỰC TẾ từ danh sách hạng vé
  const totalTickets = ticketTypes.reduce((sum, t) => sum + (t.totalQuota || 0), 0)
  const totalSold = ticketTypes.reduce((sum, t) => sum + (t.soldCount || 0), 0)
  const expectedRevenue = ticketTypes.reduce(
    (sum, t) => sum + (t.price || 0) * (t.totalQuota || 0),
    0,
  )

  // 2. Tính toán tiến độ thiết lập thực tế (4 tiêu chí)
  const checklist = [
    { label: "Thông tin cơ bản & Thời gian", done: Boolean(event.name && event.date) },
    {
      label: "Địa điểm tổ chức",
      done: Boolean(event.location && !event.location.includes("Chưa cấu hình")),
    },
    { label: "Phân khu & Ghế ngồi", done: areas.length > 0 },
    { label: "Hạng vé & Đợt mở bán", done: ticketTypes.length > 0 && salePhases.length > 0 },
  ]
  const completedCount = checklist.filter((item) => item.done).length
  const progressPercent = Math.round((completedCount / checklist.length) * 100)

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
        <div className="workspace-card flex flex-col justify-between p-6">
          <div className="flex items-center gap-2 text-on-surface-variant mb-6">
            <CreditCard className="size-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Doanh thu dự kiến
            </span>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-on-surface">
              {expectedRevenue.toLocaleString("vi-VN")} ₫
            </p>
            <p className="text-xs text-on-surface-variant mt-1.5">
              Dựa trên cấu hình giá vé hiện tại
            </p>
          </div>
        </div>

        {/* Tổng vé thiết lập */}
        <div className="workspace-card flex flex-col justify-between p-6">
          <div className="flex items-center gap-2 text-on-surface-variant mb-6">
            <Ticket className="size-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Tổng vé thiết lập
            </span>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-on-surface">
              {totalTickets.toLocaleString("vi-VN")} vé
            </p>
            <p className="text-xs text-on-surface-variant mt-1.5">
              Đã bán:{" "}
              <span className="font-semibold text-primary">
                {totalSold.toLocaleString("vi-VN")}
              </span>{" "}
              vé
            </p>
          </div>
        </div>

        {/* Tiến độ thiết lập động */}
        <div className="workspace-card flex flex-col justify-between p-6">
          <div className="flex items-center gap-2 text-on-surface-variant mb-4">
            <ListChecks className="size-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Tiến độ thiết lập
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-on-surface">{progressPercent}%</span>
              <span className="text-on-surface-variant">
                {completedCount}/{checklist.length} Hạng mục
              </span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <ul className="space-y-1.5 text-xs">
              {checklist.map((item, idx) => (
                <li
                  key={idx}
                  className={`flex items-center gap-2 font-medium ${
                    item.done ? "text-primary" : "text-on-surface-variant/60"
                  }`}
                >
                  {item.done ? (
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                  ) : (
                    <Circle className="size-3.5 text-outline-variant shrink-0" />
                  )}
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <section className="workspace-card space-y-3 p-6">
        <h3 className="text-sm font-bold text-on-surface">Giới hạn mua vé mỗi tài khoản</h3>
        <p className="text-xs text-on-surface-variant">
          Áp dụng cho tổng số vé của một tài khoản trên toàn bộ sự kiện. Để trống nếu không giới
          hạn.
        </p>
        <form onSubmit={saveTicketLimit} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[180px] flex-1 max-w-xs">
            <label htmlFor="event-ticket-limit" className="block text-xs font-semibold mb-1">
              Số vé tối đa
            </label>
            <input
              id="event-ticket-limit"
              type="number"
              min={1}
              max={2147483647}
              step={1}
              value={ticketLimitInput}
              onChange={(inputEvent) => {
                setTicketLimitInput(inputEvent.target.value)
                setTicketLimitError(null)
              }}
              disabled={!canEditTicketLimit || isSavingTicketLimit}
              placeholder="Không giới hạn"
              aria-describedby="event-ticket-limit-help"
              className="w-full px-3 py-2 border border-outline-variant/60 rounded-xl text-sm disabled:opacity-60"
            />
          </div>
          {canEditTicketLimit && (
            <button
              type="submit"
              disabled={isSavingTicketLimit}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl disabled:opacity-60 cursor-pointer"
            >
              {isSavingTicketLimit ? "Đang lưu..." : "Lưu giới hạn"}
            </button>
          )}
        </form>
        <p id="event-ticket-limit-help" className="text-xs text-on-surface-variant">
          Hiện tại: {event.maxTicketsPerUser ? `${event.maxTicketsPerUser} vé` : "Không giới hạn"}
        </p>
        {ticketLimitError && (
          <p role="alert" className="text-xs text-red-600">
            {ticketLimitError}
          </p>
        )}
      </section>
    </div>
  )
}
