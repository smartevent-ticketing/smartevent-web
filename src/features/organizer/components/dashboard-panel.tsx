"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  Eye,
  Layers,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Ticket,
  TrendingUp,
  X,
} from "lucide-react"
import type {
  useOrganizerEvents,
  DisplayEvent,
} from "@/features/organizer/hooks/use-organizer-events"

type Props = {
  events: DisplayEvent[]
  isLoading: boolean
  totalEvents: number
  publishedCount: number
  pendingCount: number
  draftCount: number
  completedCount: number
  totalRevenue: number
  totalSold: number
  totalCapacity: number
  totalHeld: number
  overallOccupancyRate: number
  avgRevenuePerSoldTicket: number
  setActiveSection: (section: "dashboard" | "events" | "inventory") => void
}

export function OrganizerDashboardPanel({
  events,
  isLoading,
  totalEvents,
  publishedCount,
  pendingCount,
  draftCount,
  completedCount,
  totalRevenue,
  totalSold,
  totalCapacity,
  totalHeld,
  overallOccupancyRate,
  avgRevenuePerSoldTicket,
  setActiveSection,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  // Filter events based on search term & status
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

  // Top events by revenue
  const topRevenueEvents = useMemo(() => {
    return [...events]
      .filter((e) => e.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3)
  }, [events])

  return (
    <div className="space-y-8">
      {/* 1. Header KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Doanh thu thực tế */}
        <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-xs space-y-3 group hover:border-emerald-500/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Tổng doanh thu bán vé
            </span>
            <div className="size-10 rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
              <DollarSign className="size-5" />
            </div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
              {isLoading ? (
                <div className="h-8 w-36 bg-surface-container-high animate-pulse rounded-lg" />
              ) : (
                `${totalRevenue.toLocaleString("vi-VN")} ₫`
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Doanh thu từ các đơn hàng thanh toán thành công
            </p>
          </div>

          <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Thời gian thực</span>
            </div>
            <span className="text-on-surface-variant font-medium">
              TB:{" "}
              {avgRevenuePerSoldTicket > 0
                ? `${avgRevenuePerSoldTicket.toLocaleString("vi-VN")} ₫`
                : "0 ₫"}
              /vé
            </span>
          </div>
        </div>

        {/* Card 2: Lượng vé đã bán */}
        <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-xs space-y-3 group hover:border-blue-500/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Vé đã bán / Sức chứa
            </span>
            <div className="size-10 rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
              <Ticket className="size-5" />
            </div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight flex items-baseline gap-2">
              {isLoading ? (
                <div className="h-8 w-36 bg-surface-container-high animate-pulse rounded-lg" />
              ) : (
                <>
                  <span>{totalSold.toLocaleString("vi-VN")}</span>
                  <span className="text-sm font-semibold text-on-surface-variant">
                    / {totalCapacity.toLocaleString("vi-VN")} vé
                  </span>
                </>
              )}
            </div>
            {/* Progress bar */}
            <div className="mt-2 w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(overallOccupancyRate > 0 ? overallOccupancyRate : 0, 0))}%`,
                }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between text-xs text-on-surface-variant">
            <span className="font-semibold text-blue-700">
              Đạt {overallOccupancyRate}% sức chứa
            </span>
            <span>{totalHeld > 0 ? `${totalHeld} vé đang giữ chỗ` : "Kho vé sẵn sàng"}</span>
          </div>
        </div>

        {/* Card 3: Sự kiện đang mở bán */}
        <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-xs space-y-3 group hover:border-indigo-500/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Sự kiện đang mở bán
            </span>
            <div className="size-10 rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
              <Layers className="size-5" />
            </div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
              {isLoading ? (
                <div className="h-8 w-24 bg-surface-container-high animate-pulse rounded-lg" />
              ) : (
                `${publishedCount} Sự kiện`
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Đang tiếp nhận khách hàng mua vé trực tuyến
            </p>
          </div>

          <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between text-xs text-on-surface-variant">
            <span className="font-medium text-amber-700">{pendingCount} đang chờ duyệt</span>
            <span className="text-slate-500">{draftCount} bản nháp</span>
          </div>
        </div>

        {/* Card 4: Tổng quan hiệu suất */}
        <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-xs space-y-3 group hover:border-purple-500/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Tổng sự kiện quản lý
            </span>
            <div className="size-10 rounded-2xl bg-purple-50 text-purple-600 ring-1 ring-purple-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
              <TrendingUp className="size-5" />
            </div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
              {isLoading ? (
                <div className="h-8 w-24 bg-surface-container-high animate-pulse rounded-lg" />
              ) : (
                `${totalEvents} Sự kiện`
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Bao gồm tất cả sự kiện trong các giai đoạn
            </p>
          </div>

          <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between text-xs text-on-surface-variant">
            <span className="text-purple-700 font-semibold">{completedCount} đã kết thúc</span>
            <button
              type="button"
              onClick={() => setActiveSection("inventory")}
              className="text-primary hover:underline font-semibold flex items-center gap-0.5"
            >
              <span>Xem kho vé</span>
              <ArrowUpRight className="size-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Selling Events Spotlight */}
      {topRevenueEvents.length > 0 && (
        <div className="bg-linear-to-r from-emerald-900/5 via-blue-900/5 to-purple-900/5 rounded-3xl border border-outline-variant/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
                <Sparkles className="size-4" />
              </div>
              <h2 className="text-base font-bold text-on-surface">Sự kiện dẫn đầu doanh thu</h2>
            </div>
            <span className="text-xs text-on-surface-variant font-medium">
              Xếp hạng theo tổng giá trị vé bán thành công
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topRevenueEvents.map((ev, idx) => (
              <div
                key={ev.id}
                className="bg-white rounded-2xl p-4 border border-outline-variant/60 shadow-2xs space-y-3 hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center justify-center size-6 rounded-full text-xs font-black ${
                        idx === 0
                          ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
                          : idx === 1
                            ? "bg-slate-100 text-slate-700 ring-1 ring-slate-300"
                            : "bg-orange-100 text-orange-800 ring-1 ring-orange-300"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant">
                      {ev.category}
                    </span>
                  </div>
                  <Link
                    href={`/organizer/events/${ev.id}`}
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <span>Quản lý</span>
                    <ArrowUpRight className="size-3" />
                  </Link>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-on-surface line-clamp-1" title={ev.name}>
                    {ev.name}
                  </h3>
                  <div className="text-lg font-black text-emerald-600 mt-1">
                    {ev.revenue.toLocaleString("vi-VN")} ₫
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span>
                      Đã bán: <strong>{ev.ticketsSold.toLocaleString("vi-VN")}</strong> /{" "}
                      {ev.totalTickets.toLocaleString("vi-VN")}
                    </span>
                    <span className="font-semibold text-emerald-700">{ev.occupancyRate}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${Math.min(100, ev.occupancyRate)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Main Events Data Table */}
      <div className="bg-white rounded-3xl border border-outline-variant/60 shadow-xs overflow-hidden">
        {/* Table Controls Toolbar */}
        <div className="p-6 border-b border-outline-variant/60 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-on-surface">
                Hiệu suất phân phối & Bán vé sự kiện
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Theo dõi tình trạng mở bán, phân bổ tồn kho và doanh thu thực tế theo từng sự kiện.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <Link
                href="/organizer/events/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <Plus className="size-3.5" />
                <span>Thêm sự kiện</span>
              </Link>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold scrollbar-none">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                  statusFilter === "ALL"
                    ? "bg-on-surface text-surface"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Tất cả ({totalEvents})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("PUBLISHED")}
                className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                  statusFilter === "PUBLISHED"
                    ? "bg-emerald-700 text-white"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Đang mở bán ({publishedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("PENDING_APPROVAL")}
                className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                  statusFilter === "PENDING_APPROVAL"
                    ? "bg-amber-600 text-white"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Chờ duyệt ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("DRAFT")}
                className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                  statusFilter === "DRAFT"
                    ? "bg-slate-700 text-white"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
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
                      ? "bg-blue-700 text-white"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  Đã kết thúc ({completedCount})
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện, địa điểm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-surface-container-low border border-outline-variant/60 rounded-xl focus:outline-hidden focus:border-primary text-on-surface placeholder:text-on-surface-variant/70"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="size-10 bg-surface-container-high rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container-high rounded-md w-1/3" />
                  <div className="h-3 bg-surface-container-high rounded-md w-1/4" />
                </div>
                <div className="h-6 bg-surface-container-high rounded-md w-24" />
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
              <h3 className="text-sm font-bold text-on-surface">Không tìm thấy sự kiện phù hợp</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                {searchTerm
                  ? `Không có kết quả nào cho "${searchTerm}". Thử tìm kiếm với từ khóa khác.`
                  : "Chưa có sự kiện nào trong danh mục lọc này."}
              </p>
            </div>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-xs font-bold text-primary hover:underline inline-block pt-1"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-surface-container-low text-[11px] uppercase font-bold text-on-surface-variant border-b border-outline-variant/60 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Sự kiện</th>
                  <th className="px-6 py-4">Thời gian & Địa điểm</th>
                  <th className="px-6 py-4">Tiến độ vé</th>
                  <th className="px-6 py-4">Doanh thu</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 text-xs sm:text-sm">
                {filteredEvents.map((ev) => (
                  <tr
                    key={ev.id}
                    className="hover:bg-surface-container-low/60 transition-colors group"
                  >
                    {/* Event Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-black text-sm">
                          {ev.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 max-w-xs sm:max-w-sm">
                          <Link
                            href={`/organizer/events/${ev.id}`}
                            className="font-bold text-on-surface hover:text-primary transition line-clamp-1 block"
                            title={ev.name}
                          >
                            {ev.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-semibold text-primary">
                              {ev.category}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-[11px] text-on-surface-variant font-mono">
                              {ev.phasesCount > 0 ? `${ev.phasesCount} đợt bán` : "Chưa có đợt bán"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date & Venue */}
                    <td className="px-6 py-4 text-xs text-on-surface-variant">
                      <div className="flex items-center gap-1.5 font-medium text-on-surface">
                        <Clock className="size-3.5 text-on-surface-variant shrink-0" />
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

                    {/* Ticket Progress */}
                    <td className="px-6 py-4">
                      <div className="space-y-1.5 min-w-[130px]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-on-surface">
                            {ev.ticketsSold.toLocaleString("vi-VN")}
                          </span>
                          <span className="text-on-surface-variant">
                            / {ev.totalTickets.toLocaleString("vi-VN")} vé
                          </span>
                        </div>
                        <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              ev.occupancyRate >= 90
                                ? "bg-purple-600"
                                : ev.occupancyRate > 0
                                  ? "bg-blue-600"
                                  : "bg-gray-300"
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(ev.occupancyRate, ev.ticketsSold > 0 ? 3 : 0))}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                          <span className="font-semibold text-blue-700">
                            {ev.occupancyRate}% lấp đầy
                          </span>
                          {ev.heldTickets > 0 && (
                            <span className="text-amber-600 font-medium">
                              ({ev.heldTickets} giữ)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Revenue */}
                    <td className="px-6 py-4">
                      <div className="font-black text-on-surface text-sm sm:text-base text-emerald-600">
                        {ev.revenue.toLocaleString("vi-VN")} ₫
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        {ev.ticketsSold > 0
                          ? `TB ~${Math.round(ev.revenue / ev.ticketsSold).toLocaleString("vi-VN")} ₫/vé`
                          : "Chưa có phát sinh"}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {ev.status === "PUBLISHED" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Đang mở bán
                        </span>
                      ) : ev.status === "PENDING_APPROVAL" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="size-1.5 rounded-full bg-amber-500" />
                          Chờ phê duyệt
                        </span>
                      ) : ev.status === "COMPLETED" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="size-1.5 rounded-full bg-blue-500" />
                          Đã kết thúc
                        </span>
                      ) : ev.status === "CANCELLED" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="size-1.5 rounded-full bg-rose-500" />
                          Đã hủy
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <span className="size-1.5 rounded-full bg-slate-400" />
                          Bản nháp
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {ev.status === "PUBLISHED" && (
                          <Link
                            href={`/events/${ev.id}`}
                            target="_blank"
                            className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition"
                            title="Xem trang bán vé công khai"
                          >
                            <ExternalLink className="size-4" />
                          </Link>
                        )}
                        <Link
                          href={`/organizer/events/${ev.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-primary hover:text-white text-on-surface text-xs font-bold transition shadow-2xs"
                        >
                          <span>Quản lý</span>
                          <ArrowUpRight className="size-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info bar */}
        <div className="p-4 bg-surface-container-low/50 border-t border-outline-variant/60 flex flex-col sm:flex-row items-center justify-between text-xs text-on-surface-variant gap-2">
          <span>
            Hiển thị <strong>{filteredEvents.length}</strong> / <strong>{totalEvents}</strong> sự
            kiện
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveSection("events")}
              className="text-primary hover:underline font-bold"
            >
              Chuyển sang Quản lý chi tiết sự kiện →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
