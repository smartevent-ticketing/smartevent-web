"use client"

import { ordersApi } from "@/features/orders"

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
  const [nextPage, setNextPage] = useState<number | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  async function loadMoreOrders() {
    if (nextPage === null || isLoadingMore) return
    const pageNumber = nextPage
    setIsLoadingMore(true)
    try {
      const res = await ordersApi.getMyOrders({
        params: { query: { page: pageNumber, size: 20 } },
      })
      const page = res.data?.data
      if (!page) throw new Error("Không thể tải thêm đơn hàng.")
      setOrders((current) => {
        const seen = new Set(current.map((order) => order.id))
        return [...current, ...(page.content ?? []).filter((order) => !seen.has(order.id))]
      })
      setNextPage(pageNumber + 1 < (page.totalPages ?? 0) ? pageNumber + 1 : null)
    } catch (error) {
      setFeedbackMessage({
        type: "error",
        text: getApiErrorMessage(error, "Không thể tải thêm đơn hàng. Vui lòng thử lại."),
      })
    } finally {
      setIsLoadingMore(false)
    }
  }

  async function handleCancelOrder(orderId: string) {
    setCancellingOrderId(orderId)
    try {
      await ordersApi.cancelOrder({
        params: { path: { id: orderId } },
      })
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, status: "CANCELLED" } : order)),
      )
      setFeedbackMessage({
        type: "success",
        text: "Đã hủy đơn hàng thành công. Vé và ghế đã được nhả lại cho hệ thống.",
      })
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
        const page = results[0].data?.data
        setOrders(page?.content ?? [])
        setNextPage((page?.totalPages ?? 0) > 1 ? 1 : null)
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
    nextPage,
    isLoadingMore,
    loadMoreOrders,
    handleCancelOrder,
  }
}
