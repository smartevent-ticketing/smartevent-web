"use client"

import { useState } from "react"
import { Mail, CheckCircle2, Clock, Loader2, Info } from "lucide-react"

interface InvoiceEmailDialogProps {
  invoice: any | null
  isOpen: boolean
  onClose: () => void
  onSendEmail: (invoice: any, email?: string) => Promise<void>
}

export function InvoiceEmailDialog({
  invoice,
  isOpen,
  onClose,
  onSendEmail,
}: InvoiceEmailDialogProps) {
  const [recipientEmail, setRecipientEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isQueued, setIsQueued] = useState(false)

  if (!isOpen || !invoice) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSendEmail(invoice, recipientEmail.trim() || undefined)
      setIsQueued(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsQueued(false)
    setRecipientEmail("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
        {!isQueued ? (
          <>
            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Mail className="size-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-on-surface">Gửi hóa đơn qua email</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Hóa đơn VAT điện tử của đơn hàng #{invoice.invoiceCode || invoice.id?.slice(0, 8)}{" "}
                sẽ được gửi đến địa chỉ email bạn chỉ định.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Email người nhận (Tùy chọn)
                </label>
                <input
                  type="email"
                  placeholder="Ví dụ: ketoan@congty.com (để trống nếu gửi về email tài khoản)"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs"
                />
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/60 flex items-start gap-2 text-[11px] text-blue-900 leading-relaxed">
                <Info className="size-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Nếu để trống, hệ thống sẽ sử dụng email thanh toán mặc định đã đăng ký trên tài
                  khoản của bạn.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
                >
                  {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                  <span>Gửi hóa đơn</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Queued State matching UX/UI customer/invoice-email/queued-desktop */
          <div className="py-4 space-y-4 text-center">
            <div className="size-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
              <Clock className="size-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-on-surface">
                Yêu cầu đã được tiếp nhận vào hàng đợi
              </h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                Hệ thống thư điện tử Outbox đã tạo tác vụ gửi hóa đơn (Trạng thái: PENDING). Hóa đơn
                điện tử sẽ được chuyển đến hộp thư của bạn sau ít phút.
              </p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="size-3.5" />
                <span>Đã hiểu</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
