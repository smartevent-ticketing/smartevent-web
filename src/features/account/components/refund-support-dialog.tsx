"use client"

import { useEffect, useState, type FormEvent } from "react"
import { ordersApi } from "@/features/orders"
import { getApiErrorMessage } from "@/lib/api/result"
import type { components } from "@/lib/api/schema"

type Review = components["schemas"]["BuyerRefundReviewResponse"]

const statusLabel: Record<string, string> = {
  REQUIRED: "Đã tiếp nhận",
  IN_REVIEW: "Đang kiểm tra",
  REFUNDED_CONFIRMED: "Admin đã xác nhận hoàn tiền",
  CLOSED_NO_REFUND: "Đã đóng, không hoàn tiền",
}

export function RefundSupportDialog({
  orderId,
  orderCode,
  onClose,
}: {
  orderId: string
  orderCode: string
  onClose: () => void
}) {
  const [review, setReview] = useState<Review | null>(null)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ordersApi
      .getRefundReview(orderId)
      .then((response) => {
        if (active) setReview(response.data?.data ?? null)
      })
      .catch((failure) => {
        if (active) setError(getApiErrorMessage(failure, "Không tải được yêu cầu hỗ trợ."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [orderId])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const detail = reason.trim()
    if (detail.length < 10 || detail.length > 200) {
      setError("Vui lòng mô tả từ 10 đến 200 ký tự.")
      return
    }
    setSending(true)
    setError(null)
    try {
      const response = await ordersApi.requestRefundReview(orderId, detail)
      setReview(response.data?.data ?? null)
    } catch (failure) {
      setError(getApiErrorMessage(failure, "Không gửi được yêu cầu hỗ trợ."))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Hỗ trợ hoàn tiền"
        className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
      >
        <div>
          <h3 className="text-lg font-bold">Hỗ trợ thanh toán và hoàn tiền</h3>
          <p className="text-sm text-on-surface-variant">Đơn hàng {orderCode}</p>
        </div>
        <p className="text-sm text-on-surface-variant">
          Admin sẽ kiểm tra và cập nhật kết quả. Gửi yêu cầu này không tự hoàn tiền hoặc hủy vé.
        </p>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        {loading ? (
          <p role="status" className="text-sm">
            Đang tải hồ sơ...
          </p>
        ) : review ? (
          <div className="p-4 bg-surface-container-low rounded-xl space-y-2 text-sm">
            <p>
              <strong>Trạng thái:</strong> {statusLabel[review.status ?? ""] ?? review.status}
            </p>
            <p>
              <strong>Lý do:</strong> {review.reason?.replace(/^CUSTOMER_REQUEST: /, "")}
            </p>
            {review.resolutionNote && (
              <p>
                <strong>Phản hồi Admin:</strong> {review.resolutionNote}
              </p>
            )}
            {review.evidenceReference && (
              <p>
                <strong>Mã đối soát:</strong> {review.evidenceReference}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <label htmlFor="refund-support-reason" className="block text-sm font-semibold">
              Mô tả vấn đề
            </label>
            <textarea
              id="refund-support-reason"
              required
              minLength={10}
              maxLength={200}
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Ví dụ: Sự kiện bị hủy, tôi cần được hỗ trợ kiểm tra khoản thanh toán..."
              className="w-full border border-outline-variant rounded-xl p-3 text-sm"
            />
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {sending ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </form>
        )}
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl text-sm">
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
