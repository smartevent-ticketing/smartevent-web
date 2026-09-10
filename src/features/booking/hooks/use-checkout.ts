"use client"
import { useDeadline } from "@/hooks/use-deadline"

import { bookingApi } from "../api/booking-api"
import { ordersApi } from "@/features/orders"
import { useEffect, useRef, useState } from "react"

import { useRouter, useSearchParams } from "next/navigation"

import type { components } from "@/lib/api/schema"
import { useAuth } from "@/features/auth"
type ReservationResponse = components["schemas"]["ReservationResponse"]

export function useCheckout() {
  const router = useRouter()

  const searchParams = useSearchParams()

  const { user, isLoading: isAuthLoading } = useAuth()

  const reservationId = searchParams.get("reservationId")

  const [reservation, setReservation] = useState<ReservationResponse | null>(null)

  const [isLoadingReservation, setIsLoadingReservation] = useState(Boolean(reservationId))

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isProcessing, setIsProcessing] = useState(false)

  const inFlight = useRef(false)

  const [enteredFullName, setEnteredFullName] = useState<string | null>(null)

  const [enteredEmail, setEnteredEmail] = useState<string | null>(null)

  const [enteredPhone, setEnteredPhone] = useState<string | null>(null)

  const [customerNote, setCustomerNote] = useState("")

  const fullName = enteredFullName ?? (user?.fullName || "")

  const email = enteredEmail ?? (user?.email || "")

  const phone = enteredPhone ?? (user?.phone || "")

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    async function loadReservation() {
      if (!reservationId) {
        setIsLoadingReservation(false)
        return
      }

      setReservation(null)
      setIsLoadingReservation(true)
      setErrorMessage(null)

      try {
        const res = await bookingApi.getReservation({
          params: { path: { id: reservationId } },
          signal: controller.signal,
        })

        if (res.data?.data && isMounted) {
          const r = res.data.data
          setReservation(r)
        } else if (isMounted) {
          setErrorMessage("Không tìm thấy phiên giữ chỗ hoặc phiên đã kết thúc.")
        }
      } catch {
        if (isMounted) {
          setErrorMessage("Lỗi kết nối máy chủ để tải thông tin giữ chỗ.")
        }
      } finally {
        if (isMounted) {
          setIsLoadingReservation(false)
        }
      }
    }

    loadReservation()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [reservationId])

  const deadline = useDeadline(reservation?.expiresAt)
  const isExpired = deadline.isExpired || reservation?.status !== "PENDING"
  const timerDisplay = deadline.timerDisplay

  async function handlePayment() {
    if (inFlight.current) return
    if (!reservation?.id) {
      setErrorMessage("Phiên giữ chỗ không hợp lệ hoặc đã hết hạn.")
      return
    }

    if (isExpired) {
      setErrorMessage("Phiên giữ chỗ đã hết hạn. Vui lòng quay lại chọn vé mới.")
      return
    }

    inFlight.current = true
    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const res = await ordersApi.createOrder({
        body: {
          reservationId: reservation.id,
          customerNote: customerNote.trim() || undefined,
          paymentMethod: "VNPAY",
        },
      })

      if (res.data?.data?.id) {
        const order = res.data.data
        router.push(
          `/payment?orderId=${order.id}&orderCode=${order.orderCode}&amount=${order.totalAmount}`,
        )
      } else {
        setErrorMessage("Không thể tạo đơn hàng từ phiên giữ chỗ này. Vui lòng thử lại.")
      }
    } catch {
      setErrorMessage(
        "Tạo đơn hàng thất bại. Phiên giữ chỗ có thể đã hết hạn hoặc vé không còn khả dụng.",
      )
    } finally {
      inFlight.current = false
      setIsProcessing(false)
    }
  }

  const eventName = reservation?.eventName || "Sự kiện"

  const totalAmount = reservation?.totalAmount ?? 0

  const items = reservation?.items || []

  return {
    router,
    isAuthLoading,
    reservationId,
    reservation,
    isLoadingReservation,
    errorMessage,
    setErrorMessage,
    isProcessing,
    setEnteredFullName,
    setEnteredEmail,
    setEnteredPhone,
    customerNote,
    setCustomerNote,
    fullName,
    email,
    phone,
    isExpired,
    timerDisplay,
    handlePayment,
    eventName,
    totalAmount,
    items,
  }
}
