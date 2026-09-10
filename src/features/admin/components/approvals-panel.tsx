"use client"

import { useState } from "react"
import { Clock, Eye, Info } from "lucide-react"
import { ActionFeedback } from "@/components/shared/action-feedback"
import { useAdminApprovals } from "@/features/admin/hooks/use-approvals"
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
    pendingEvents,
    handleApprove,
    handleReject,
  } = useAdminApprovals()

  const [selectedEventForDetail, setSelectedEventForDetail] = useState<any | null>(null)
  const [eventToApprove, setEventToApprove] = useState<any | null>(null)
  const [eventToReject, setEventToReject] = useState<any | null>(null)

  const onConfirmApprove = async () => {
    if (!eventToApprove) return
    await handleApprove(eventToApprove.id)
    setEventToApprove(null)
    setSelectedEventForDetail(null)
  }

  const onConfirmReject = async (reason: string) => {
    if (!eventToReject) return
    await handleReject(eventToReject.id)
    setEventToReject(null)
    setSelectedEventForDetail(null)
  }

  return (
    <div className="space-y-6">
      <ActionFeedback message={notification} onDismiss={() => setNotification(null)} />
      <div className="space-y-6">
        {/* Cảnh báo phụ thuộc API backend B1/B2 */}
        <div className="bg-blue-50/70 border border-blue-200/80 p-5 rounded-3xl flex items-start gap-3.5 text-xs sm:text-sm text-blue-900 shadow-xs">
          <Info className="size-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">
              Trạng thái tích hợp API Phê duyệt (Backend B1, B2)
            </span>
            <p className="leading-relaxed text-blue-800">
              Endpoint <code>GET /api/v1/events</code> hiện chỉ trả sự kiện <code>PUBLISHED</code>.
              Đang chờ phía backend hoàn tất API riêng cho danh sách sự kiện chờ duyệt kèm phân
              quyền quản trị viên. Dưới đây là màn hình xử lý phê duyệt trực tiếp và dữ liệu mẫu
              kiểm thử.
            </p>
          </div>
        </div>

        {/* Phê duyệt trực tiếp bằng UUID Event */}
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-on-surface">
            Duyệt trực tiếp sự kiện theo Event ID (UUID)
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={customEventIdToApprove}
              onChange={(e) => setCustomEventIdToApprove(e.target.value)}
              placeholder="Nhập Event UUID (ví dụ: b88f98aa-f3fa-4ce2-bdfa-129424...)"
              className="flex-1 px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs font-mono"
            />
            <button
              type="button"
              onClick={() =>
                setEventToApprove({ id: customEventIdToApprove, name: customEventIdToApprove })
              }
              disabled={!customEventIdToApprove || isApproving}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {isApproving ? "Đang duyệt..." : "Phê duyệt (Publish)"}
            </button>
            <button
              type="button"
              onClick={() =>
                setEventToReject({ id: customEventIdToApprove, name: customEventIdToApprove })
              }
              disabled={!customEventIdToApprove || isRejecting}
              className="px-5 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {isRejecting ? "Đang từ chối..." : "Từ chối (Draft)"}
            </button>
          </div>
        </div>

        {/* Danh sách sự kiện chờ duyệt */}
        <div className="space-y-4">
          {pendingEvents.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-outline-variant/60 shadow-xs text-center space-y-2">
              <Clock className="size-8 text-on-surface-variant/40 mx-auto" />
              <h4 className="text-sm font-bold text-on-surface">
                Không có sự kiện nào trong danh sách chờ duyệt
              </h4>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                Ban tổ chức khi tạo sự kiện sẽ gửi yêu cầu duyệt. Bạn có thể nhập trực tiếp Event ID
                vào ô phía trên để thao tác phê duyệt hoặc từ chối.
              </p>
            </div>
          ) : (
            pendingEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {ev.id}
                    </span>
                    <h4 className="text-base font-bold text-on-surface">{ev.name}</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    BTC: <strong>{ev.organizer}</strong> • Địa điểm: {ev.venue} • Ngày nộp:{" "}
                    {ev.submittedDate}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Quy mô: <strong>{ev.expectedTickets.toLocaleString("vi-VN")} vé</strong> • Giá
                    vé: {ev.priceRange}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEventForDetail(ev)}
                    className="px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Eye className="size-3.5 text-primary" />
                    <span>Xem hồ sơ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEventToApprove(ev)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                  >
                    Phê duyệt
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventToReject(ev)}
                    className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      {selectedEventForDetail && (
        <ApprovalDetailDialog
          event={selectedEventForDetail}
          isOpen={Boolean(selectedEventForDetail)}
          onClose={() => setSelectedEventForDetail(null)}
          onApprove={(ev) => setEventToApprove(ev)}
          onReject={(ev) => setEventToReject(ev)}
        />
      )}

      {/* Confirmation Modals */}
      {eventToApprove && (
        <ApproveConfirmationModal
          eventName={eventToApprove.name || eventToApprove.id}
          isOpen={Boolean(eventToApprove)}
          isApproving={isApproving}
          onConfirm={onConfirmApprove}
          onClose={() => setEventToApprove(null)}
        />
      )}

      {eventToReject && (
        <RejectModal
          eventName={eventToReject.name || eventToReject.id}
          isOpen={Boolean(eventToReject)}
          isRejecting={isRejecting}
          onConfirm={onConfirmReject}
          onClose={() => setEventToReject(null)}
        />
      )}
    </div>
  )
}
