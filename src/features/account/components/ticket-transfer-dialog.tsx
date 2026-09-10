"use client"

import { useState } from "react"
import { Loader2, X } from "lucide-react"
import { AccountDialog } from "@/features/account/components/account-dialog"
import type { CustomerTicket } from "@/features/account/model/ticket"

type Props = {
  ticket: CustomerTicket
  busy: boolean
  error: string | null
  onSubmit: (email: string, note: string) => void
  onClose: () => void
}

export function TicketTransferDialog({ ticket, busy, error, onSubmit, onClose }: Props) {
  const [email, setEmail] = useState("")
  const [note, setNote] = useState("")
  return (
    <AccountDialog titleId="ticket-transfer-title" onClose={onClose} busy={busy} wide>
      <div className="relative space-y-5">
        <button
          type="button"
          aria-label="Đóng chuyển nhượng"
          disabled={busy}
          onClick={onClose}
          className="absolute right-0 top-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-50"
        >
          <X className="size-5" />
        </button>
        <div>
          <h3 id="ticket-transfer-title" className="pr-8 text-lg font-bold">
            Chuyển nhượng quyền sở hữu vé
          </h3>
          <p className="text-xs text-on-surface-variant">
            Chuyển vé đến tài khoản người nhận. Mã QR cũ của bạn sẽ bị vô hiệu sau khi chuyển.
          </p>
        </div>
        <div className="space-y-1 rounded-xl border border-outline-variant/60 bg-surface-container-low p-3.5 text-xs">
          <div className="font-bold">{ticket.eventName}</div>
          <div>
            Mã vé: <strong className="font-mono text-primary">{ticket.ticketCode}</strong> • Khu:{" "}
            {ticket.areaName}
          </div>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit(email, note)
          }}
        >
          <fieldset disabled={busy} className="space-y-4">
            <div>
              <label htmlFor="ticket-recipient-email" className="mb-1 block text-xs font-semibold">
                Email người nhận *
              </label>
              <input
                id="ticket-recipient-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email.nguoinhan@domain.com"
                className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-low px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="ticket-transfer-note" className="mb-1 block text-xs font-semibold">
                Lời nhắn (tùy chọn)
              </label>
              <input
                id="ticket-transfer-note"
                type="text"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Gửi tặng bạn vé sự kiện..."
                className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-low px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {error && (
              <p role="alert" className="text-xs text-red-600">
                {error}
              </p>
            )}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-surface-container py-2.5 text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex flex-1 items-center justify-center rounded-xl bg-primary py-2.5 text-xs font-bold text-white disabled:opacity-50"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : "Xác nhận chuyển"}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </AccountDialog>
  )
}
