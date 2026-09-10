"use client"

import { useState } from "react"
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"

interface ApproveConfirmationModalProps {
  eventName: string
  isOpen: boolean
  isApproving: boolean
  onConfirm: () => Promise<void>
  onClose: () => void
}

export function ApproveConfirmationModal({
  eventName,
  isOpen,
  isApproving,
  onConfirm,
  onClose,
}: ApproveConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
        <div className="size-12 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center">
          <CheckCircle2 className="size-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-on-surface">Phê duyệt & Xuất bản sự kiện?</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Bạn đang phê duyệt sự kiện <strong>&ldquo;{eventName}&rdquo;</strong>. Trạng thái sự
            kiện sẽ chuyển thành <code>PUBLISHED</code>.
          </p>
        </div>

        <div className="p-3.5 bg-green-50/70 rounded-2xl border border-green-200/60 text-xs text-green-950 leading-relaxed">
          <strong>Thông báo hệ thống:</strong> Sự kiện sẽ xuất hiện ngay lập tức trên trang chủ và
          danh mục sự kiện công khai để khách hàng có thể đặt chỗ và mua vé.
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isApproving}
            className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition cursor-pointer"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isApproving}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
          >
            {isApproving && <Loader2 className="size-3.5 animate-spin" />}
            <span>Xác nhận phê duyệt</span>
          </button>
        </div>
      </div>
    </div>
  )
}

interface RejectModalProps {
  eventName: string
  isOpen: boolean
  isRejecting: boolean
  onConfirm: (reason: string) => Promise<void>
  onClose: () => void
}

export function RejectModal({
  eventName,
  isOpen,
  isRejecting,
  onConfirm,
  onClose,
}: RejectModalProps) {
  const [reason, setReason] = useState("Hồ sơ thiếu giấy phép hoặc sơ đồ phân khu chưa hợp lệ")

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
          <h3 className="text-lg font-bold text-on-surface">Từ chối duyệt sự kiện?</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Sự kiện <strong>&ldquo;{eventName}&rdquo;</strong> sẽ được đưa trở lại trạng thái{" "}
            <code>DRAFT</code> để Ban tổ chức bổ sung thông tin.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant">Lý do từ chối</label>
          <textarea
            rows={3}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do chi tiết..."
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs resize-none"
          />
        </div>

        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
          Ban tổ chức sẽ nhận được thông báo để cập nhật lại hồ sơ trước khi gửi duyệt lại.
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isRejecting}
            className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition cursor-pointer"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isRejecting || !reason.trim()}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
          >
            {isRejecting && <Loader2 className="size-3.5 animate-spin" />}
            <span>Xác nhận từ chối</span>
          </button>
        </div>
      </div>
    </div>
  )
}
