"use client"

import { FileText, Mail, Phone, User } from "lucide-react"
import { useCheckout } from "@/features/booking/hooks/use-checkout"

type Props = Pick<
  ReturnType<typeof useCheckout>,
  "customerNote" | "setCustomerNote" | "fullName" | "email" | "phone"
>

export function CheckoutContact({ customerNote, setCustomerNote, fullName, email, phone }: Props) {
  return (
    <>
      <div className="bg-white rounded-3xl p-6 border border-outline-variant/60 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-outline-variant/60 pb-4">
          <h3 className="text-base font-bold text-on-surface">Thông tin tài khoản nhận vé</h3>
          <span className="text-xs text-primary font-semibold">
            Vé điện tử và hóa đơn được gửi qua email tài khoản
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-on-surface block mb-1.5">
              Họ và tên tài khoản
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant" />
              <div className="h-11 pl-10 pr-4 rounded-xl border border-outline-variant/80 bg-surface-container-low text-sm flex items-center">
                {fullName || "Chưa cập nhật"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-on-surface block mb-1.5">
                Email tài khoản nhận vé
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant" />
                <div className="h-11 pl-10 pr-4 rounded-xl border border-outline-variant/80 bg-surface-container-low text-sm flex items-center break-all">
                  {email || "Chưa cập nhật"}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-on-surface block mb-1.5">
                Số điện thoại tài khoản
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant" />
                <div className="h-11 pl-10 pr-4 rounded-xl border border-outline-variant/80 bg-surface-container-low text-sm flex items-center">
                  {phone || "Chưa cập nhật"}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface block mb-1.5">
              Ghi chú đơn hàng / Yêu cầu đặc biệt (tùy chọn)
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 size-4 text-on-surface-variant" />
              <textarea
                rows={2}
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Nhập ghi chú cho ban tổ chức nếu có..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant/80 bg-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
