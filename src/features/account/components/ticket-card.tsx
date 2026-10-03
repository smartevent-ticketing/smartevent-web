"use client"

import { CheckCircle2, QrCode, Send, Ticket } from "lucide-react"
import type { CustomerTicket } from "@/features/account/model/ticket"

type Props = {
  ticket: CustomerTicket
  onShowQr: (ticket: CustomerTicket) => void
  onTransfer: (ticket: CustomerTicket) => void
}

export function TicketCard({ ticket: t, onShowQr, onTransfer }: Props) {
  const isValid = t.status === "ISSUED"
  const isUsed = t.status === "USED"
  const isTransferred = t.status === "TRANSFERRED"
  const isCancelled = t.status === "CANCELLED"
  const isRefunded = t.status === "REFUNDED"
  const isResaleListed = t.status === "RESALE_LISTED"

  const getStatusLabel = () => {
    if (isValid) return "Hợp lệ"
    if (isUsed) return "Đã check-in"
    if (isTransferred) return "Đã chuyển nhượng"
    if (isCancelled) return "Đã hủy"
    if (isRefunded) return "Đã hoàn tiền"
    if (isResaleListed) return "Đang bán lại"
    return t.status || "Không hiệu lực"
  }

  const getStatusStyle = () => {
    if (isValid) return "bg-green-50 text-green-700 border border-green-200"
    if (isUsed) return "bg-gray-100 text-gray-600"
    if (isTransferred) return "bg-blue-50 text-blue-700"
    if (isRefunded) return "bg-amber-50 text-amber-700"
    if (isResaleListed) return "bg-purple-50 text-purple-700"
    return "bg-red-50 text-red-700"
  }

  const getNoticeCaption = () => {
    if (isUsed) return "Vé đã được sử dụng check-in tại cổng."
    if (isTransferred) return "Vé đã được chuyển giao cho người khác."
    if (isCancelled) return "Vé đã bị hủy theo yêu cầu hoặc do sự kiện bị hủy."
    if (isRefunded) return "Vé đã được hoàn tiền thành công."
    if (isResaleListed) return "Vé đang được niêm yết bán lại trên sàn."
    return "Vé không còn hiệu lực sử dụng."
  }

  return (
    <div
      key={t.id}
      className="overflow-hidden bg-white rounded-2xl p-5 sm:p-6 border border-outline-variant shadow-sm transition-colors hover:border-primary/30 flex flex-col justify-between space-y-5"
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-mono font-semibold tracking-wide text-on-surface-variant">
            {t.ticketCode}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 ${getStatusStyle()}`}
          >
            {isValid && <CheckCircle2 className="size-3.5" />}
            <span>{getStatusLabel()}</span>
          </span>
        </div>

        <h3 className="pt-2 text-lg font-bold leading-7 text-on-surface line-clamp-2">
          {t.eventName || "Sự kiện SmartEvent"}
        </h3>

        <div className="space-y-1.5 text-xs text-on-surface-variant pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <Ticket className="size-3.5 text-primary shrink-0" />
            <span className="font-semibold text-on-surface">
              {t.ticketTypeName || "Hạng vé chính"}
            </span>
            {t.areaName && <span className="text-on-surface-variant">· {t.areaName}</span>}
            {t.seatCode && <span className="font-bold text-primary">• Ghế: {t.seatCode}</span>}
          </div>
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-outline-variant flex items-center justify-between gap-3 flex-wrap">
        {isValid ? (
          <>
            <button
              type="button"
              onClick={() => onShowQr(t)}
              className="min-h-11 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="size-4" />
              <span>Xem mã QR</span>
            </button>

            <button
              type="button"
              onClick={() => onTransfer(t)}
              className="min-h-11 px-3.5 py-2 bg-white border border-outline-variant hover:bg-surface text-on-surface text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Send className="size-3.5 text-primary" />
              <span>Chuyển nhượng</span>
            </button>
          </>
        ) : (
          <span className="text-xs text-on-surface-variant italic">{getNoticeCaption()}</span>
        )}
      </div>
    </div>
  )
}
