"use client"

import Link from "next/link"
import { ArrowRight, ArrowUpRight, CalendarDays } from "lucide-react"
import type { DashboardEventsTableProps } from "./dashboard-types"

function statusLabel(status: string) {
  if (status === "PUBLISHED") return "Đã xuất bản"
  if (status === "PENDING_APPROVAL") return "Chờ duyệt"
  if (status === "COMPLETED") return "Đã kết thúc"
  if (status === "CANCELLED") return "Đã hủy"
  return "Bản nháp"
}

export function DashboardEventsTable({
  events,
  isLoading,
  totalEvents,
  setActiveSection,
}: DashboardEventsTableProps) {
  return (
    <section className="workspace-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee6e1] px-5 py-5 sm:px-7">
        <div>
          <p className="workspace-kicker">Theo dõi sự kiện</p>
          <h2 className="mt-1 text-lg font-extrabold">Sự kiện của bạn</h2>
          <p className="mt-1 text-xs text-[#756d77]">
            Xem nhanh tình trạng và chuyển tới trang quản lý chi tiết.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveSection("events")}
          className="workspace-secondary-button"
        >
          Tất cả ({totalEvents}) <ArrowRight className="size-4" />
        </button>
      </div>
      {isLoading ? (
        <div role="status" className="px-6 py-14 text-center text-sm text-[#756d77]">
          Đang tải sự kiện...
        </div>
      ) : events.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <CalendarDays className="mx-auto size-9 text-[#b8aeb4]" />
          <p className="mt-3 text-sm font-bold">Bạn chưa tạo sự kiện nào</p>
          <Link
            href="/organizer/events/new"
            className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#bd443a] hover:underline"
          >
            Tạo sự kiện đầu tiên <ArrowUpRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="workspace-table min-w-[680px]">
            <thead>
              <tr>
                <th>Sự kiện</th>
                <th>Thời gian</th>
                <th>Vé đã bán</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 5).map((event) => (
                <tr key={event.id}>
                  <td>
                    <div className="min-w-0">
                      <p className="max-w-xs truncate font-extrabold text-[#251f29]">
                        {event.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#756d77]">{event.category}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-[#756d77]">{event.date}</td>
                  <td>
                    <span className="font-bold tabular-nums">
                      {event.ticketsSold.toLocaleString("vi-VN")}
                    </span>
                    <span className="text-[#9a8f96]">
                      {" "}
                      / {event.totalTickets.toLocaleString("vi-VN")}
                    </span>
                  </td>
                  <td>
                    <span className="rounded-full bg-[#f7f0ec] px-2.5 py-1 text-[11px] font-bold text-[#7c5960]">
                      {statusLabel(event.status)}
                    </span>
                  </td>
                  <td className="text-right">
                    <Link
                      href={"/organizer/events/" + event.id}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#bd443a] hover:underline"
                    >
                      Quản lý <ArrowUpRight className="size-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
