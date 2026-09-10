"use client"

import { X, Download, FileText, CheckCircle2, ShieldCheck, Printer } from "lucide-react"

interface InvoiceDetailDialogProps {
  invoice: any | null
  isOpen: boolean
  onClose: () => void
  onDownloadPdf: (invoice: any) => void
}

export function InvoiceDetailDialog({
  invoice,
  isOpen,
  onClose,
  onDownloadPdf,
}: InvoiceDetailDialogProps) {
  if (!isOpen || !invoice) return null

  const issuedDate = invoice.issuedAt
    ? new Date(invoice.issuedAt).toLocaleDateString("vi-VN")
    : new Date().toLocaleDateString("vi-VN")

  const total = invoice.totalAmount || 1250000

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-outline-variant/60 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/40">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">
                Hóa đơn giá trị gia tăng (VAT)
              </h3>
              <p className="text-xs text-on-surface-variant font-mono">
                Số HĐ: {invoice.invoiceCode || `HD-${invoice.id?.slice(0, 8) || "98234"}`} • Ký
                hiệu: 1C24TSE
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Invoice Paper Document */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Seller / Buyer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-surface-container-low/50 border border-outline-variant/60">
            <div className="space-y-1.5">
              <span className="font-bold text-[11px] uppercase tracking-wider text-primary block">
                Đơn vị cung cấp dịch vụ
              </span>
              <p className="font-bold text-sm text-on-surface">CÔNG TY CỔ PHẦN SMART EVENT</p>
              <p className="text-on-surface-variant">Mã số thuế: 0109988776</p>
              <p className="text-on-surface-variant">
                Địa chỉ: Tầng 8, Tòa nhà Công nghệ, Cầu Giấy, Hà Nội
              </p>
            </div>

            <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-outline-variant/40 pt-4 md:pt-0 md:pl-6">
              <span className="font-bold text-[11px] uppercase tracking-wider text-primary block">
                Khách hàng / Người mua
              </span>
              <p className="font-bold text-sm text-on-surface">
                {invoice.buyerName || "Khách hàng SMART EVENT"}
              </p>
              <p className="text-on-surface-variant">
                Email nhận HĐ:{" "}
                {invoice.recipientEmail || invoice.billingEmail || "customer@example.com"}
              </p>
              <p className="text-on-surface-variant">Ngày phát hành: {issuedDate}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-outline-variant/60 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant uppercase font-bold border-b border-outline-variant/60">
                <tr>
                  <th className="px-4 py-3">STT</th>
                  <th className="px-4 py-3">Tên hàng hóa, dịch vụ</th>
                  <th className="px-4 py-3 text-center">ĐVT</th>
                  <th className="px-4 py-3 text-center">Số lượng</th>
                  <th className="px-4 py-3 text-right">Đơn giá</th>
                  <th className="px-4 py-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                <tr>
                  <td className="px-4 py-3 text-center font-mono">1</td>
                  <td className="px-4 py-3 font-medium text-on-surface">
                    Vé điện tử tham dự sự kiện (Đơn hàng #
                    {invoice.orderCode || invoice.id?.slice(0, 8)})
                  </td>
                  <td className="px-4 py-3 text-center">Vé</td>
                  <td className="px-4 py-3 text-center font-mono">1</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {total.toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold">
                    {total.toLocaleString("vi-VN")} ₫
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="p-4 rounded-2xl bg-surface-container-low/60 space-y-2">
            <div className="flex justify-between text-on-surface-variant">
              <span>Cộng tiền hàng:</span>
              <span className="font-mono font-bold text-on-surface">
                {total.toLocaleString("vi-VN")} ₫
              </span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Thuế suất GTGT (VAT):</span>
              <span className="font-medium text-on-surface">Đã bao gồm trong giá vé niêm yết</span>
            </div>
            <div className="border-t border-outline-variant/60 pt-2 flex justify-between items-center text-sm font-bold text-on-surface">
              <span>Tổng cộng thanh toán:</span>
              <span className="text-base font-mono text-primary font-bold">
                {total.toLocaleString("vi-VN")} ₫
              </span>
            </div>
          </div>

          {/* Digital Signature Badge */}
          <div className="p-4 rounded-2xl bg-green-50/70 border border-green-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-green-900">
              <ShieldCheck className="size-5 text-green-600 shrink-0" />
              <div>
                <span className="font-bold block">Hóa đơn điện tử hợp pháp có chữ ký số</span>
                <span className="text-[11px] text-green-800">
                  Ký bởi CÔNG TY CỔ PHẦN SMART EVENT • Thời gian ký: {issuedDate}
                </span>
              </div>
            </div>
            <CheckCircle2 className="size-5 text-green-600" />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-outline-variant/60 bg-surface-container-low/40 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onDownloadPdf(invoice)}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <Download className="size-3.5" />
            <span>Tải hóa đơn PDF</span>
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
