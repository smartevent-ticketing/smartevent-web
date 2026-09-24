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
  RotateCcw,
  Trash2,
} from "lucide-react"
import type { SalePhaseStatus } from "@/lib/api/event-setup-contract"
import type { SalePhaseItem } from "@/features/organizer/model/event-management.types"
export type { SalePhaseItem }

export interface SalePhasesTabProps {
  eventId: string
  eventStartTime?: string
  eventEndTime?: string
  salePhases: SalePhaseItem[]
  ticketTypes: Array<{
    id: string
    name: string
    areaId?: string
    areaName?: string
    totalQuota?: number
    price?: number
  }>
  areas?: Array<{ id: string; name: string; capacity?: number; type?: string }>
  onAddSalePhase: (
    phase:
      | {
          ticketTypeId: string
          name: string
          price: number
          quantity: number
          saleStartAt: string
          saleEndAt: string
          maxPerOrder?: number
          maxPerUser?: number
        }
      | Array<{
          ticketTypeId: string
          name: string
          price: number
          quantity: number
          saleStartAt: string
          saleEndAt: string
          maxPerOrder?: number
          maxPerUser?: number
        }>,
  ) => Promise<void>
  onUpdatePhaseStatus: (phaseId: string, newStatus: SalePhaseStatus) => Promise<void>
  onDeleteSalePhase?: (phaseId: string) => Promise<void>
}

