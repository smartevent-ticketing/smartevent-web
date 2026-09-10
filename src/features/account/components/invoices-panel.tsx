"use client"

import { useState } from "react"
import { Download, Eye, FileText, Loader2, Mail } from "lucide-react"
import { ActionFeedback } from "@/components/shared/action-feedback"
import { useCustomerInvoices } from "@/features/account/hooks/use-invoices"
import { InvoiceDetailDialog } from "@/features/account/components/invoice-detail-dialog"
import { InvoiceEmailDialog } from "@/features/account/components/invoice-email-dialog"

export function CustomerInvoicesPanel() {
  const {
    invoices,
    isLoadingInvoices,
    feedbackMessage,
    setFeedbackMessage,
    downloadingInvoiceId,
    sendingInvoiceId,
    handleDownloadInvoicePdf,
    handleSendInvoiceEmail,
  } = useCustomerInvoices()

  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<any | null>(null)
  const [selectedInvoiceForEmail, setSelectedInvoiceForEmail] = useState<any | null>(null)

  return (
    <div className="space-y-6">
      <ActionFeedback message={feedbackMessage} onDismiss={() => setFeedbackMessage(null)} />
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-outline-variant/60 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-on-surface">Hóa đơn giao dịch điện tử</h2>
          <p className="text-xs text-on-surface-variant">
            Hệ thống tự động phát hành hóa đơn điện tử cho mọi giao dịch thanh toán thành công.
          </p>
        </div>

        {isLoadingInvoices ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm">Đang tải danh sách hóa đơn...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-surface-container-low rounded-2xl border border-outline-variant/60">
            <FileText className="size-10 text-primary/40 mx-auto" />
            <h4 className="text-sm font-bold text-on-surface">
              Chưa có hóa đơn nào được phát hành
            </h4>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Hóa đơn sẽ xuất hiện tại đây ngay khi đơn hàng thanh toán thành công.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-on-surface">
                      HÓA ĐƠN #{inv.invoiceCode || inv.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                      {inv.status || "ISSUED"}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Ngày lập:{" "}
                    {inv.issuedAt ? new Date(inv.issuedAt).toLocaleString("vi-VN") : "Gần đây"} •
                    Tổng tiền:{" "}
                    <strong className="text-primary">
                      {(inv.totalAmount || 0).toLocaleString("vi-VN")} ₫
                    </strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedInvoiceForDetail(inv)}
                    className="px-3 py-1.5 bg-white border border-outline-variant rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Eye className="size-3.5 text-primary" />
                    <span>Xem chi tiết</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadInvoicePdf(inv)}
                    disabled={downloadingInvoiceId === inv.id}
                    className="px-3 py-1.5 bg-white border border-outline-variant rounded-xl text-xs font-semibold text-primary hover:bg-surface-container flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {downloadingInvoiceId === inv.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Download className="size-3.5" />
                    )}
                    <span>Tải PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedInvoiceForEmail(inv)}
                    disabled={sendingInvoiceId === inv.id}
                    className="px-3 py-1.5 bg-white border border-outline-variant rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {sendingInvoiceId === inv.id ? (
                      <Loader2 className="size-3.5 animate-spin text-primary" />
                    ) : (
                      <Mail className="size-3.5 text-primary" />
                    )}
                    <span>Gửi qua email</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      {selectedInvoiceForDetail && (
        <InvoiceDetailDialog
          invoice={selectedInvoiceForDetail}
          isOpen={Boolean(selectedInvoiceForDetail)}
          onClose={() => setSelectedInvoiceForDetail(null)}
          onDownloadPdf={handleDownloadInvoicePdf}
        />
      )}

      {selectedInvoiceForEmail && (
        <InvoiceEmailDialog
          invoice={selectedInvoiceForEmail}
          isOpen={Boolean(selectedInvoiceForEmail)}
          onClose={() => setSelectedInvoiceForEmail(null)}
          onSendEmail={async (inv, customEmail) => {
            await handleSendInvoiceEmail({ ...inv, recipientEmail: customEmail })
          }}
        />
      )}
    </div>
  )
}
