"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
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
import type { DisplayEvent } from "../model/organizer-event"
import type { components } from "@/lib/api/schema"
import { readApiResponseList } from "../model/api-response-list"

type InventoryCounterResponse = components["schemas"]["InventoryCounterResponse"]
type TicketSalePhaseResponse = components["schemas"]["TicketSalePhaseResponse"]

type Props = {
  events: DisplayEvent[]
  isEventsLoading?: boolean
}

type InventorySnapshot = {
  key: string
  counters: InventoryCounterResponse[]
  phases: TicketSalePhaseResponse[]
  error: string | null
}

export function OrganizerInventoryPanel({ events, isEventsLoading = false }: Props) {
  const [requestedEventId, setRequestedEventId] = useState("")
  const [refreshCount, setRefreshCount] = useState(0)
  const [snapshot, setSnapshot] = useState<InventorySnapshot>({
    key: "",
    counters: [],
    phases: [],
    error: null,
  })
  const selectedEventId =
    events.find((event) => event.id === requestedEventId)?.id ||
    events.find((event) => event.status === "PUBLISHED")?.id ||
    events[0]?.id ||
    ""
  const requestKey = selectedEventId + ":" + refreshCount
  const isLoading = isEventsLoading || (Boolean(selectedEventId) && snapshot.key !== requestKey)
  const counters = snapshot.key === requestKey ? snapshot.counters : []
  const phases = snapshot.key === requestKey ? snapshot.phases : []
  const errorMessage = snapshot.key === requestKey ? snapshot.error : null

  useEffect(() => {
    if (!selectedEventId) return

    let active = true

    async function fetchInventoryDetails() {
      try {
        const [invRes, phasesRes] = await Promise.allSettled([
          organizerApi.getInventory(selectedEventId),
          organizerApi.getSalePhases(selectedEventId),
        ])
        if (!active) return
        setSnapshot({
          key: requestKey,
          counters: invRes.status === "fulfilled" ? readApiResponseList(invRes.value) : [],
          phases: phasesRes.status === "fulfilled" ? readApiResponseList(phasesRes.value) : [],
          error:
            invRes.status === "rejected" || phasesRes.status === "rejected"
              ? "Không thể tải đầy đủ dữ liệu kho vé. Vui lòng bấm Làm mới để thử lại."
              : null,
        })
      } catch {
        if (active)
          setSnapshot({
            key: requestKey,
            counters: [],
            phases: [],
            error: "Không thể tải dữ liệu kho vé. Vui lòng bấm Làm mới để thử lại.",
          })
      }
    }

    void fetchInventoryDetails()

    return () => {
      active = false
    }
  }, [selectedEventId, requestKey])

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
      <div className="workspace-card p-5 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="workspace-kicker">Chọn sự kiện</p>
            <h2 className="mt-1 text-xl font-extrabold">Theo dõi kho vé</h2>
            <p className="mt-1 text-sm text-[#756d77]">
              Số liệu cập nhật khi mở trang hoặc bấm Làm mới.
            </p>
          </div>

          <div className="flex w-full min-w-0 items-center gap-2 md:w-auto">
            <button
              type="button"
              onClick={() => setRefreshCount((c) => c + 1)}
              className="workspace-secondary-button !px-3"
              title="Làm mới tồn kho"
              aria-label="Làm mới tồn kho"
            >
              <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            {/* Event Selector Dropdown */}
            <select
              aria-label="Chọn sự kiện để xem kho vé"
              value={selectedEventId}
              onChange={(e) => setRequestedEventId(e.target.value)}
              className="workspace-input min-w-0 flex-1 font-semibold md:max-w-xs"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.status === "PUBLISHED" ? "Đã xuất bản" : ev.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-[#f0cdcb] bg-[#fff0f1] px-5 py-4 text-sm font-medium text-[#a13f47]"
        >
          {errorMessage}
        </div>
      )}
      {isLoading ? (
        <div className="workspace-card flex flex-col items-center justify-center gap-3 p-12">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="text-xs text-on-surface-variant font-medium">
            Đang tải dữ liệu tồn kho...
          </span>
        </div>
      ) : counters.length === 0 && phases.length === 0 ? (
        <div className="workspace-card space-y-4 p-12 text-center">
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
              className="workspace-primary-button"
            >
              <span>Cấu hình đợt bán vé</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="workspace-card space-y-2 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Tổng vé phát hành
                </span>
                <Ticket className="size-4 text-primary" />
              </div>
              <div className="text-3xl font-extrabold tabular-nums text-[#251f29]">
                {totalQuantity.toLocaleString("vi-VN")}
              </div>
              <div className="text-xs text-on-surface-variant">
                Qua {counters.length} đợt bán vé
              </div>
            </div>

            <div className="workspace-card space-y-2 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Vé đã bán thành công
                </span>
                <CheckCircle2 className="size-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold tabular-nums text-[#257555]">
                {soldQuantity.toLocaleString("vi-VN")}
              </div>
              <div className="text-xs text-emerald-700 font-semibold">
                Đạt {occupancyRate}% công suất phát hành
              </div>
            </div>

            <div className="workspace-card space-y-2 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Đang giữ chỗ (10p)
                </span>
                <Clock className="size-4 text-amber-600" />
              </div>
              <div className="text-3xl font-extrabold tabular-nums text-[#b87a38]">
                {heldQuantity.toLocaleString("vi-VN")}
              </div>
              <div className="text-xs text-on-surface-variant">Khách đang hoàn tất thanh toán</div>
            </div>

            <div className="workspace-card space-y-2 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Vé khả dụng còn lại
                </span>
                <PieChart className="size-4 text-blue-600" />
              </div>
              <div className="text-3xl font-extrabold tabular-nums text-[#286c8b]">
                {availableQuantity.toLocaleString("vi-VN")}
              </div>
              <div className="text-xs text-on-surface-variant">Sẵn sàng cho người mua mới</div>
            </div>
          </div>

          <div className="workspace-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee6e1] px-5 py-5 sm:px-7">
              <div className="flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                <h3 className="text-lg font-extrabold text-[#251f29]">
                  Chi tiết tồn kho theo đợt mở bán
                </h3>
              </div>
              {selectedEvent && (
                <Link
                  href={`/organizer/events/${selectedEvent.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#bd443a] hover:underline"
                >
                  <span>Chỉnh sửa đợt bán</span>
                  <ArrowUpRight className="size-3" />
                </Link>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="workspace-table min-w-[880px]">
                <thead>
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
                <tbody>
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
