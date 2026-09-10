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
  const [reason, setReason] = useState("Lý do bất khả kháng từ Ban tổ chức")

  if (!isOpen) return null

  const handleConfirm = async () => {
    await onConfirm(reason)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border border-red-100">
        <div className="size-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
          <AlertTriangle className="size-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-on-surface">Xác nhận hủy sự kiện?</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Bạn đang chuẩn bị hủy sự kiện <strong>&ldquo;{eventName}&rdquo;</strong>. Thao tác này
            sẽ đóng cổng bán vé ngay lập tức.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant">Lý do hủy sự kiện</label>
          <textarea
            rows={3}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do chi tiết..."
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs resize-none"
          />
        </div>

        <div className="p-3 bg-red-50/70 rounded-xl border border-red-200/60 text-[11px] text-red-900 leading-relaxed">
          <strong>Lưu ý quan trọng:</strong> Đối với các đơn hàng đã thanh toán, hệ thống sẽ ngừng
          nhận thêm thanh toán mới và chuyển trạng thái để đối soát hoàn tiền theo quy định.
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition cursor-pointer"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isCancelling || !reason.trim()}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
          >
            {isCancelling && <Loader2 className="size-3.5 animate-spin" />}
            <span>Xác nhận hủy sự kiện</span>
          </button>
        </div>
      </div>
    </div>
  )
}
