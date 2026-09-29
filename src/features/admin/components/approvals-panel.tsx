"use client"

import { useState } from "react"
import { CalendarDays, Clock, Eye, MapPin, Search } from "lucide-react"
import { ActionFeedback } from "@/components/shared/action-feedback"
import { useAdminApprovals, type ApprovalDossier } from "@/features/admin/hooks/use-approvals"
import { ApprovalDetailDialog } from "@/features/admin/components/approval-detail-dialog"
import {
  ApproveConfirmationModal,
  RejectModal,
} from "@/features/admin/components/approval-action-modals"

export function AdminApprovalsPanel() {
  const {
    notification,
    setNotification,
    customEventIdToApprove,
    setCustomEventIdToApprove,
    isApproving,
    isRejecting,
    isLoading,
    isLoadingDetail,
    pendingEvents,
    page,
    setPage,
    totalPages,
    totalElements,
    handleApprove,
    handleReject,
    loadDossier,
  } = useAdminApprovals()

  const [selectedDossier, setSelectedDossier] = useState<ApprovalDossier | null>(null)
  const [eventToApprove, setEventToApprove] = useState<ApprovalDossier | null>(null)
  const [eventToReject, setEventToReject] = useState<ApprovalDossier | null>(null)

  const openDossier = async (id: string) => {
    const dossier = await loadDossier(id.trim())
    if (dossier) setSelectedDossier(dossier)
  }

  const onConfirmApprove = async () => {
    if (!eventToApprove?.event.id) return
    if (await handleApprove(eventToApprove.event.id)) {
      setEventToApprove(null)
      setSelectedDossier(null)
    }
  }

  const onConfirmReject = async (reason: string) => {
    if (!eventToReject?.event.id) return
    if (await handleReject(eventToReject.event.id, reason)) {
      setEventToReject(null)
      setSelectedDossier(null)
    }
  }

  return (
    <div className="space-y-6">
      <ActionFeedback message={notification} onDismiss={() => setNotification(null)} />
      <div className="admin-card space-y-4 p-5 sm:p-7">
        <div>
          <p className="admin-kicker">Tra cứu nhanh</p>
          <h2 className="mt-1 text-lg font-extrabold">Mở hồ sơ bằng mã sự kiện</h2>
          <p className="mt-1 text-sm text-[#756d77]">
            Dán mã sự kiện nếu hồ sơ chưa xuất hiện trong danh sách bên dưới.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            aria-label="Event ID"
            value={customEventIdToApprove}
            onChange={(event) => setCustomEventIdToApprove(event.target.value)}
            placeholder="Nhập Event UUID"
            className="admin-input min-w-0 flex-1 font-mono"
          />
          <button
            type="button"
            onClick={() => void openDossier(customEventIdToApprove)}
            disabled={!customEventIdToApprove.trim() || isLoadingDetail}
            className="admin-primary-button"
          >
            <Search className="size-4" />
            {isLoadingDetail ? "Đang tải hồ sơ..." : "Xem hồ sơ"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="admin-kicker">Hàng chờ phê duyệt</p>
            <h2 className="mt-1 text-xl font-extrabold">Sự kiện chờ duyệt ({totalElements})</h2>
          </div>
          {isLoading && (
            <span role="status" className="text-xs">
              Đang tải...
            </span>
          )}
        </div>
        {!isLoading && pendingEvents.length === 0 ? (
          <div className="admin-card space-y-2 p-12 text-center">
            <Clock className="size-8 text-on-surface-variant/40 mx-auto" />
            <p className="text-sm font-bold">Không có sự kiện nào trong trang này</p>
          </div>
        ) : (
          pendingEvents.map((event) => (
            <div
              key={event.id}
              className="admin-card flex flex-col justify-between gap-5 p-5 transition hover:border-[#d6aaa0] sm:flex-row sm:items-center sm:p-6"
            >
              <div className="min-w-0 space-y-2">
                <span className="inline-flex rounded-full bg-[#fff1e9] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#ad573f]">
                  Chờ kiểm tra
                </span>
                <h3 className="text-base font-extrabold text-[#251f29] sm:text-lg">
                  {event.name || "Sự kiện chưa đặt tên"}
                </h3>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#756d77]">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-[#bd443a]" />
                    {event.venue?.name || "Chưa chọn địa điểm"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 text-[#bd443a]" />
                    {event.startTime
                      ? new Date(event.startTime).toLocaleString("vi-VN")
                      : "Chưa thiết lập thời gian"}
                  </span>
                </div>
                <p className="break-all font-mono text-[11px] text-[#9b8f96]">ID: {event.id}</p>
              </div>
              <button
                type="button"
                onClick={() => event.id && void openDossier(event.id)}
                disabled={isLoadingDetail}
                className="admin-secondary-button shrink-0"
              >
                <Eye className="size-4 text-[#bd443a]" /> Xem hồ sơ
              </button>
            </div>
          ))
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 text-sm">
            <button
              type="button"
              disabled={page === 0 || isLoading}
              onClick={() => setPage(page - 1)}
              className="admin-secondary-button"
            >
              Trang trước
            </button>
            <span className="text-xs font-bold text-[#756d77]">
              Trang {page + 1}/{totalPages}
            </span>
            <button
              type="button"
              disabled={page + 1 >= totalPages || isLoading}
              onClick={() => setPage(page + 1)}
              className="admin-secondary-button"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>

      <ApprovalDetailDialog
        dossier={selectedDossier}
        onClose={() => setSelectedDossier(null)}
        onApprove={setEventToApprove}
        onReject={setEventToReject}
      />
      {eventToApprove && (
        <ApproveConfirmationModal
          eventName={eventToApprove.event.name || eventToApprove.event.id || "sự kiện"}
          isOpen
          isApproving={isApproving}
          onConfirm={onConfirmApprove}
          onClose={() => setEventToApprove(null)}
        />
      )}
      {eventToReject && (
        <RejectModal
          eventName={eventToReject.event.name || eventToReject.event.id || "sự kiện"}
          isOpen
          isRejecting={isRejecting}
          onConfirm={onConfirmReject}
          onClose={() => setEventToReject(null)}
        />
      )}
    </div>
  )
}
