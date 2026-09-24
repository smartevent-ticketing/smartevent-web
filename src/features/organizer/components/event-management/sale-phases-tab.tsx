"use client"

import { useState } from "react"
import {
  Calendar,
  Clock,
  Plus,
  AlertCircle,
  AlertTriangle,
  Tag,
  Loader2,
  X,
  Play,
  Pause,
} from "lucide-react"
import type { SalePhaseStatus } from "@/lib/api/event-setup-contract"

export interface SalePhaseItem {
  id: string
  ticketTypeId: string
  name: string
  price: number
  quantity: number
  saleStartAt: string
  saleEndAt: string
  status?: SalePhaseStatus
  maxPerOrder?: number
  maxPerUser?: number
  ticketTypeName?: string
}

export interface SalePhasesTabProps {
  eventId: string
  eventStartTime?: string
  eventEndTime?: string
  salePhases: SalePhaseItem[]
  ticketTypes: Array<{ id: string; name: string }>
  onAddSalePhase: (phase: {
    ticketTypeId: string
    name: string
    price: number
    quantity: number
    saleStartAt: string
    saleEndAt: string
    maxPerOrder?: number
    maxPerUser?: number
  }) => Promise<void>
  onUpdatePhaseStatus: (phaseId: string, newStatus: SalePhaseStatus) => Promise<void>
}

const STATUS_CONFIG: Record<SalePhaseStatus, { label: string; badgeClass: string; desc: string }> =
  {
    DRAFT: {
      label: "Bản nháp",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
      desc: "Chưa kích hoạt, có thể sửa đổi thông tin",
    },
    SCHEDULED: {
      label: "Đã lên lịch",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      desc: "Tự động kích hoạt khi đến giờ mở bán",
    },
    ACTIVE: {
      label: "Đang mở bán",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      desc: "Khách hàng có thể mua vé trực tuyến",
    },
    PAUSED: {
      label: "Tạm dừng",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      desc: "Tạm ngưng nhận đơn hàng mới",
    },
    CLOSED: {
      label: "Đã kết thúc",
      badgeClass: "bg-gray-100 text-gray-500 border-gray-300",
      desc: "Hết hạn mở bán, đã đóng cổng",
    },
    SOLD_OUT: {
      label: "Hết vé",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
      desc: "Toàn bộ vé của đợt này đã được bán",
    },
  }

