"use client"

import { useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"

interface CancelEventModalProps {
  eventName: string
  isOpen: boolean
  isCancelling: boolean
  onConfirm: (reason: string) => Promise<void>
  onClose: () => void
}

export function CancelEventModal({
  eventName,
  isOpen,
  isCancelling,
  onConfirm,
  onClose,
}: CancelEventModalProps) {
  const [reason, setReason] = useState("")

  if (!isOpen) return null

  const handleConfirm = async () => {
    await onConfirm(reason)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171420]/75 p-4 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancel-event-title"
        className="w-full max-w-md space-y-5 rounded-[28px] border border-[#e8ded8] bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="size-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
          <AlertTriangle className="size-6" />
        </div>

        <div className="space-y-1.5">
          <h2 id="cancel-event-title" className="text-lg font-extrabold text-[#251f29]">
            Xác nhận hủy sự kiện?
          </h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Bạn đang chuẩn bị hủy sự kiện <strong>&ldquo;{eventName}&rdquo;</strong>. Thao tác này
            sẽ đóng cổng bán vé ngay lập tức.
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="cancel-event-reason"
            className="text-xs font-semibold text-on-surface-variant"
          >
            Lý do hủy sự kiện
          </label>
          <textarea
            id="cancel-event-reason"
            rows={3}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do chi tiết..."
            className="workspace-input resize-none"
          />
        </div>

        <div className="p-3 bg-red-50/70 rounded-xl border border-red-200/60 text-[11px] text-red-900 leading-relaxed">
          <strong>Lưu ý quan trọng:</strong> Đối với các đơn hàng đã thanh toán, hệ thống sẽ ngừng
          nhận thêm thanh toán mới. Những trường hợp cần hoàn tiền sẽ được Admin kiểm tra và cập
          nhật thủ công.
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            className="workspace-secondary-button"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isCancelling || !reason.trim()}
            className="workspace-primary-button !bg-[#b7474f] hover:!bg-[#9d3640]"
          >
            {isCancelling && <Loader2 className="size-3.5 animate-spin" />}
            <span>Xác nhận hủy sự kiện</span>
          </button>
        </div>
      </div>
    </div>
  )
}
