"use client"

import { AlertTriangle, Loader2 } from "lucide-react"

interface CancelOrderDialogProps {
  orderCode: string
  isOpen: boolean
  isCancelling: boolean
  onConfirm: () => Promise<void>
  onClose: () => void
}

export function CancelOrderDialog({
  orderCode,
  isOpen,
  isCancelling,
  onConfirm,
  onClose,
}: CancelOrderDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border border-red-100">
        <div className="size-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
          <AlertTriangle className="size-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-on-surface">Hủy đơn hàng #{orderCode}?</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Bạn có chắc chắn muốn hủy đơn hàng này không? Các vị trí ghế hoặc vé đang giữ chỗ sẽ lập
            tức được hoàn trả về kho vé cho khách hàng khác.
          </p>
        </div>

        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
          <strong>Lưu ý:</strong> Thao tác hủy đơn hàng không thể hoàn tác. Nếu muốn mua lại, bạn sẽ
          cần thực hiện đặt vé lại từ đầu theo tình trạng vé khả dụng thực tế.
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition cursor-pointer"
          >
            Không, giữ lại đơn
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isCancelling}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
          >
            {isCancelling && <Loader2 className="size-3.5 animate-spin" />}
            <span>Xác nhận hủy đơn</span>
          </button>
        </div>
      </div>
    </div>
  )
}