interface TierPhaseConfig {
  selected: boolean
  price: number | ""
  quantity: number | ""
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
  areas = [],
  onAddSalePhase,
  onUpdatePhaseStatus,
  onDeleteSalePhase,
}: SalePhasesTabProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updatingPhaseId, setUpdatingPhaseId] = useState<string | null>(null)
  const [deletingPhaseId, setDeletingPhaseId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState("")
  const [saleStartAt, setSaleStartAt] = useState("")
  const [saleEndAt, setSaleEndAt] = useState("")
  const [maxTicketsPerCustomer, setMaxTicketsPerCustomer] = useState<number | "">(4)
  const [formError, setFormError] = useState<string | null>(null)

  // Multi-tier configuration state
  const [tierConfigs, setTierConfigs] = useState<Record<string, TierPhaseConfig>>({})

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

  // Open modal and pre-initialize tier configs
  const handleOpenAddModal = () => {
    const initial: Record<string, TierPhaseConfig> = {}
    ticketTypes.forEach((t) => {
      const matchedArea = areas.find((a) => a.id === t.areaId)
      const totalAreaCapacity = matchedArea?.capacity ?? t.totalQuota ?? 0
      const configuredQty = salePhases
        .filter((p) => {
          if (p.status === "CLOSED") return false
          if (p.ticketTypeId === t.id) return true
          const otherType = ticketTypes.find((ot) => ot.id === p.ticketTypeId)
          return Boolean(otherType?.areaId && t.areaId && otherType.areaId === t.areaId)
        })
        .reduce((sum, p) => sum + p.quantity, 0)
      const remaining = Math.max(0, totalAreaCapacity - configuredQty)

      initial[t.id] = {
        selected: true, // Default selected for speed
        price: t.price && t.price > 0 ? t.price : "",
        quantity: remaining > 0 ? Math.min(50, remaining) : "",
      }
    })

    setTierConfigs(initial)
    setName("")
    setSaleStartAt("")
    setSaleEndAt("")
    setMaxTicketsPerCustomer(4)
    setFormError(null)
    setShowAddModal(true)
  }

  // Handle Form Submit (Multi-tier batch creation)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError("Vui lòng nhập tên đợt mở bán.")
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

    // Filter selected ticket types
    const selectedTiers = ticketTypes.filter((t) => tierConfigs[t.id]?.selected)
    if (selectedTiers.length === 0) {
      setFormError("Vui lòng chọn ít nhất một hạng vé để mở bán trong đợt này.")
      return
    }

    // Validate each selected ticket type
    for (const t of selectedTiers) {
      const cfg = tierConfigs[t.id]
      const numPrice = Number(cfg?.price)
      if (isNaN(numPrice) || numPrice < 0) {
        setFormError(`Giá vé của hạng vé "${t.name}" không hợp lệ.`)
        return
      }
      const numQty = Number(cfg?.quantity)
      if (isNaN(numQty) || numQty <= 0) {
        setFormError(`Số lượng vé của hạng vé "${t.name}" phải lớn hơn 0.`)
        return
      }

      // Capacity verification
      const matchedArea = areas.find((a) => a.id === t.areaId)
      const totalAreaCapacity = matchedArea?.capacity ?? t.totalQuota ?? 0
      const configuredQty = salePhases
        .filter((p) => {
          if (p.status === "CLOSED") return false
          if (p.ticketTypeId === t.id) return true
          const otherType = ticketTypes.find((ot) => ot.id === p.ticketTypeId)
          return Boolean(otherType?.areaId && t.areaId && otherType.areaId === t.areaId)
        })
        .reduce((sum, p) => sum + p.quantity, 0)
      const remainingCapacity = Math.max(0, totalAreaCapacity - configuredQty)

      if (totalAreaCapacity > 0 && numQty > remainingCapacity) {
        setFormError(
          `Số lượng vé mở bán của hạng vé "${t.name}" (${numQty.toLocaleString("vi-VN")}) vượt quá số lượng vé còn khả dụng (${remainingCapacity.toLocaleString("vi-VN")} vé). Vui lòng điều chỉnh lại.`,
        )
        return
      }

      if (checkOverlap(t.id, startDate.toISOString(), endDate.toISOString())) {
        setFormError(
          `Khoảng thời gian mở bán của hạng vé "${t.name}" bị trùng lặp với một đợt mở bán khác của cùng hạng vé.`,
        )
        return
      }
    }

    const customerLimit = Number(maxTicketsPerCustomer) || 4

    const phasesToCreate = selectedTiers.map((t) => ({
      ticketTypeId: t.id,
      name: name.trim(),
      price: Number(tierConfigs[t.id]?.price || 0),
      quantity: Number(tierConfigs[t.id]?.quantity || 0),
      saleStartAt: startDate.toISOString(),
      saleEndAt: endDate.toISOString(),
      maxPerOrder: customerLimit,
      maxPerUser: customerLimit,
    }))

    setIsSubmitting(true)
    try {
      await onAddSalePhase(phasesToCreate)
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

  // Handle delete phase
  const handleDeletePhase = async (phase: SalePhaseItem) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa đợt mở bán "${phase.name}"?\nToàn bộ ${phase.quantity.toLocaleString(
          "vi-VN",
        )} vé sẽ được hoàn trả về sức chứa khán đài.`,
      )
    ) {
      return
    }

    setDeletingPhaseId(phase.id)
    try {
      if (onDeleteSalePhase) {
        await onDeleteSalePhase(phase.id)
      }
    } finally {
      setDeletingPhaseId(null)
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
          onClick={handleOpenAddModal}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer shadow-xs ${
            ticketTypes.length === 0
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary-hover text-white"
          }`}
          title={
            ticketTypes.length === 0
              ? "Vui lòng tạo ít nhất một hạng vé trước khi thêm đợt bán"
              : "Thêm đợt mở bán mới cho một hoặc nhiều hạng vé"
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
              Hãy tạo đợt mở bán đầu tiên để phân bổ số lượng vé và ấn định giá vé cho các hạng vé.
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
            const isDeleting = deletingPhaseId === phase.id
            const canDelete =
              Boolean(onDeleteSalePhase) && status !== "ACTIVE" && status !== "SOLD_OUT"

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
                    <span className="text-on-surface-variant">Giới hạn mua:</span>
                    <span className="text-on-surface font-medium">
                      Tối đa {phase.maxPerUser || phase.maxPerOrder || 4} vé / khách
                    </span>
                  </div>
                </div>

                {/* Actions / State Machine Transition */}
                <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-on-surface-variant">Thao tác:</span>
                    {canDelete && (
                      <button
                        type="button"
                        disabled={isDeleting || isUpdating}
                        onClick={() => handleDeletePhase(phase)}
                        className="px-2 py-1 text-[11px] font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Xóa đợt mở bán này và hoàn trả vé về khán đài"
                      >
                        {isDeleting ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Trash2 className="size-3" />
                        )}
                        <span>{isDeleting ? "Đang xóa..." : "Xóa đợt"}</span>
                      </button>
                    )}
                  </div>

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
                              className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition cursor-pointer"
                            >
                              Lên lịch
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTransition(phase.id, "ACTIVE")}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition inline-flex items-center gap-1 cursor-pointer"
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
                              onClick={() => handleTransition(phase.id, "DRAFT")}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition inline-flex items-center gap-1 cursor-pointer"
                              title="Thu hồi về bản nháp để chỉnh sửa ngày giờ hoặc số lượng"
                            >
                              <RotateCcw className="size-3" />
                              <span>Thu hồi về nháp</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTransition(phase.id, "ACTIVE")}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="size-3" />
                              <span>Kích hoạt</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTransition(phase.id, "CLOSED")}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg border border-slate-300 transition cursor-pointer"
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
                              className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg border border-amber-200 transition inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Pause className="size-3" />
                              <span>Tạm dừng</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTransition(phase.id, "CLOSED")}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg border border-slate-300 transition cursor-pointer"
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
                              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="size-3" />
                              <span>Tiếp tục bán</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTransition(phase.id, "CLOSED")}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg border border-slate-300 transition cursor-pointer"
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

      {/* Hướng dẫn nghiệp vụ vòng đời & số lượng vé */}
      <div className="bg-surface-container-low/70 border border-outline-variant/60 rounded-2xl p-4 text-xs text-on-surface-variant space-y-2">
        <div className="flex items-center gap-2 font-bold text-on-surface text-[13px]">
          <span>💡</span>
          <span>Quy tắc vòng đời &amp; Bảo toàn số lượng vé</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] list-disc list-inside text-on-surface-variant leading-relaxed">
          <li>
            <strong>Xóa đợt mở bán:</strong> Các đợt mở bán ở trạng thái Nháp, Đã lên lịch, Tạm dừng
            hoặc Đã kết thúc đều có thể xóa. Khi xóa, toàn bộ số vé sẽ được trả lại sức chứa khán
            đài.
          </li>
          <li>
            <strong>Thu hồi lịch hẹn:</strong> Đợt mở bán ở trạng thái &quot;Đã lên lịch&quot; có
            thể bấm <em>&quot;Thu hồi về nháp&quot;</em> bất cứ lúc nào để chỉnh sửa lại ngày giờ
            hoặc số lượng mà không bị hủy.
          </li>
          <li>
            <strong>Bảo toàn số lượng khi Đóng cổng:</strong> Khi một đợt đóng cổng, số vé chưa bán
            không hề bị mất. Hệ thống tự động hoàn lại hạn ngạch vé chưa bán về sức chứa khán đài để
            bạn tạo đợt mở bán tiếp theo.
          </li>
          <li>
            <strong>Tạm dừng bán vé:</strong> Sử dụng trạng thái <em>&quot;Tạm dừng&quot;</em> khi
            cần kiểm tra lại đơn hàng hoặc nghẽn mạng, sau đó bấm <em>&quot;Tiếp tục bán&quot;</em>{" "}
            mà không làm gián đoạn kế hoạch.
          </li>
        </ul>
      </div>

      {/* Modal: Thêm đợt mở bán mới (Hỗ trợ cấu hình nhiều hạng vé cùng lúc) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-outline-variant/60 shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Plus className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">Thêm đợt mở bán mới</h4>
                  <p className="text-[11px] text-on-surface-variant">
                    Thiết lập chiến dịch bán vé và áp dụng cho một hoặc nhiều hạng vé cùng lúc
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
              {/* 1. Tên đợt mở bán */}
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
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span className="text-[10px] text-on-surface-variant">Gợi ý:</span>
                  {[
                    "Early Bird",
                    "Mở bán đợt 1",
                    "Mở bán chính thức",
                    "Chót giờ (Last Minute)",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setName(preset)}
                      className="px-2 py-0.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-[10px] font-medium transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Thời gian bắt đầu & kết thúc */}
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

              {/* 3. Hạn mức mua tối đa mỗi khách */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-on-surface">
                    Số vé tối đa mỗi khách được mua *
                  </label>
                  <span className="text-[10px] text-on-surface-variant font-normal">
                    (Giới hạn trên 1 tài khoản)
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={maxTicketsPerCustomer}
                  onChange={(e) =>
                    setMaxTicketsPerCustomer(
                      e.target.value === "" ? "" : Math.max(1, Number(e.target.value)),
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant font-mono text-on-surface focus:outline-primary"
                  placeholder="4"
                  required
                />
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-on-surface-variant">Chọn nhanh:</span>
                  {[2, 4, 6, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMaxTicketsPerCustomer(num)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium transition cursor-pointer ${
                        maxTicketsPerCustomer === num
                          ? "bg-primary text-white"
                          : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                      }`}
                    >
                      {num} vé
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Danh sách chọn các hạng vé mở bán trong đợt này */}
              <div className="space-y-2 pt-2 border-t border-outline-variant/40">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-on-surface">
                    Các hạng vé mở bán trong đợt này *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const allSelected = ticketTypes.every((t) => tierConfigs[t.id]?.selected)
                      const updated: Record<string, TierPhaseConfig> = {}
                      ticketTypes.forEach((t) => {
                        if (tierConfigs[t.id]) {
                          updated[t.id] = { ...tierConfigs[t.id], selected: !allSelected }
                        }
                      })
                      setTierConfigs(updated)
                    }}
                    className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                  >
                    {ticketTypes.every((t) => tierConfigs[t.id]?.selected)
                      ? "Bỏ chọn tất cả"
                      : "Chọn tất cả"}
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {ticketTypes.map((t) => {
                    const cfg = tierConfigs[t.id] || { selected: false, price: "", quantity: "" }
                    const matchedArea = areas.find((a) => a.id === t.areaId)
                    const totalAreaCapacity = matchedArea?.capacity ?? t.totalQuota ?? 0
                    const configuredQty = salePhases
                      .filter((p) => {
                        if (p.status === "CLOSED") return false
                        if (p.ticketTypeId === t.id) return true
                        const otherType = ticketTypes.find((ot) => ot.id === p.ticketTypeId)
                        return Boolean(
                          otherType?.areaId && t.areaId && otherType.areaId === t.areaId,
                        )
                      })
                      .reduce((sum, p) => sum + p.quantity, 0)
                    const remainingCapacity = Math.max(0, totalAreaCapacity - configuredQty)
                    const basePrice = t.price || 0

                    return (
                      <div
                        key={t.id}
                        className={`border rounded-2xl p-3 transition ${
                          cfg.selected
                            ? "border-primary/50 bg-white shadow-2xs"
                            : "border-outline-variant/60 bg-surface-container-low/40 opacity-70"
                        }`}
                      >
                        {/* Checkbox & Tiêu đề Hạng vé */}
                        <div className="flex items-start justify-between gap-3">
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={cfg.selected}
                              onChange={(e) => {
                                setTierConfigs((prev) => ({
                                  ...prev,
                                  [t.id]: { ...cfg, selected: e.target.checked },
                                }))
                              }}
                              className="size-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                            />
                            <div>
                              <span className="font-bold text-on-surface text-xs block">
                                {t.name}
                              </span>
                              <span className="text-[11px] text-on-surface-variant font-medium">
                                {matchedArea?.name || t.areaName || "Khán đài"} (
                                {totalAreaCapacity.toLocaleString("vi-VN")} chỗ)
                              </span>
                            </div>
                          </label>

                          <span className="text-[11px] font-mono text-primary font-bold">
                            Khả dụng: {remainingCapacity.toLocaleString("vi-VN")} vé
                          </span>
                        </div>

                        {/* Chi tiết Giá vé & Số lượng khi được chọn */}
                        {cfg.selected && (
                          <div className="mt-2.5 pt-2.5 border-t border-outline-variant/40 space-y-2.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Giá vé */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-[11px] font-bold text-on-surface">
                                    Giá vé (VNĐ) *
                                  </label>
                                  {basePrice > 0 && (
                                    <span className="text-[10px] text-on-surface-variant">
                                      Gốc: {basePrice.toLocaleString("vi-VN")} ₫
                                    </span>
                                  )}
                                </div>
                                <input
                                  type="number"
                                  min="0"
                                  step="1000"
                                  placeholder="0"
                                  value={cfg.price}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === ""
                                        ? ""
                                        : Math.max(0, Number(e.target.value))
                                    setTierConfigs((prev) => ({
                                      ...prev,
                                      [t.id]: { ...cfg, price: val },
                                    }))
                                  }}
                                  className="w-full px-3 py-1.5 rounded-xl border border-outline-variant font-mono text-xs font-bold text-on-surface focus:outline-primary"
                                  required
                                />

                                {/* Nút chiết khấu nhanh */}
                                {basePrice > 0 && (
                                  <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setTierConfigs((prev) => ({
                                          ...prev,
                                          [t.id]: { ...cfg, price: basePrice },
                                        }))
                                      }
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                                        cfg.price === basePrice
                                          ? "bg-primary text-white"
                                          : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                                      }`}
                                    >
                                      Giá gốc
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setTierConfigs((prev) => ({
                                          ...prev,
                                          [t.id]: {
                                            ...cfg,
                                            price: Math.round((basePrice * 0.95) / 1000) * 1000,
                                          },
                                        }))
                                      }
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                                        cfg.price === Math.round((basePrice * 0.95) / 1000) * 1000
                                          ? "bg-emerald-600 text-white"
                                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                                      }`}
                                    >
                                      -5%
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setTierConfigs((prev) => ({
                                          ...prev,
                                          [t.id]: {
                                            ...cfg,
                                            price: Math.round((basePrice * 0.9) / 1000) * 1000,
                                          },
                                        }))
                                      }
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                                        cfg.price === Math.round((basePrice * 0.9) / 1000) * 1000
                                          ? "bg-emerald-600 text-white"
                                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                                      }`}
                                    >
                                      -10%
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setTierConfigs((prev) => ({
                                          ...prev,
                                          [t.id]: {
                                            ...cfg,
                                            price: Math.round((basePrice * 0.85) / 1000) * 1000,
                                          },
                                        }))
                                      }
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                                        cfg.price === Math.round((basePrice * 0.85) / 1000) * 1000
                                          ? "bg-emerald-600 text-white"
                                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                                      }`}
                                    >
                                      -15%
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Số lượng vé */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-[11px] font-bold text-on-surface">
                                    Số lượng vé *
                                  </label>
                                  {remainingCapacity > 0 && (
                                    <span className="text-[10px] text-primary font-semibold">
                                      Tối đa {remainingCapacity.toLocaleString("vi-VN")}
                                    </span>
                                  )}
                                </div>
                                <input
                                  type="number"
                                  min="1"
                                  max={remainingCapacity > 0 ? remainingCapacity : undefined}
                                  placeholder={
                                    remainingCapacity > 0 ? `Tối đa ${remainingCapacity}` : "100"
                                  }
                                  value={cfg.quantity}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === ""
                                        ? ""
                                        : Math.max(1, Number(e.target.value))
                                    setTierConfigs((prev) => ({
                                      ...prev,
                                      [t.id]: { ...cfg, quantity: val },
                                    }))
                                  }}
                                  className="w-full px-3 py-1.5 rounded-xl border border-outline-variant font-mono text-xs text-on-surface focus:outline-primary"
                                  required
                                />

                                {/* Chọn nhanh số lượng */}
                                {remainingCapacity > 0 && (
                                  <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                                    {remainingCapacity >= 50 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setTierConfigs((prev) => ({
                                            ...prev,
                                            [t.id]: { ...cfg, quantity: 50 },
                                          }))
                                        }
                                        className="px-1.5 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-[10px] font-mono font-medium transition cursor-pointer"
                                      >
                                        50 vé
                                      </button>
                                    )}
                                    {remainingCapacity >= 100 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setTierConfigs((prev) => ({
                                            ...prev,
                                            [t.id]: { ...cfg, quantity: 100 },
                                          }))
                                        }
                                        className="px-1.5 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-[10px] font-mono font-medium transition cursor-pointer"
                                      >
                                        100 vé
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setTierConfigs((prev) => ({
                                          ...prev,
                                          [t.id]: { ...cfg, quantity: remainingCapacity },
                                        }))
                                      }
                                      className="px-1.5 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-mono font-bold transition cursor-pointer"
                                    >
                                      Toàn bộ ({remainingCapacity} vé)
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
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
