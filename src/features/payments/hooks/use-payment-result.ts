"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ordersApi } from "@/features/orders"
import type { components } from "@/lib/api/schema"
import { verifyPayment } from "../application/verify-payment"
import type { VerificationStatus } from "../model/payment-status"

export function usePaymentResult() {
  const params = useSearchParams()
  const orderCode = params.get("vnp_TxnRef") || params.get("orderCode") || ""
  const [order, setOrder] = useState<components["schemas"]["OrderResponse"]>()
  const [status, setStatus] = useState<VerificationStatus>("verifying")
  const [pollCount, setPollCount] = useState(1)
  const [retryTrigger, setRetryTrigger] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    async function verify() {
      setStatus("verifying")
      setOrder(undefined)
      if (!orderCode) {
        setStatus("failed")
        return
      }
      const result = await verifyPayment({
        signal: controller.signal,
        onAttempt: setPollCount,
        fetchOrder: async (signal) =>
          (await ordersApi.getOrderByCode({ params: { path: { orderCode } }, signal })).data?.data,
      })
      if (result && !controller.signal.aborted) {
        setOrder(result.order)
        setStatus(result.status)
      }
    }
    void verify()
    return () => controller.abort()
  }, [orderCode, retryTrigger])

  return {
    orderCode,
    status,
    pollCount,
    displayAmount: order?.totalAmount,
    hasVerifiedOrder: Boolean(order),
    errorMessage: orderCode ? null : "Không tìm thấy mã đơn hàng cần xác thực.",
    handleManualRetry: () => setRetryTrigger((value) => value + 1),
  }
}
