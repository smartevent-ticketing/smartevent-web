"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Calendar, Clock, ExternalLink, MapPin, Search, X } from "lucide-react"
import type { DisplayEvent } from "../model/organizer-event"

type Props = {
  events: DisplayEvent[]
  isLoading?: boolean
}

export function OrganizerEventsPanel({ events, isLoading }: Props) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchSearch =
        ev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.category.toLowerCase().includes(searchTerm.toLowerCase())

      const matchStatus = statusFilter === "ALL" || ev.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [events, searchTerm, statusFilter])

  const publishedCount = events.filter((e) => e.status === "PUBLISHED").length
  const pendingCount = events.filter((e) => e.status === "PENDING_APPROVAL").length
  const draftCount = events.filter((e) => e.status === "DRAFT").length
  const completedCount = events.filter((e) => e.status === "COMPLETED").length

  return (
    <div className="workspace-card space-y-6 overflow-hidden p-5 sm:p-7">
      {/* Header and Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="workspace-kicker">Danh sách hiện có</p>
          <h2 className="mt-1 text-xl font-extrabold text-[#251f29]">
            Danh sách tất cả sự kiện ({events.length})
          </h2>
          <p className="mt-1 text-sm text-[#756d77]">
            Quản lý vòng đời sự kiện, cấu hình phân khu, vé và theo dõi bán vé theo thời gian thực.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col justify-between gap-3 border-t border-[#eee6e1] pt-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold scrollbar-none">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-[#bd443a] text-white"
                : "bg-[#f7f3f0] text-[#756d77] hover:bg-[#ede4de]"
            }`}
          >
            Tất cả ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("PUBLISHED")}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
              statusFilter === "PUBLISHED"
                ? "bg-[#257555] text-white"
                : "bg-[#f7f3f0] text-[#756d77] hover:bg-[#ede4de]"
            }`}
          >
            Đã xuất bản ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("PENDING_APPROVAL")}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
              statusFilter === "PENDING_APPROVAL"
                ? "bg-[#b87a38] text-white"
                : "bg-[#f7f3f0] text-[#756d77] hover:bg-[#ede4de]"
            }`}
          >
            Chờ duyệt ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("DRAFT")}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
              statusFilter === "DRAFT"
                ? "bg-[#6b6070] text-white"
                : "bg-[#f7f3f0] text-[#756d77] hover:bg-[#ede4de]"
            }`}
          >
            Bản nháp ({draftCount})
          </button>
          {completedCount > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter("COMPLETED")}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                statusFilter === "COMPLETED"
                  ? "bg-[#286c8b] text-white"
                  : "bg-[#f7f3f0] text-[#756d77] hover:bg-[#ede4de]"
              }`}
            >
              Đã kết thúc ({completedCount})
            </button>
          )}
        </div>

        <div className="relative min-w-0 sm:min-w-[240px]">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            aria-label="Tìm sự kiện"
            placeholder="Tìm kiếm sự kiện, địa điểm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="workspace-input !pl-9 !pr-8"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Xóa tìm kiếm"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#756d77] hover:text-[#251f29]"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-8 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="size-10 bg-surface-container-high rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-container-high rounded-md w-1/3" />
                <div className="h-3 bg-surface-container-high rounded-md w-1/4" />
              </div>
              <div className="h-6 bg-surface-container-high rounded-md w-24" />
              <div className="h-6 bg-surface-container-high rounded-md w-20" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="size-12 rounded-2xl bg-surface-container text-on-surface-variant mx-auto flex items-center justify-center">
            <Calendar className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-on-surface">Không tìm thấy sự kiện nào</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              {searchTerm
                ? `Không có kết quả nào cho "${searchTerm}".`
                : "Không có sự kiện nào trong bộ lọc này."}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="workspace-table min-w-[980px]">
            <thead>
              <tr>
                <th className="px-5 py-3.5">Tên sự kiện</th>
                <th className="px-5 py-3.5">Thời gian & Địa điểm</th>
                <th className="px-5 py-3.5">Vé đã bán</th>
                <th className="px-5 py-3.5">Doanh thu ước tính</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((ev) => (
                <tr key={ev.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1e9] text-sm font-black text-[#bd443a]">
                        {ev.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <Link
                          href={`/organizer/events/${ev.id}`}
                          className="block line-clamp-1 font-extrabold text-[#251f29] transition hover:text-[#bd443a]"
                          title={ev.name}
                        >
                          {ev.name}
                        </Link>
                        <span className="text-[11px] font-semibold text-[#bd443a]">
                          {ev.category}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-xs text-on-surface-variant">
                    <div className="flex items-center gap-1.5 font-medium text-on-surface">
                      <Clock className="size-3.5 shrink-0" />
                      <span>{ev.date}</span>
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-on-surface-variant/80 mt-1 line-clamp-1"
                      title={ev.venue}
                    >
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">{ev.venue}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="space-y-1.5 min-w-[120px]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-on-surface">
                          {ev.ticketsSold.toLocaleString("vi-VN")}
                        </span>
                        <span className="text-on-surface-variant">
                          / {ev.totalTickets.toLocaleString("vi-VN")}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#ff8063]"
                          style={{
                            width: `${Math.min(100, Math.max(ev.occupancyRate, ev.ticketsSold > 0 ? 3 : 0))}%`,
                          }}
                        />
                      </div>
                      <span className="block text-[11px] font-semibold text-[#bd443a]">
                        {ev.occupancyRate}% lấp đầy
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-bold text-emerald-600 text-sm">
                    {ev.revenue.toLocaleString("vi-VN")} ₫
                  </td>

                  <td className="px-5 py-4">
                    {ev.status === "PUBLISHED" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Đã xuất bản
                      </span>
                    ) : ev.status === "PENDING_APPROVAL" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="size-1.5 rounded-full bg-amber-500" />
                        Chờ duyệt
                      </span>
                    ) : ev.status === "COMPLETED" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <span className="size-1.5 rounded-full bg-blue-500" />
                        Đã kết thúc
                      </span>
                    ) : ev.status === "CANCELLED" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="size-1.5 rounded-full bg-rose-500" />
                        Đã hủy
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <span className="size-1.5 rounded-full bg-slate-400" />
                        Bản nháp
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right space-x-2">
                    {ev.status === "PUBLISHED" && (
                      <Link
                        href={`/events/${ev.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container rounded-xl transition"
                      >
                        <ExternalLink className="size-3.5" />
                        <span>Xem trang bán</span>
                      </Link>
                    )}
                    <Link
                      href={`/organizer/events/${ev.id}`}
                      className="workspace-primary-button !min-h-0 !py-2"
                    >
                      <span>Quản lý</span>
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
