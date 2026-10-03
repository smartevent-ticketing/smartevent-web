"use client"

import { FileText, Mail, Phone, User } from "lucide-react"
import { useCheckout } from "@/features/booking/hooks/use-checkout"

type Props = Pick<
  ReturnType<typeof useCheckout>,
  "customerNote" | "setCustomerNote" | "fullName" | "email" | "phone"
>

export function CheckoutContact({ customerNote, setCustomerNote, fullName, email, phone }: Props) {
  return (
    <section
      aria-labelledby="checkout-contact-heading"
      className="space-y-5 rounded-2xl border border-outline-variant bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-surface text-on-surface">
          <User className="size-5" />
        </div>
        <div>
          <h2 id="checkout-contact-heading" className="text-base font-bold">
            Thông tin nhận vé
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-on-surface-variant">
            Thông tin từ tài khoản đang đăng nhập.
          </p>
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-outline-variant bg-surface/50 p-4 sm:col-span-2">
          <dt className="mb-2 text-xs text-on-surface-variant">Họ và tên</dt>
          <dd className="text-sm font-semibold">{fullName || "Chưa cập nhật"}</dd>
        </div>
        <div className="min-w-0 rounded-xl border border-outline-variant bg-surface/50 p-4">
          <dt className="mb-2 flex items-center gap-2 text-xs text-on-surface-variant">
            <Mail className="size-3.5" /> Email tài khoản
          </dt>
          <dd className="break-all text-sm font-medium leading-6">{email || "Chưa cập nhật"}</dd>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface/50 p-4">
          <dt className="mb-2 flex items-center gap-2 text-xs text-on-surface-variant">
            <Phone className="size-3.5" /> Số điện thoại
          </dt>
          <dd className="text-sm font-medium leading-6">{phone || "Chưa cập nhật"}</dd>
        </div>
      </dl>

      <div className="border-t border-outline-variant pt-5">
        <label
          htmlFor="checkout-note"
          className="mb-2 flex items-center gap-2 text-sm font-semibold"
        >
          <FileText className="size-4 text-on-surface-variant" /> Ghi chú cho ban tổ chức{" "}
          <span className="text-xs font-normal text-on-surface-variant">(tùy chọn)</span>
        </label>
        <textarea
          id="checkout-note"
          rows={3}
          value={customerNote}
          onChange={(e) => setCustomerNote(e.target.value)}
          placeholder="Thông tin bổ sung cho đơn hàng của bạn..."
          className="w-full resize-y rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm leading-6 outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </div>
    </section>
  )
}
