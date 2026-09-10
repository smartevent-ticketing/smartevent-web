"use client"

import { useState } from "react"
import Link from "next/link"
import { CreditCard, Eye, Loader2 } from "lucide-react"
import { ActionFeedback } from "@/components/shared/action-feedback"
import { useCustomerOrders } from "@/features/account/hooks/use-orders"
import { OrderDetailDialog } from "@/features/account/components/order-detail-dialog"
import { CancelOrderDialog } from "@/features/account/components/cancel-order-dialog"

export function CustomerOrdersPanel() {
  const {
    orders,
    isLoadingOrders,
    feedbackMessage,
    setFeedbackMessage,
    cancellingOrderId,
    handleCancelOrder,
  } = useCustomerOrders()

  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<any | null>(null)
  const [orderToCancel, setOrderToCancel] = useState<any | null>(null)

  const handleConfirmCancel = async () => {
    if (!orderToCancel?.id) return
    await handleCancelOrder(orderToCancel.id)
    setOrderToCancel(null)
  }

  return (
    <div className="space-y-6">
      <ActionFeedback message={feedbackMessage} onDismiss={() => setFeedbackMessage(null)} />
      <div className="bg-white rounded-3xl border border-outline-variant/60 shadow-xs overflow-hidden">
        {isLoadingOrders ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm">Đang tải lịch sử đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CreditCard className="size-12 text-primary/40 mx-auto" />
            <h3 className="text-base font-bold text-on-surface">Bạn chưa có đơn hàng nào</h3>
            <p className="text-xs text-on-surface-variant">
              Mọi đơn đặt vé của bạn sẽ xuất hiện tại đây sau khi thanh toán.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-xs uppercase font-bold text-on-surface-variant border-b border-outline-variant/60">
                <tr>
                  <th className="px-6 py-4">Mã đơn hàng</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4">Tổng tiền</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {orders.map((ord) => {
                  const isExpired =
                    ord.status === "EXPIRED" ||
                    (Boolean(ord.paymentDeadline) &&
                      new Date(ord.paymentDeadline!).getTime() < Date.now())
                  const isPending =
                    ((ord.status as string) === "PENDING" || ord.status === "PENDING_PAYMENT") &&
                    !isExpired
                  const isPaid = ord.status === "PAID"
                  const isRefundPending = (ord.status as string) === "REFUND_PENDING"
                  const isRefunded = ord.status === "REFUNDED"
                  const isPartiallyRefunded = ord.status === "PARTIALLY_REFUNDED"
                  const isCancelled = ord.status === "CANCELLED"

                  return (
                    <tr key={ord.id} className="hover:bg-surface-container-low/50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-primary">
                        {ord.orderCode || ord.id}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant text-xs">
                        {ord.createdAt
                          ? new Date(ord.createdAt).toLocaleString("vi-VN")
                          : "Mới tạo"}
                      </td>
                      <td className="px-6 py-4 font-bold text-on-surface">
                        {(ord.totalAmount || 0).toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isPaid
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : isPending
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : isRefundPending
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : isRefunded || isPartiallyRefunded
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : isCancelled
                                      ? "bg-red-50 text-red-700 border border-red-200"
                                      : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {isPaid
                            ? "Đã thanh toán"
                            : isPending
                              ? "Chờ thanh toán"
                              : isRefundPending
                                ? "Chờ hoàn tiền"
                                : isRefunded
                                  ? "Đã hoàn tiền"
                                  : isPartiallyRefunded
                                    ? "Hoàn một phần"
                                    : isCancelled
                                      ? "Đã hủy"
                                      : isExpired
                                        ? "Hết hạn"
                                        : ord.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForDetail(ord)}
                          className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-lg transition cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="size-3.5" />
                          <span>Chi tiết</span>
                        </button>

                        {isPending && ord.id && (
                          <>
                            <Link
                              href={`/payment?orderId=${ord.id}&orderCode=${ord.orderCode}&amount=${ord.totalAmount}`}
                              className="inline-block px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover transition shadow-xs"
                            >
                              Thanh toán
                            </Link>
                            <button
                              type="button"
                              onClick={() => setOrderToCancel(ord)}
                              disabled={cancellingOrderId === ord.id}
                              className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
                            >
                              Hủy
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {selectedOrderForDetail && (
        <OrderDetailDialog
          order={selectedOrderForDetail}
          isOpen={Boolean(selectedOrderForDetail)}
          onClose={() => setSelectedOrderForDetail(null)}
          onRequestCancel={(orderId) => {
            const found = orders.find((o) => o.id === orderId)
            if (found) setOrderToCancel(found)
          }}
        />
      )}

      {orderToCancel && (
        <CancelOrderDialog
          orderCode={orderToCancel.orderCode || orderToCancel.id}
          isOpen={Boolean(orderToCancel)}
          isCancelling={cancellingOrderId === orderToCancel.id}
          onConfirm={handleConfirmCancel}
          onClose={() => setOrderToCancel(null)}
        />
      )}
    </div>
  )
}
