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
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Pencil,
} from "lucide-react"
import { SalePhaseEditDialog } from "./sale-phase-edit-dialog"
import { CreateSalePhaseDialog } from "./sale-phase-create-dialog"
import { hasSalePhaseOverlap } from "../../model/sale-phase-availability"
import { remainingCapacityForTier } from "../../model/sale-phase-availability"
import { useClock } from "@/hooks/use-clock"
import type { SalePhaseItem } from "../../model/event-management.types"
import type { SalePhaseStatus } from "@/lib/api/event-setup-contract"
import type { SalePhasesTabProps } from "./sale-phase-types"

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
  eventStatus,
  eventStartTime,
  eventEndTime,
  salePhases,
  ticketTypes,
  areas = [],
  onAddSalePhase,
  onUpdatePhaseStatus,
  onDeleteSalePhase,
  onUpdateSalePhase,
  canEditConfig,
}: SalePhasesTabProps) {
  const now = useClock(15000)
  const beforeEventStart = Boolean(eventStartTime && Date.parse(eventStartTime) > now)
  const publishedBeforeStart = eventStatus === "PUBLISHED" && beforeEventStart
  const canCreatePhase = canEditConfig || publishedBeforeStart
  const hasRemainingCapacity = ticketTypes.some(
    (tier) => remainingCapacityForTier(tier.id, ticketTypes, areas, salePhases) > 0,
  )
  const canStartSales = canEditConfig || publishedBeforeStart
  const [showAddModal, setShowAddModal] = useState(false)
  const [updatingPhaseId, setUpdatingPhaseId] = useState<string | null>(null)
  const [deletingPhaseId, setDeletingPhaseId] = useState<string | null>(null)
  const [editingPhase, setEditingPhase] = useState<SalePhaseItem | null>(null)

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

        {canCreatePhase && (
          <button
            type="button"
            disabled={ticketTypes.length === 0 || !hasRemainingCapacity}
            onClick={() => setShowAddModal(true)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer shadow-xs ${
              ticketTypes.length === 0 || !hasRemainingCapacity
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary-hover text-white"
            }`}
            title={
              ticketTypes.length === 0
                ? "Vui lòng tạo ít nhất một hạng vé trước khi thêm đợt bán"
                : !hasRemainingCapacity
                  ? "Đã phân bổ hết sức chứa. Đóng đợt cũ để trả vé chưa bán về kho."
                  : "Thêm đợt mở bán mới cho một hoặc nhiều hạng vé"
            }
          >
            <Plus className="size-4" />
            <span>Thêm đợt mở bán</span>
          </button>
        )}
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
      {publishedBeforeStart && (
        <p className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
          Sự kiện đang mở bán: bạn có thể thêm đợt mới khi còn vé chưa phân bổ. Nếu vé đang nằm
          trong đợt cũ, hãy đóng đợt đó trước; vé đã bán hoặc đang giữ chỗ vẫn được tính vào sức
          chứa.
        </p>
      )}

      {/* Sale Phases List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {salePhases.length === 0 ? (
          <div className="workspace-card col-span-2 space-y-3 p-12 text-center">
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

            const hasOverlapConflict = hasSalePhaseOverlap(
              salePhases,
              phase.ticketTypeId,
              phase.saleStartAt,
              phase.saleEndAt,
              phase.id,
            )

            const isUpdating = updatingPhaseId === phase.id
            const isDeleting = deletingPhaseId === phase.id
            const canDelete =
              (canEditConfig || (publishedBeforeStart && status === "DRAFT")) &&
              Boolean(onDeleteSalePhase) &&
              status !== "ACTIVE" &&
              status !== "SOLD_OUT"

            return (
              <div
                key={phase.id}
                className="workspace-card flex flex-col justify-between gap-4 p-6 transition hover:border-[#d6aaa0]"
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
                    <span className="text-on-surface-variant">Giá vé mở bán:</span>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const matchedType = ticketTypes.find((t) => t.id === phase.ticketTypeId)
                        const basePrice = matchedType?.basePrice || matchedType?.price || 0
                        if (basePrice > phase.price) {
                          const discountPct = Math.round((1 - phase.price / basePrice) * 100)
                          return (
                            <>
                              <span
                                className="line-through text-on-surface-variant font-mono text-xs"
                                title="Giá gốc niêm yết"
                              >
                                {basePrice.toLocaleString("vi-VN")} đ
                              </span>
                              <strong className="text-emerald-700 font-mono text-sm font-bold">
                                {phase.price?.toLocaleString("vi-VN")} đ
                              </strong>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                -{discountPct}%
                              </span>
                            </>
                          )
                        }
                        if (basePrice > 0 && phase.price === basePrice) {
                          return (
                            <>
                              <strong className="text-primary font-mono text-sm font-bold">
                                {phase.price?.toLocaleString("vi-VN")} đ
                              </strong>
                              <span className="text-[10px] text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded font-medium">
                                Giá gốc
                              </span>
                            </>
                          )
                        }
                        return (
                          <strong className="text-primary font-mono text-sm font-bold">
                            {phase.price?.toLocaleString("vi-VN")} đ
                          </strong>
                        )
                      })()}
                    </div>
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
                    {(canEditConfig || (publishedBeforeStart && status === "DRAFT")) && (
                      <button
                        type="button"
                        onClick={() => setEditingPhase(phase)}
                        className="px-2 py-1 text-[11px] font-semibold text-primary bg-primary/10 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Pencil className="size-3" /> Sửa đợt
                      </button>
                    )}
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
                        {status === "DRAFT" && canStartSales && (
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
                            {canStartSales && (
                              <button
                                type="button"
                                onClick={() => handleTransition(phase.id, "DRAFT")}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition inline-flex items-center gap-1 cursor-pointer"
                                title="Thu hồi về bản nháp để chỉnh sửa ngày giờ hoặc số lượng"
                              >
                                <RotateCcw className="size-3" />
                                <span>Thu hồi về nháp</span>
                              </button>
                            )}
                            {canStartSales && (
                              <button
                                type="button"
                                onClick={() => handleTransition(phase.id, "ACTIVE")}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Play className="size-3" />
                                <span>Kích hoạt</span>
                              </button>
                            )}
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
                            {canStartSales && (
                              <button
                                type="button"
                                onClick={() => handleTransition(phase.id, "ACTIVE")}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Play className="size-3" />
                                <span>Tiếp tục bán</span>
                              </button>
                            )}
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
            <strong>Xóa đợt mở bán:</strong> Khi sự kiện đang mở bán, chỉ có thể sửa hoặc xóa đợt
            còn ở trạng thái Nháp trước giờ bắt đầu sự kiện.
          </li>
          <li>
            <strong>Thu hồi lịch hẹn:</strong> Đợt mở bán ở trạng thái &quot;Đã lên lịch&quot; có
            thể bấm <em>&quot;Thu hồi về nháp&quot;</em> trước giờ bắt đầu sự kiện để chỉnh sửa ngày
            giờ hoặc số lượng mà không bị hủy.
          </li>
          <li>
            <strong>Bảo toàn số lượng khi Đóng cổng:</strong> Khi một đợt đóng cổng, số vé chưa bán
            được đưa lại vào sức chứa để tạo đợt tiếp theo. Vé đã bán hoặc đang giữ chỗ vẫn chiếm
            sức chứa.
          </li>
          <li>
            <strong>Tạm dừng bán vé:</strong> Sử dụng trạng thái <em>&quot;Tạm dừng&quot;</em> khi
            cần kiểm tra lại đơn hàng hoặc nghẽn mạng, sau đó bấm <em>&quot;Tiếp tục bán&quot;</em>{" "}
            mà không làm gián đoạn kế hoạch.
          </li>
        </ul>
      </div>

      {/* Modal: Thêm đợt mở bán mới (Hỗ trợ cấu hình nhiều hạng vé cùng lúc) */}
      {editingPhase && (
        <SalePhaseEditDialog
          key={editingPhase.id}
          phase={editingPhase}
          onSave={onUpdateSalePhase}
          onClose={() => setEditingPhase(null)}
        />
      )}
      {showAddModal && (
        <CreateSalePhaseDialog
          eventEndTime={eventEndTime}
          salePhases={salePhases}
          ticketTypes={ticketTypes}
          areas={areas}
          onAddSalePhase={onAddSalePhase}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}
