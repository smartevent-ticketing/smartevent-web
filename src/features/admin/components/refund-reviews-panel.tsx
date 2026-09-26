"use client"

import { useEffect, useState, type FormEvent } from "react"
import { ActionFeedback, type ActionMessage } from "@/components/shared/action-feedback"
import { adminApi } from "@/features/admin/api/admin-api"
import { getApiErrorMessage } from "@/lib/api/result"
import type {
  RefundReview,
  RefundReviewAction,
  RefundReviewStatus,
} from "@/lib/api/refund-review-contract"

const statuses: { value: RefundReviewStatus; label: string }[] = [
  { value: "REQUIRED", label: "Cần xử lý" },
  { value: "IN_REVIEW", label: "Đang kiểm tra" },
  { value: "REFUNDED_CONFIRMED", label: "Đã xác nhận hoàn tiền" },
  { value: "CLOSED_NO_REFUND", label: "Đóng, không hoàn tiền" },
]

const statusLabel = (status: RefundReviewStatus) =>
  statuses.find((item) => item.value === status)?.label ?? status

const dateLabel = (value: string | null) => (value ? new Date(value).toLocaleString("vi-VN") : "—")

export function RefundReviewsPanel() {
  const [status, setStatus] = useState<RefundReviewStatus>("REQUIRED")
  const [page, setPage] = useState(0)
  const [refresh, setRefresh] = useState(0)
  const [reviews, setReviews] = useState<RefundReview[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<RefundReview | null>(null)
  const [history, setHistory] = useState<RefundReviewAction[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [nextStatus, setNextStatus] = useState<RefundReviewStatus>("IN_REVIEW")
  const [note, setNote] = useState("")
  const [evidence, setEvidence] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<ActionMessage | null>(null)

  useEffect(() => {
    let active = true
    adminApi
      .listRefundReviews(status, page)
      .then(({ data }) => {
        if (!active) return
        setReviews(data?.data?.content ?? [])
        setTotalPages(data?.data?.totalPages ?? 0)
        setTotalElements(data?.data?.totalElements ?? 0)
      })
      .catch((error) => {
        if (active) {
          setReviews([])
          setTotalPages(0)
          setTotalElements(0)
          setMessage({ type: "error", text: getApiErrorMessage(error, "Không tải được hồ sơ.") })
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [status, page, refresh])

  async function selectReview(review: RefundReview) {
    setSelected(review)
    setNextStatus(review.status === "REQUIRED" ? "IN_REVIEW" : review.status)
    setNote("")
    setEvidence("")
    setHistory([])
    setHistoryLoading(true)
    try {
      const result = await adminApi.getRefundReviewHistory(review.id)
      setHistory(result.data?.data ?? [])
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Không tải được lịch sử xử lý."),
      })
    } finally {
      setHistoryLoading(false)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || !note.trim() || nextStatus === selected.status) return
    if (nextStatus === "REFUNDED_CONFIRMED" && !evidence.trim()) {
      setMessage({ type: "error", text: "Cần nhập mã giao dịch hoặc bằng chứng hoàn tiền." })
      return
    }
    setSaving(true)
    try {
      await adminApi.updateRefundReview(selected.id, {
        status: nextStatus,
        note: note.trim(),
        evidenceReference: evidence.trim() || undefined,
      })
      setMessage({ type: "success", text: "Đã cập nhật hồ sơ và lưu lịch sử thao tác." })
      setSelected(null)
      setRefresh((value) => value + 1)
    } catch (error) {
      setMessage({ type: "error", text: getApiErrorMessage(error, "Không thể cập nhật hồ sơ.") })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <ActionFeedback message={message} onDismiss={() => setMessage(null)} />
      <p className="text-sm text-on-surface-variant">
        Hệ thống chỉ ghi nhận hồ sơ và quyết định của Admin. Việc chuyển tiền hoàn được kiểm tra và
        thực hiện thủ công qua kênh thanh toán; chỉ chọn “Đã xác nhận hoàn tiền” sau khi có bằng
        chứng.
      </p>
      <div className="flex flex-wrap gap-2" aria-label="Lọc hồ sơ theo trạng thái">
        {statuses.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              setStatus(item.value)
              setPage(0)
              setSelected(null)
              setLoading(true)
            }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              status === item.value
                ? "bg-primary text-white"
                : "bg-white border border-outline-variant/60 text-on-surface-variant"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <section className="rounded-3xl border border-outline-variant/60 bg-white p-5 shadow-xs">
        <h2 className="mb-4 font-bold">Danh sách hồ sơ ({totalElements})</h2>
        {loading ? (
          <p className="text-sm text-on-surface-variant">Đang tải...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Không có hồ sơ ở trạng thái này.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-outline-variant/60 text-on-surface-variant">
                  <th className="p-3">Đơn hàng</th>
                  <th className="p-3">Số tiền</th>
                  <th className="p-3">Lý do</th>
                  <th className="p-3">Tạo lúc</th>
                  <th className="p-3">Xử lý</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id} className="border-b border-outline-variant/40">
                    <td className="p-3 font-mono text-xs">{review.orderId}</td>
                    <td className="p-3 whitespace-nowrap">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(review.amount)}
                    </td>
                    <td className="p-3">{review.reason}</td>
                    <td className="p-3 whitespace-nowrap">{dateLabel(review.createdAt)}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => void selectReview(review)}
                        className="font-semibold text-primary hover:underline"
                      >
                        Xem hồ sơ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex items-center justify-end gap-3 text-sm">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => {
              setPage(page - 1)
              setLoading(true)
            }}
            className="disabled:opacity-40"
          >
            Trước
          </button>
          <span>
            Trang {page + 1}/{Math.max(totalPages, 1)}
          </span>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={() => {
              setPage(page + 1)
              setLoading(true)
            }}
            className="disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      </section>
      {selected && (
        <section className="rounded-3xl border border-outline-variant/60 bg-white p-5 shadow-xs space-y-5">
          <div className="flex justify-between gap-4">
            <div>
              <h2 className="font-bold">Hồ sơ {selected.id}</h2>
              <p className="text-sm text-on-surface-variant">
                Thanh toán: {selected.paymentId} · {statusLabel(selected.status)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-sm text-on-surface-variant"
            >
              Đóng
            </button>
          </div>
          <form onSubmit={(event) => void submit(event)} className="grid gap-4 max-w-2xl">
            <label className="grid gap-1 text-sm font-semibold">
              Trạng thái mới
              <select
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value as RefundReviewStatus)}
                className="rounded-xl border border-outline-variant p-2 font-normal"
              >
                {statuses.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Ghi chú xử lý (bắt buộc)
              <textarea
                required
                maxLength={2000}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                className="rounded-xl border border-outline-variant p-2 font-normal"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Mã giao dịch / tham chiếu bằng chứng{" "}
              {nextStatus === "REFUNDED_CONFIRMED" ? "(bắt buộc)" : "(nếu có)"}
              <input
                value={evidence}
                onChange={(event) => setEvidence(event.target.value)}
                maxLength={200}
                required={nextStatus === "REFUNDED_CONFIRMED"}
                className="rounded-xl border border-outline-variant p-2 font-normal"
              />
            </label>
            <button
              type="submit"
              disabled={saving || nextStatus === selected.status || !note.trim()}
              className="w-fit rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
            >
              {saving ? "Đang lưu..." : "Lưu quyết định"}
            </button>
          </form>
          <div>
            <h3 className="font-semibold">Lịch sử xử lý</h3>
            {historyLoading ? (
              <p className="text-sm">Đang tải...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Chưa có thao tác.</p>
            ) : (
              <ol className="mt-2 space-y-3">
                {history.map((action) => (
                  <li key={action.id} className="border-l-2 border-primary pl-3 text-sm">
                    <p className="font-semibold">
                      {statusLabel(action.previousStatus)} → {statusLabel(action.newStatus)}
                    </p>
                    <p>{action.note}</p>
                    {action.evidenceReference && <p>Tham chiếu: {action.evidenceReference}</p>}
                    <p className="text-xs text-on-surface-variant">
                      {dateLabel(action.createdAt)} · Admin {action.adminUserId}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
