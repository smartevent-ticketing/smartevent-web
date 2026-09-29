"use client"

import { Download, FileText, X } from "lucide-react"
import type { components } from "@/lib/api/schema"

type Invoice = components["schemas"]["InvoiceResponse"]

interface InvoiceDetailDialogProps {
  invoice: Invoice | null
  isOpen: boolean
  onClose: () => void
  onDownloadPdf: (invoice: Invoice) => void
}

const money = (amount: number | undefined) =>
  typeof amount === "number" ? `${amount.toLocaleString("vi-VN")} ₫` : "Chưa có thông tin"

const statusLabel: Record<NonNullable<Invoice["status"]>, string> = {
  ISSUED: "Đã phát hành",
  VOID: "Đã hủy hiệu lực",
  CANCELLED: "Đã hủy",
}

export function InvoiceDetailDialog({
  invoice,
  isOpen,
  onClose,
  onDownloadPdf,
}: InvoiceDetailDialogProps) {
  if (!isOpen || !invoice) return null

  const items = invoice.items ?? []
  const issuedDate = invoice.issuedAt
    ? new Date(invoice.issuedAt).toLocaleString("vi-VN")
    : "Chưa có thông tin"

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-outline-variant/60 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/40">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Chi tiết chứng từ giao dịch</h3>
              <p className="text-xs text-on-surface-variant font-mono">
                Mã: {invoice.invoiceCode ?? invoice.id ?? "Chưa có thông tin"}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Đóng chi tiết hóa đơn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-xs">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-surface-container-low/50 border border-outline-variant/60">
            <div>
              <dt className="font-semibold text-on-surface-variant">Trạng thái</dt>
              <dd className="mt-1 font-bold text-on-surface">
                {invoice.status ? statusLabel[invoice.status] : "Chưa có thông tin"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-on-surface-variant">Ngày phát hành</dt>
              <dd className="mt-1 font-bold text-on-surface">{issuedDate}</dd>
            </div>
            <div>
              <dt className="font-semibold text-on-surface-variant">Mã đơn hàng</dt>
              <dd className="mt-1 font-mono text-on-surface break-all">
                {invoice.orderId ?? "Chưa có thông tin"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-on-surface-variant">Email thanh toán</dt>
              <dd className="mt-1 text-on-surface break-all">
                {invoice.billingEmail ?? "Chưa có thông tin"}
              </dd>
            </div>
          </dl>

          <div className="border border-outline-variant/60 rounded-2xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant uppercase font-bold border-b border-outline-variant/60">
                <tr>
                  <th className="px-4 py-3">Nội dung</th>
                  <th className="px-4 py-3 text-center">Số lượng</th>
                  <th className="px-4 py-3 text-right">Đơn giá</th>
                  <th className="px-4 py-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-on-surface-variant">
                      Chưa có chi tiết các mục trong chứng từ.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.id ?? index}>
                      <td className="px-4 py-3 font-medium text-on-surface">
                        {item.description ?? "Chưa có mô tả"}
                      </td>
                      <td className="px-4 py-3 text-center font-mono">{item.quantity ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-mono">{money(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">
                        {money(item.totalPrice)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low/60 space-y-2">
            <div className="flex justify-between text-on-surface-variant">
              <span>Tạm tính</span>
              <span className="font-mono">{money(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Giảm giá</span>
              <span className="font-mono">{money(invoice.discountAmount)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Phí dịch vụ</span>
              <span className="font-mono">{money(invoice.feeAmount)}</span>
            </div>
            <div className="border-t border-outline-variant/60 pt-2 flex justify-between items-center text-sm font-bold text-on-surface">
              <span>Tổng thanh toán</span>
              <span className="text-base font-mono text-primary">{money(invoice.totalAmount)}</span>
            </div>
          </div>
          <p className="text-on-surface-variant">
            Bản xem nhanh hiển thị dữ liệu giao dịch trong hệ thống.
          </p>
        </div>

        <div className="p-6 border-t border-outline-variant/60 bg-surface-container-low/40 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onDownloadPdf(invoice)}
            disabled={!invoice.id}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Download className="size-3.5" /> Tải PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
