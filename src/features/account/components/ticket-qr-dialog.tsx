"use client"

import { RefreshCw, X } from "lucide-react"
import { AccountDialog } from "@/features/account/components/account-dialog"
import type { CustomerTicket } from "@/features/account/model/ticket"

type Props = {
  ticket: CustomerTicket
  busy: boolean
  error: string | null
  onRefresh: () => void
  onClose: () => void
}

export function TicketQrDialog({ ticket, busy, error, onRefresh, onClose }: Props) {
  return (
    <AccountDialog titleId="ticket-qr-title" onClose={onClose} busy={busy}>
      <div className="relative space-y-4 text-center">
        <button
          type="button"
          aria-label="Đóng mã QR"
          disabled={busy}
          onClick={onClose}
          className="absolute right-0 top-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-50"
        >
          <X className="size-5" />
        </button>
        <div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase text-primary">
            Vé điện tử SmartEvent
          </span>
          <h3 id="ticket-qr-title" className="mt-2 line-clamp-1 text-lg font-bold">
            {ticket.eventName}
          </h3>
          <p className="mt-0.5 font-mono text-xs text-on-surface-variant">{ticket.ticketCode}</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low p-4">
          {ticket.qrCodeBase64 ? (
            // The service returns a signed QR image; ticket codes are not QR tokens.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/png;base64,${ticket.qrCodeBase64}`}
              alt="Mã QR vé vào cửa"
              className="size-48 rounded-lg object-contain shadow-xs"
            />
          ) : (
            <p role="status" className="py-8 text-sm text-on-surface-variant">
              Mã QR chưa sẵn sàng. Hãy làm mới mã để tiếp tục.
            </p>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={busy || !ticket.id}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${busy ? "animate-spin" : ""}`} />
            {busy ? "Đang làm mới..." : "Làm mới mã QR bảo mật"}
          </button>
        </div>
        {error && (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
        <div className="space-y-1 text-xs text-on-surface-variant">
          <p className="font-bold text-on-surface">
            {ticket.ticketTypeName} • {ticket.areaName}
            {ticket.seatCode ? ` (${ticket.seatCode})` : ""}
          </p>
          <p>Xuất trình mã QR tại cửa soát vé để vào sự kiện.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          Đóng
        </button>
      </div>
    </AccountDialog>
  )
}
