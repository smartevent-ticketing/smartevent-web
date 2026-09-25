"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  PieChart,
  RefreshCw,
  Ticket,
} from "lucide-react"
import { organizerApi } from "@/features/organizer/api/organizer-api"
import type { DisplayEvent } from "@/features/organizer/hooks/use-organizer-events"
import type { components } from "@/lib/api/schema"

type InventoryCounterResponse = components["schemas"]["InventoryCounterResponse"]
type TicketSalePhaseResponse = components["schemas"]["TicketSalePhaseResponse"]

type Props = {
  events: DisplayEvent[]
}

export function OrganizerInventoryPanel({ events }: Props) {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    events.find((e) => e.status === "PUBLISHED")?.id || events[0]?.id || "",
  )
  const [counters, setCounters] = useState<InventoryCounterResponse[]>([])
  const [phases, setPhases] = useState<TicketSalePhaseResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)

  // Keep selectedEventId synced if events list loads after initial render
  useEffect(() => {
    if (!selectedEventId && events.length > 0) {
      setSelectedEventId(events.find((e) => e.status === "PUBLISHED")?.id || events[0].id)
    }
  }, [events, selectedEventId])

  // Fetch real inventory and sale phases for selected event
  useEffect(() => {
    if (!selectedEventId) return

    let isMounted = true
    setIsLoading(true)

    async function fetchInventoryDetails() {
      try {
        const [invRes, phasesRes] = await Promise.allSettled([
          organizerApi.getInventory(selectedEventId),
          organizerApi.getSalePhases(selectedEventId),
        ])

        if (!isMounted) return

        if (invRes.status === "fulfilled" && Array.isArray(invRes.value?.data)) {
          setCounters(invRes.value.data as InventoryCounterResponse[])
        } else {
          setCounters([])
        }

        if (phasesRes.status === "fulfilled" && Array.isArray(phasesRes.value?.data)) {
          setPhases(phasesRes.value.data as TicketSalePhaseResponse[])
        } else {
          setPhases([])
        }
      } catch {
        if (isMounted) {
          setCounters([])
          setPhases([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchInventoryDetails()

    return () => {
      isMounted = false
    }
  }, [selectedEventId, refreshCount])

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  // Aggregate counters
  const totalQuantity = counters.reduce((sum, c) => sum + (c.totalQuantity || 0), 0)
  const soldQuantity = counters.reduce((sum, c) => sum + (c.soldQuantity || 0), 0)
  const heldQuantity = counters.reduce((sum, c) => sum + (c.heldQuantity || 0), 0)
  const availableQuantity = counters.reduce((sum, c) => {
    const avail =
      c.availableQuantity != null
        ? c.availableQuantity
        : Math.max(0, (c.totalQuantity || 0) - (c.soldQuantity || 0) - (c.heldQuantity || 0))
    return sum + avail
  }, 0)

  const occupancyRate =
    totalQuantity > 0 ? Math.round((soldQuantity / totalQuantity) * 1000) / 10 : 0

  return (
    <div className="space-y-6">
      {/* Header & Event Selector */}
      <div className="bg-white rounded-3xl border border-outline-variant/60 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-on-surface">
              Báo cáo tồn kho & Phân phối vé thời gian thực
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Theo dõi biến động tồn kho chi tiết (Tổng vé, Đã bán, Giữ chỗ 10 phút, Khả dụng) theo
              từng đợt bán.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRefreshCount((c) => c + 1)}
              className="p-2.5 rounded-xl border border-outline-variant/60 hover:bg-surface-container text-on-surface transition cursor-pointer"
              title="Làm mới tồn kho"
            >
              <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            {/* Event Selector Dropdown */}
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3.5 py-2 text-xs font-semibold bg-surface-container-low border border-outline-variant/60 rounded-xl text-on-surface focus:outline-hidden focus:border-primary max-w-xs"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.status === "PUBLISHED" ? "Đang mở bán" : ev.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 bg-white rounded-3xl border border-outline-variant/60 flex flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="text-xs text-on-surface-variant font-medium">
            Đang tải dữ liệu tồn kho thời gian thực...
          </span>
        </div>
      ) : counters.length === 0 && phases.length === 0 ? (
        <div className="bg-white rounded-3xl border border-outline-variant/60 p-12 text-center space-y-4">
          <div className="size-12 rounded-2xl bg-surface-container text-on-surface-variant mx-auto flex items-center justify-center">
            <Ticket className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-on-surface">Chưa có dữ liệu tồn kho</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Sự kiện này chưa được tạo đợt mở bán hoặc bộ đếm tồn kho chưa được khởi tạo.
            </p>
          </div>
          {selectedEvent && (
            <Link
              href={`/organizer/events/${selectedEvent.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition"
            >
              <span>Cấu hình đợt bán vé</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Inventory Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-outline-variant/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Tổng vé phát hành
                </span>
                <Ticket className="size-4 text-primary" />
              </div>
              <div className="text-2xl font-black text-on-surface">
                {totalQuantity.toLocaleString("vi-VN")}
              </div>
              <div className="text-xs text-on-surface-variant">
                Qua {counters.length} đợt bán vé
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-outline-variant/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Vé đã bán thành công
                </span>
                <CheckCircle2 className="size-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600">
                {soldQuantity.toLocaleString("vi-VN")}
              </div>
              <div className="text-xs text-emerald-700 font-semibold">
                Đạt {occupancyRate}% công suất phát hành
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-outline-variant/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Đang giữ chỗ (10p)
                </span>
                <Clock className="size-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-600">
                {heldQuantity.toLocaleString("vi-VN")}
              </div>
              <div className="text-xs text-on-surface-variant">Khách đang hoàn tất thanh toán</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-outline-variant/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Vé khả dụng còn lại
                </span>
                <PieChart className="size-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-600">
                {availableQuantity.toLocaleString("vi-VN")}
              </div>
              <div className="text-xs text-on-surface-variant">Sẵn sàng cho người mua mới</div>
            </div>
          </div>

          {/* Breakdown per Sale Phase Table */}
          <div className="bg-white rounded-3xl border border-outline-variant/60 shadow-xs overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                <h3 className="text-base font-bold text-on-surface">
                  Chi tiết tồn kho theo đợt mở bán
                </h3>
              </div>
              {selectedEvent && (
                <Link
                  href={`/organizer/events/${selectedEvent.id}`}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Chỉnh sửa đợt bán</span>
                  <ArrowUpRight className="size-3" />
                </Link>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-surface-container-low text-[11px] uppercase font-bold text-on-surface-variant border-b border-outline-variant/60 tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Đợt mở bán</th>
                    <th className="px-5 py-3.5">Loại vé</th>
                    <th className="px-5 py-3.5">Giá bán</th>
                    <th className="px-5 py-3.5">Tổng vé</th>
                    <th className="px-5 py-3.5">Đã bán</th>
                    <th className="px-5 py-3.5">Đang giữ</th>
                    <th className="px-5 py-3.5">Còn lại</th>
                    <th className="px-5 py-3.5">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-xs sm:text-sm">
                  {phases.map((phase) => {
                    const counter = counters.find((c) => c.salePhaseId === phase.id)
                    const pTotal = counter?.totalQuantity ?? phase.quantity ?? 0
                    const pSold = counter?.soldQuantity ?? 0
                    const pHeld = counter?.heldQuantity ?? 0
                    const pAvail = counter?.availableQuantity ?? Math.max(0, pTotal - pSold - pHeld)
                    const pOccupancy = pTotal > 0 ? Math.round((pSold / pTotal) * 1000) / 10 : 0

                    return (
                      <tr key={phase.id} className="hover:bg-surface-container-low/50 transition">
                        <td className="px-5 py-4 font-bold text-on-surface">{phase.name}</td>
                        <td className="px-5 py-4 text-on-surface-variant">
                          {phase.ticketTypeName || "Chung"}
                        </td>
                        <td className="px-5 py-4 font-semibold text-on-surface">
                          {phase.price != null
                            ? `${Number(phase.price).toLocaleString("vi-VN")} ₫`
                            : "—"}
                        </td>
                        <td className="px-5 py-4 font-bold text-on-surface">
                          {pTotal.toLocaleString("vi-VN")}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-emerald-600">
                            {pSold.toLocaleString("vi-VN")}
                          </span>
                          <span className="text-[11px] text-on-surface-variant block">
                            ({pOccupancy}%)
                          </span>
                        </td>
                        <td className="px-5 py-4 font-medium text-amber-600">
                          {pHeld.toLocaleString("vi-VN")}
                        </td>
                        <td className="px-5 py-4 font-bold text-blue-600">
                          {pAvail.toLocaleString("vi-VN")}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              phase.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : phase.status === "SOLD_OUT"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : phase.status === "SCHEDULED"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : phase.status === "PAUSED"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {phase.status === "ACTIVE"
                              ? "Đang mở bán"
                              : phase.status === "SOLD_OUT"
                                ? "Cháy vé"
                                : phase.status === "SCHEDULED"
                                  ? "Sắp mở bán"
                                  : phase.status === "PAUSED"
                                    ? "Tạm dừng"
                                    : phase.status === "CLOSED"
                                      ? "Đã đóng"
                                      : phase.status || "Chưa kích hoạt"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
