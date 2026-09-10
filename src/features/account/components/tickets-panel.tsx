"use client"

import Link from "next/link"
import { Loader2, Ticket } from "lucide-react"
import { ActionFeedback } from "@/components/shared/action-feedback"
import { useCustomerTickets } from "@/features/account/hooks/use-tickets"
import { TicketCard } from "@/features/account/components/ticket-card"
import { TicketQrDialog } from "@/features/account/components/ticket-qr-dialog"
import { TicketTransferDialog } from "@/features/account/components/ticket-transfer-dialog"

export function CustomerTicketsPanel() {
  const tickets = useCustomerTickets()
  const mutationError =
    tickets.feedbackMessage?.type === "error" ? tickets.feedbackMessage.text : null
  return (
    <div className="space-y-6">
      <ActionFeedback message={tickets.feedbackMessage} onDismiss={tickets.dismissFeedback} />
      {tickets.isLoadingTickets ? (
        <div
          role="status"
          className="flex flex-col items-center justify-center gap-3 py-16 text-on-surface-variant"
        >
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm">Đang tải danh sách vé điện tử...</p>
        </div>
      ) : tickets.loadError ? (
        <div
          role="alert"
          className="space-y-3 rounded-3xl border border-red-200 bg-red-50 p-8 text-center"
        >
          <p>{tickets.loadError}</p>
          <button
            type="button"
            onClick={tickets.retry}
            className="font-semibold text-primary hover:underline"
          >
            Thử lại
          </button>
        </div>
      ) : tickets.tickets.length === 0 ? (
        <div className="space-y-4 rounded-3xl border border-outline-variant/60 bg-white p-12 text-center shadow-xs">
          <Ticket className="mx-auto size-12 text-primary/40" />
          <h3 className="text-base font-bold">Bạn chưa có vé nào trong ví</h3>
          <p className="mx-auto max-w-sm text-sm text-on-surface-variant">
            Khám phá các sự kiện âm nhạc, thể thao và nghệ thuật đặc sắc ngay hôm nay!
          </p>
          <Link
            href="/events"
            className="inline-block rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white transition hover:bg-primary-hover"
          >
            Khám phá sự kiện
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {tickets.tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onShowQr={tickets.openQr}
              onTransfer={tickets.openTransfer}
            />
          ))}
        </div>
      )}
      {tickets.selectedTicketForQR && (
        <TicketQrDialog
          ticket={tickets.selectedTicketForQR}
          busy={tickets.isRefreshingQR}
          error={mutationError}
          onRefresh={tickets.refreshQr}
          onClose={tickets.closeQr}
        />
      )}
      {tickets.ticketToTransfer && (
        <TicketTransferDialog
          key={tickets.ticketToTransfer.id}
          ticket={tickets.ticketToTransfer}
          busy={tickets.isTransferring}
          error={mutationError}
          onSubmit={tickets.transferTicket}
          onClose={tickets.closeTransfer}
        />
      )}
    </div>
  )
}