export function SalePhasesTab({
  eventEndTime,
  salePhases,
  ticketTypes,
  onAddSalePhase,
  onUpdatePhaseStatus,
}: SalePhasesTabProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updatingPhaseId, setUpdatingPhaseId] = useState<string | null>(null)

  // Form State
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState(ticketTypes[0]?.id || "")
  const [name, setName] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [quantity, setQuantity] = useState<number | "">("")
  const [saleStartAt, setSaleStartAt] = useState("")
  const [saleEndAt, setSaleEndAt] = useState("")
  const [maxPerOrder, setMaxPerOrder] = useState<number | "">(4)
  const [maxPerUser, setMaxPerUser] = useState<number | "">("")
  const [formError, setFormError] = useState<string | null>(null)

  // Helper check overlap locally
  const checkOverlap = (
    ticketTypeId: string,
    startIso: string,
    endIso: string,
    excludePhaseId?: string,
  ) => {
    const s = new Date(startIso).getTime()
    const e = new Date(endIso).getTime()
    return salePhases.some((p) => {
      if (p.id === excludePhaseId) return false
      if (p.ticketTypeId !== ticketTypeId) return false
      const ps = new Date(p.saleStartAt).getTime()
      const pe = new Date(p.saleEndAt).getTime()
      return s < pe && e > ps
    })
  }

  // Handle Form Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!selectedTicketTypeId) {
      setFormError("Vui lòng chọn hạng vé áp dụng.")
      return
    }
    if (!name.trim()) {
      setFormError("Vui lòng nhập tên đợt mở bán.")
      return
    }
    const numPrice = Number(price)
    if (isNaN(numPrice) || numPrice < 0) {
      setFormError("Giá vé không hợp lệ.")
      return
    }
    const numQty = Number(quantity)
    if (isNaN(numQty) || numQty <= 0) {
      setFormError("Số lượng vé phải lớn hơn 0.")
      return
    }
    if (!saleStartAt || !saleEndAt) {
      setFormError("Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc.")
      return
    }

    const startDate = new Date(saleStartAt)
    const endDate = new Date(saleEndAt)

    if (startDate.getTime() >= endDate.getTime()) {
      setFormError("Thời gian kết thúc phải sau thời gian bắt đầu mở bán.")
      return
    }

    if (eventEndTime) {
      const eventEnd = new Date(eventEndTime)
      if (endDate.getTime() > eventEnd.getTime()) {
        setFormError(
          `Thời gian kết thúc mở bán (${endDate.toLocaleString("vi-VN")}) không được vượt quá thời gian kết thúc sự kiện (${eventEnd.toLocaleString("vi-VN")}).`,
        )
        return
      }
    }

    if (checkOverlap(selectedTicketTypeId, startDate.toISOString(), endDate.toISOString())) {
      setFormError(
        "Khoảng thời gian mở bán này bị trùng lặp với một đợt mở bán khác của cùng hạng vé.",
      )
      return
    }

    setIsSubmitting(true)
    try {
      await onAddSalePhase({
        ticketTypeId: selectedTicketTypeId,
        name: name.trim(),
        price: numPrice,
        quantity: numQty,
        saleStartAt: startDate.toISOString(),
        saleEndAt: endDate.toISOString(),
        maxPerOrder: Number(maxPerOrder) || 4,
        maxPerUser: maxPerUser ? Number(maxPerUser) : undefined,
      })
      // Reset form
      setName("")
      setPrice("")
      setQuantity("")
      setSaleStartAt("")
      setSaleEndAt("")
      setMaxPerOrder(4)
      setMaxPerUser("")
      setShowAddModal(false)
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Không thể tạo đợt mở bán. Vui lòng kiểm tra lại.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle status transition
  const handleTransition = async (phaseId: string, targetStatus: SalePhaseStatus) => {
    setUpdatingPhaseId(phaseId)
    try {
      await onUpdatePhaseStatus(phaseId, targetStatus)
    } finally {
      setUpdatingPhaseId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-on-surface">Lịch trình & Đợt mở bán</h3>
          <p className="text-xs text-on-surface-variant">
            Cấu hình các giai đoạn mở bán (Early Bird, Standard...), định giá vé và quản lý hạn mức
            mua sắm.
          </p>
        </div>

        <button
          type="button"
          disabled={ticketTypes.length === 0}
          onClick={() => {
            setSelectedTicketTypeId(ticketTypes[0]?.id || "")
            setFormError(null)
            setShowAddModal(true)
          }}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer shadow-xs ${
            ticketTypes.length === 0
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary-hover text-white"
          }`}
          title={
            ticketTypes.length === 0
              ? "Vui lòng tạo ít nhất một hạng vé trước khi thêm đợt bán"
              : "Thêm đợt mở bán mới"
          }
        >
          <Plus className="size-4" />
          <span>Thêm đợt mở bán</span>
        </button>
      </div>

      {ticketTypes.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-800">
          <AlertCircle className="size-4 text-amber-600 shrink-0" />
          <span>
            Bạn chưa có hạng vé nào. Hãy sang tab <strong>&quot;Hạng vé&quot;</strong> để tạo hạng
            vé trước khi cấu hình đợt mở bán.
          </span>
        </div>
      )}

      {/* Sale Phases List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {salePhases.length === 0 ? (
          <div className="col-span-2 bg-white border border-outline-variant/60 rounded-3xl p-12 text-center space-y-3">
            <Calendar className="size-10 text-primary/40 mx-auto" />
            <h4 className="text-sm font-bold text-on-surface">Chưa có đợt mở bán nào</h4>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Hãy tạo đợt mở bán đầu tiên để phân bổ số lượng vé và ấn định giá vé cho từng hạng vé.
            </p>
          </div>
        ) : (
          salePhases.map((phase) => {
            const status = phase.status || "DRAFT"
            const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT

            const isEndAfterEvent =
              eventEndTime && new Date(phase.saleEndAt).getTime() > new Date(eventEndTime).getTime()

            const hasOverlapConflict = checkOverlap(
              phase.ticketTypeId,
              phase.saleStartAt,
              phase.saleEndAt,
              phase.id,
            )

            const isUpdating = updatingPhaseId === phase.id

            return (
              <div
                key={phase.id}
                className="bg-white border border-outline-variant/60 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-4 transition hover:border-outline-variant"
              >
                {/* Header Phase */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                      <Clock className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{phase.name}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Tag className="size-3 text-on-surface-variant" />
                        <span className="text-[11px] text-on-surface-variant font-medium">
                          {phase.ticketTypeName || "Hạng vé"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${statusInfo.badgeClass}`}
                    title={statusInfo.desc}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                {/* Conflict Warnings */}
                {isEndAfterEvent && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-xs text-red-700 flex items-center gap-2">
                    <AlertTriangle className="size-4 shrink-0 text-red-500" />
                    <span>Thời gian kết thúc vượt quá ngày kết thúc của sự kiện!</span>
                  </div>
                )}
                {hasOverlapConflict && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-800 flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0 text-amber-600" />
                    <span>Trùng lặp thời gian với đợt mở bán khác của cùng hạng vé!</span>
                  </div>
                )}

                {/* Details Body */}
                <div className="space-y-2 bg-surface-container-low/60 rounded-2xl p-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Giá vé:</span>
                    <strong className="text-primary font-mono text-sm font-bold">
                      {phase.price?.toLocaleString("vi-VN")} đ
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Số lượng mở bán:</span>
                    <strong className="text-on-surface font-mono">
                      {phase.quantity?.toLocaleString("vi-VN")} vé
                    </strong>
                  </div>
                  <div className="flex justify-between items-center border-t border-outline-variant/40 pt-2">
                    <span className="text-on-surface-variant">Thời gian bắt đầu:</span>
                    <span className="text-on-surface font-mono font-medium">
                      {new Date(phase.saleStartAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Thời gian kết thúc:</span>
                    <span className="text-on-surface font-mono font-medium">
                      {new Date(phase.saleEndAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-outline-variant/40 pt-2">
                    <span className="text-on-surface-variant">Hạn mức mua:</span>
                    <span className="text-on-surface font-medium">
                      Tối đa {phase.maxPerOrder || 4} vé/đơn
                      {phase.maxPerUser ? ` (tổng ${phase.maxPerUser} vé/khách)` : ""}
                    </span>
                  </div>
                </div>

                {/* Actions / State Machine Transition */}
                <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-on-surface-variant">Thao tác:</span>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {isUpdating ? (
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <Loader2 className="size-3.5 animate-spin text-primary" />
                        <span>Đang xử lý...</span>
                      </div>
                    ) : (
                      <>
                        {/* Transitions from DRAFT */}
                        {status === "DRAFT" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleTransition(phase.id, "SCHEDULED")}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
                            >
                              Lên lịch
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTransition(phase.id, "ACTIVE")}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition inline-flex items-center gap-1"
                            >
                              <Play className="size-3" />
                              <span>Mở bán ngay</span>
                            </button>
                          </>
                        )}

                        {/* Transitions from SCHEDULED */}
                        {status === "SCHEDULED" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleTransition(phase.id, "ACTIVE")}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition inline-flex items-center gap-1"
                            >
                              <Play className="size-3" />
                              <span>Kích hoạt</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTransition(phase.id, "CLOSED")}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg border border-slate-300 transition"
                            >
                              Đóng đợt
                            </button>
                          </>
                        )}

                        {/* Transitions from ACTIVE */}
                        {status === "ACTIVE" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleTransition(phase.id, "PAUSED")}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg border border-amber-200 transition inline-flex items-center gap-1"
                            >
                              <Pause className="size-3" />
                              <span>Tạm dừng</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTransition(phase.id, "CLOSED")}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg border border-slate-300 transition"
                            >
                              Đóng cổng
                            </button>
                          </>
                        )}

                        {/* Transitions from PAUSED */}
                        {status === "PAUSED" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleTransition(phase.id, "ACTIVE")}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition inline-flex items-center gap-1"
                            >
                              <Play className="size-3" />
                              <span>Tiếp tục bán</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTransition(phase.id, "CLOSED")}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg border border-slate-300 transition"
                            >
                              Đóng cổng
                            </button>
                          </>
                        )}

                        {/* CLOSED & SOLD_OUT are terminal states */}
                        {(status === "CLOSED" || status === "SOLD_OUT") && (
                          <span className="text-[11px] text-on-surface-variant italic">
                            Đã khóa vĩnh viễn
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal: Thêm đợt mở bán mới */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-outline-variant/60 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Plus className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">Thêm đợt mở bán mới</h4>
                  <p className="text-[11px] text-on-surface-variant">
                    Phân bổ số lượng vé và thiết lập giá vé theo giai đoạn
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 text-red-500 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Chọn Hạng vé */}
              <div className="space-y-1">
                <label className="font-bold text-on-surface">Hạng vé áp dụng *</label>
                <select
                  value={selectedTicketTypeId}
                  onChange={(e) => setSelectedTicketTypeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-white text-on-surface focus:outline-primary"
                  required
                >
                  {ticketTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tên đợt */}
              <div className="space-y-1">
                <label className="font-bold text-on-surface">Tên đợt mở bán *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Early Bird, Đợt 1, Mở bán chính thức..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant text-on-surface focus:outline-primary"
                  required
                />
              </div>

              {/* Giá vé & Số lượng */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Giá vé (VNĐ) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant font-mono text-on-surface focus:outline-primary"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Số lượng vé *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(e.target.value === "" ? "" : Math.max(1, Number(e.target.value)))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant font-mono text-on-surface focus:outline-primary"
                    required
                  />
                </div>
              </div>

              {/* Thời gian bắt đầu & kết thúc */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Thời gian bắt đầu *</label>
                  <input
                    type="datetime-local"
                    value={saleStartAt}
                    onChange={(e) => setSaleStartAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant font-mono text-on-surface focus:outline-primary"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Thời gian kết thúc *</label>
                  <input
                    type="datetime-local"
                    value={saleEndAt}
                    onChange={(e) => setSaleEndAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant font-mono text-on-surface focus:outline-primary"
                    required
                  />
                </div>
              </div>

              {/* Hạn mức mua */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Tối đa mỗi đơn</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={maxPerOrder}
                    onChange={(e) =>
                      setMaxPerOrder(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant font-mono text-on-surface focus:outline-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Tối đa mỗi khách (Tùy chọn)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Không giới hạn"
                    value={maxPerUser}
                    onChange={(e) =>
                      setMaxPerUser(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant font-mono text-on-surface focus:outline-primary"
                  />
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/40">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-outline-variant text-on-surface hover:bg-surface-container font-semibold rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                  <span>{isSubmitting ? "Đang tạo..." : "Lưu đợt mở bán"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
