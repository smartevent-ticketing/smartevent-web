"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { components } from "@/lib/api/schema"
import { getApiErrorMessage } from "@/lib/api/result"
import { useDeadline } from "@/hooks/use-deadline"
import { ordersApi } from "@/features/orders"
import { paymentsApi } from "../api/payments-api"
import { canInitiatePayment, getPaymentUrl } from "../model/payment-session"

export function usePayment() {
  const router = useRouter()
  const params = useSearchParams()
  const orderId = params.get("orderId") ?? ""
  const orderCode = params.get("orderCode") || params.get("code") || ""
  const isRealOrder = Boolean(orderId || orderCode)
  const [order, setOrder] = useState<components["schemas"]["OrderResponse"] | null>(null)
  const [isLoadingOrder, setLoading] = useState(true)
  const [isCreatingPayment, setCreating] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [errorMessage, setError] = useState<string | null>(null)
  const [autoRedirectSeconds, setAutoRedirectSeconds] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [retry, setRetry] = useState(0)
  const deadline = useDeadline(order?.paymentDeadline)
  const isExpired = deadline.isExpired || order?.status !== "PENDING_PAYMENT"

  useEffect(() => {
    const controller = new AbortController()
    async function prepare() {
      setLoading(true)
      setCreating(false)
      setPaymentUrl(null)
      setAutoRedirectSeconds(null)
      setOrder(null)
      setError(null)
      try {
        if (!isRealOrder) throw new Error("Chưa có thông tin đơn hàng.")
        const response = await (orderId
          ? ordersApi.getOrder({ params: { path: { id: orderId } }, signal: controller.signal })
          : ordersApi.getOrderByCode({
              params: { path: { orderCode } },
              signal: controller.signal,
            }))
        if (controller.signal.aborted) return
        const current = response.data?.data
        if (!current?.id) throw new Error("Không tìm thấy đơn hàng.")
        setOrder(current)
        setLoading(false)
        if (current.status === "PAID") {
          router.replace(
            "/payment/vnpay-return?orderCode=" + encodeURIComponent(current.orderCode ?? orderCode),
          )
          return
        }
        if (!canInitiatePayment(current))
          throw new Error("Đơn hàng không còn trong thời hạn thanh toán.")
        setCreating(true)
        const created = await paymentsApi.createPaymentUrl({
          body: { orderId: current.id, paymentMethod: "VNPAY" },
        })
        if (controller.signal.aborted) return
        setPaymentUrl(getPaymentUrl(created.data?.data?.paymentUrl))
        setAutoRedirectSeconds(3)
      } catch (error) {
        if (!controller.signal.aborted)
          setError(getApiErrorMessage(error, "Không thể kết nối cổng thanh toán."))
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
          setCreating(false)
        }
      }
    }
    void prepare()
    return () => controller.abort()
  }, [orderId, orderCode, isRealOrder, retry, router])

  useEffect(() => {
    if (autoRedirectSeconds === null || isExpired || !paymentUrl) return
    if (autoRedirectSeconds <= 0) {
      window.location.assign(paymentUrl)
      return
    }
    const timer = setTimeout(
      () => setAutoRedirectSeconds((value) => (value === null ? null : value - 1)),
      1000,
    )
    return () => clearTimeout(timer)
  }, [autoRedirectSeconds, isExpired, paymentUrl])

  const effectiveCode = order?.orderCode ?? orderCode
  async function handleCopyOrderId() {
    try {
      await navigator.clipboard.writeText(effectiveCode)
      setCopied(true)
    } catch {
      setError("Không thể sao chép mã đơn hàng.")
    }
  }
  function handleDirectToVNPay() {
    if (paymentUrl && !isExpired) window.location.assign(paymentUrl)
  }
  function retryPayment() {
    if (!isLoadingOrder && !isCreatingPayment) setRetry((value) => value + 1)
  }
  return {
    isRealOrder,
    order,
    isLoadingOrder,
    isCreatingPayment,
    paymentUrl,
    errorMessage,
    autoRedirectSeconds,
    copied,
    isExpired,
    timerDisplay: deadline.timerDisplay,
    effectiveAmount: order?.totalAmount ?? 0,
    effectiveCode,
    handleCopyOrderId,
    handleDirectToVNPay,
    retryPayment,
  }
}
