"use client"

import { useEffect, useRef, useState } from "react"
import { accountApi } from "@/features/account/api/account-api"
import type { CustomerTicket } from "@/features/account/model/ticket"
import { getApiErrorMessage } from "@/lib/api/result"

export function useCustomerTickets() {
  const [tickets, setTickets] = useState<CustomerTicket[]>([])
  const [isLoadingTickets, setIsLoadingTickets] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [refreshVersion, setRefreshVersion] = useState(0)
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const [selectedTicketForQR, setSelectedTicketForQR] = useState<CustomerTicket | null>(null)
  const [ticketToTransfer, setTicketToTransfer] = useState<CustomerTicket | null>(null)
  const [isRefreshingQR, setIsRefreshingQR] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const mutationPending = useRef(false)

  async function refreshQr() {
    if (!selectedTicketForQR?.id || mutationPending.current) return
    const ticketId = selectedTicketForQR.id
    mutationPending.current = true
    setIsRefreshingQR(true)
    setFeedbackMessage(null)
    try {
      const result = await accountApi.refreshTicketQr({ params: { path: { id: ticketId } } })
      const updated = result.data?.data
      if (!updated?.id || !updated.qrCodeBase64)
        throw new Error("Mã QR chưa sẵn sàng. Vui lòng thử lại.")
      setSelectedTicketForQR((current) => (current?.id === ticketId ? updated : current))
      setTickets((current) =>
        current.map((ticket) => (ticket.id === updated.id ? updated : ticket)),
      )
      setFeedbackMessage({
        type: "success",
        text: "Mã QR đã được làm mới. Mã cũ không còn hiệu lực.",
      })
    } catch (error) {
      setFeedbackMessage({
        type: "error",
        text: getApiErrorMessage(error, "Không thể làm mới mã QR. Vui lòng thử lại."),
      })
    } finally {
      mutationPending.current = false
      setIsRefreshingQR(false)
    }
  }

  async function transferTicket(email: string, note: string) {
    if (!ticketToTransfer?.id || !email.trim() || mutationPending.current) return
    const ticketId = ticketToTransfer.id
    mutationPending.current = true
    setIsTransferring(true)
    setFeedbackMessage(null)
    try {
      const result = await accountApi.transferTicket({
        params: { path: { id: ticketId } },
        body: { recipientEmail: email.trim(), note: note.trim() || undefined },
      })
      if (!result.data?.data)
        throw new Error(
          "Chưa xác nhận được kết quả chuyển nhượng. Vui lòng tải lại danh sách vé trước khi thử lại.",
        )
      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, status: "TRANSFERRED", qrCodeBase64: undefined }
            : ticket,
        ),
      )
      setSelectedTicketForQR(null)
      setTicketToTransfer(null)
      setFeedbackMessage({ type: "success", text: `Đã chuyển nhượng vé tới ${email.trim()}.` })
    } catch (error) {
      setFeedbackMessage({
        type: "error",
        text: getApiErrorMessage(
          error,
          "Chuyển nhượng thất bại. Vui lòng kiểm tra email người nhận và quyền sở hữu vé.",
        ),
      })
    } finally {
      mutationPending.current = false
      setIsTransferring(false)
    }
  }

  useEffect(() => {
    let active = true
    accountApi
      .getMyTickets()
      .then((result) => {
        if (active) setTickets(result.data?.data ?? [])
      })
      .catch((error: unknown) => {
        if (active)
          setLoadError(getApiErrorMessage(error, "Không thể tải danh sách vé. Vui lòng thử lại."))
      })
      .finally(() => {
        if (active) setIsLoadingTickets(false)
      })
    return () => {
      active = false
    }
  }, [refreshVersion])

  return {
    tickets,
    isLoadingTickets,
    loadError,
    feedbackMessage,
    selectedTicketForQR,
    ticketToTransfer,
    isRefreshingQR,
    isTransferring,
    refreshQr,
    transferTicket,
    dismissFeedback: () => setFeedbackMessage(null),
    retry: () => {
      setLoadError(null)
      setIsLoadingTickets(true)
      setRefreshVersion((value) => value + 1)
    },
    openQr: (ticket: CustomerTicket) => {
      setFeedbackMessage(null)
      setSelectedTicketForQR(ticket)
    },
    closeQr: () => {
      if (!mutationPending.current) setSelectedTicketForQR(null)
    },
    openTransfer: (ticket: CustomerTicket) => {
      setFeedbackMessage(null)
      setTicketToTransfer(ticket)
    },
    closeTransfer: () => {
      if (!mutationPending.current) setTicketToTransfer(null)
    },
  }
}
