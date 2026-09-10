"use client"

import { accountApi } from "@/features/account/api/account-api"

import { useEffect, useState } from "react"

import type { components } from "@/lib/api/schema"
import { useAuth } from "@/features/auth/auth-provider"
import { getApiErrorMessage } from "@/lib/api/result"

type InvoiceResponse = components["schemas"]["InvoiceResponse"]

export function useCustomerInvoices() {
  const { user } = useAuth()

  const [invoices, setInvoices] = useState<InvoiceResponse[]>([])

  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true)

  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error" | "info"
    text: string
  } | null>(null)

  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null)

  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null)

  async function handleDownloadInvoicePdf(invoice: InvoiceResponse) {
    if (!invoice.id) return

    setDownloadingInvoiceId(invoice.id)
    try {
      const res = await accountApi.getInvoicePdf({
        params: { path: { id: invoice.id } },
        parseAs: "blob",
      })

      if (res.data) {
        const blob = res.data as Blob
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `Hoa_don_${invoice.invoiceCode || invoice.id}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch {
      setFeedbackMessage({
        type: "error",
        text: "Không thể tải file PDF hóa đơn. Vui lòng thử lại sau.",
      })
    } finally {
      setDownloadingInvoiceId(null)
    }
  }

  async function handleSendInvoiceEmail(invoice: InvoiceResponse) {
    if (!invoice.id) return

    setSendingInvoiceId(invoice.id)
    try {
      await accountApi.sendInvoice({
        params: { path: { id: invoice.id } },
        body: {
          recipientEmail: invoice.billingEmail || user?.email || "customer@example.com",
        },
      })
      // Thông báo đúng như cam kết trong Phase 1 design
      setFeedbackMessage({
        type: "info",
        text: "Đã tiếp nhận yêu cầu gửi email hóa đơn. Hệ thống đang tiến hành chuyển phát.",
      })
    } catch {
      setFeedbackMessage({
        type: "error",
        text: "Gửi email hóa đơn thất bại. Vui lòng thử lại sau.",
      })
    } finally {
      setSendingInvoiceId(null)
    }
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const results = await Promise.all([accountApi.getMyInvoices()])
        if (!mounted) return
        setInvoices(results[0].data?.data ?? [])
      } catch (error) {
        if (mounted)
          setFeedbackMessage({
            type: "error",
            text: getApiErrorMessage(error, "Không thể tải dữ liệu. Vui lòng thử lại."),
          })
      } finally {
        if (mounted) {
          setIsLoadingInvoices(false)
        }
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  return {
    invoices,
    isLoadingInvoices,
    feedbackMessage,
    setFeedbackMessage,
    downloadingInvoiceId,
    sendingInvoiceId,
    handleDownloadInvoicePdf,
    handleSendInvoiceEmail,
  }
}
