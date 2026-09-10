"use client"

import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react"

interface SubmitConfirmationModalProps {
  eventName: string
  isOpen: boolean
  isSubmitting: boolean
  onConfirm: () => Promise<void>
  onClose: () => void
}

export function SubmitConfirmationModal({
  eventName,
  isOpen,
  isSubmitting,
  onConfirm,
  onClose,
}: SubmitConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
        <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Send className="size-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-on-surface">Gửi duyệt sự kiện lên Ban quản trị?</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Sự kiện <strong>&ldquo;{eventName}&rdquo;</strong> sẽ được gửi tới Quản trị viên để kiểm
            duyệt hồ sơ và sơ đồ vé trước khi xuất bản chính thức.
          </p>
        </div>

        {/* Verification Checklist */}
        <div className="bg-surface-container-low rounded-2xl p-4 space-y-2.5 text-xs">
          <span className="font-bold text-on-surface block">Kiểm tra trước khi gửi:</span>
          <div className="flex items-center gap-2 text-on-surface">
            <CheckCircle2 className="size-4 text-primary shrink-0" />
            <span>Đã hoàn tất cấu hình thời gian và địa điểm tổ chức</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface">
            <CheckCircle2 className="size-4 text-primary shrink-0" />
            <span>Đã thiết lập ít nhất 01 phân khu và 01 hạng vé</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface">
            <CheckCircle2 className="size-4 text-primary shrink-0" />
            <span>Đã xác nhận thời gian mở cổng bán vé</span>
          </div>
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 flex items-start gap-2 text-[11px] text-amber-900">
          <AlertCircle className="size-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            Sau khi gửi duyệt, bạn sẽ không thể thay đổi thông tin cơ bản cho đến khi Admin có phản
            hồi phê duyệt hoặc từ chối.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition cursor-pointer"
          >
            Quay lại kiểm tra
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
          >
            {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
            <span>Xác nhận gửi duyệt</span>
          </button>
        </div>
      </div>
    </div>
  )
}
