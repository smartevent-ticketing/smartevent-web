"use client"

import { ordersApi } from "@/features/orders/api/orders-api"

import { useEffect, useState } from "react"

import type { components } from "@/lib/api/schema"
import { getApiErrorMessage } from "@/lib/api/result"

type OrderResponse = components["schemas"]["OrderResponse"]

export function useCustomerOrders() {
  const [orders, setOrders] = useState<OrderResponse[]>([])

  const [isLoadingOrders, setIsLoadingOrders] = useState(true)

  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error" | "info"
    text: string
  } | null>(null)

  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)

  async function refreshOrders() {
    try {
      const res = await ordersApi.getMyOrders({
        params: { query: { page: 0, size: 20 } },
      })
      if (res.data?.data?.content) setOrders(res.data.data.content)
    } catch {
      // ignore
    }
  }

  async function handleCancelOrder(orderId: string) {
    setCancellingOrderId(orderId)
    try {
      await ordersApi.cancelOrder({
        params: { path: { id: orderId } },
      })
      setFeedbackMessage({
        type: "success",
        text: "Đã hủy đơn hàng thành công. Vé và ghế đã được nhả lại cho hệ thống.",
      })
      refreshOrders()
    } catch {
      setFeedbackMessage({
        type: "error",
        text: "Không thể hủy đơn hàng này. Đơn có thể đã quá hạn hoặc đã thanh toán.",
      })
    } finally {
      setCancellingOrderId(null)
    }
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const results = await Promise.all([
          ordersApi.getMyOrders({ params: { query: { page: 0, size: 20 } } }),
        ])
        if (!mounted) return
        setOrders(results[0].data?.data?.content ?? [])
      } catch (error) {
        if (mounted)
          setFeedbackMessage({
            type: "error",
            text: getApiErrorMessage(error, "Không thể tải dữ liệu. Vui lòng thử lại."),
          })
      } finally {
        if (mounted) {
          setIsLoadingOrders(false)
        }
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  return {
    orders,
    isLoadingOrders,
    feedbackMessage,
    setFeedbackMessage,
    cancellingOrderId,
    handleCancelOrder,
  }
}
