"use client"

import { ArrowUpRight, Loader2, Ticket } from "lucide-react"
import { useCheckout } from "@/features/booking/hooks/use-checkout"

type Props = Pick<
  ReturnType<typeof useCheckout>,
  "isProcessing" | "isExpired" | "handlePayment" | "eventName" | "totalAmount" | "items"
>

export function CheckoutSummary({
  isProcessing,
  isExpired,
  handlePayment,
  eventName,
  totalAmount,
  items,
}: Props) {
  const ticketCount = items.reduce((total, item) => total + (item.quantity || 0), 0)
  return (
    <aside aria-label="Tóm tắt đơn hàng" className="lg:col-span-5 lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-outline-variant px-5 py-5 sm:px-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary-container text-primary">
            <Ticket className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Đơn hàng của bạn</h2>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              {ticketCount} vé trong phiên giữ chỗ
            </p>
          </div>
        </div>
        <div className="space-y-5 px-5 py-5 sm:px-6">
          <h3 className="text-base font-semibold leading-6">{eventName}</h3>
          <div className="space-y-4">
            {items.length > 0 ? (
              items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="space-y-2 border-b border-outline-variant pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-semibold">{item.ticketTypeName || "Hạng vé"}</p>
                    <span className="shrink-0 rounded-md bg-surface px-2 py-1 text-xs font-medium">
                      {item.quantity} vé
                    </span>
                  </div>
                  {item.seatCode && <p className="text-xs text-primary">Ghế {item.seatCode}</p>}
                  <p className="text-sm tabular-nums text-on-surface-variant">
                    {(item.unitPrice || 0).toLocaleString("vi-VN")} ₫{" "}
                    <span className="text-xs">/ vé</span>
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-xl bg-surface p-4 text-center text-sm text-on-surface-variant">
                Chưa có vé trong phiên giữ chỗ.
              </p>
            )}
          </div>
        </div>
        <div className="space-y-5 border-t border-outline-variant bg-surface/40 px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs text-on-surface-variant">Tổng thanh toán</p>
              <p className="mt-1 text-sm font-medium">{ticketCount} vé</p>
            </div>
            <p className="text-2xl font-bold tabular-nums tracking-tight">
              {totalAmount.toLocaleString("vi-VN")} <span className="text-base">₫</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handlePayment}
            disabled={isProcessing || isExpired}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-primary/40"
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Đang kết nối VNPAY...</span>
              </>
            ) : (
              <>
                <span>
                  {isExpired ? "Phiên giữ chỗ không còn thanh toán được" : "Tiếp tục đến VNPAY"}
                </span>
                {!isExpired && <ArrowUpRight className="size-4 shrink-0" />}
              </>
            )}
          </button>
          <p className="text-center text-xs leading-5 text-on-surface-variant">
            Kiểm tra tổng tiền trước khi chuyển đến cổng thanh toán.
          </p>
        </div>
      </div>
    </aside>
  )
}
