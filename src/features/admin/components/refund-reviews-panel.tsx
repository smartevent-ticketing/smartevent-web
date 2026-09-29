"use client"

import { useEffect, useState, type FormEvent } from "react"
import { ClipboardList, HandCoins, ShieldCheck, X } from "lucide-react"
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
      <div className="flex items-start gap-3 rounded-2xl border border-[#ead6c4] bg-[#fff8ef] p-4 text-sm leading-6 text-[#76543e]">
        <ShieldCheck className="mt-0.5 size-5 shrink-0" />
        <p>
          Admin kiểm tra và thực hiện chuyển tiền thủ công qua kênh thanh toán. Chỉ chọn “Đã xác
          nhận hoàn tiền” sau khi có bằng chứng giao dịch.
        </p>
      </div>
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
            aria-pressed={status === item.value}
            className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
              status === item.value
                ? "border-[#bd443a] bg-[#bd443a] text-white shadow-sm"
                : "border-[#e8ded8] bg-white text-[#6d626d] hover:border-[#bd443a]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <section className="admin-card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-[#eee6e1] px-5 py-5 sm:px-7">
          <div>
            <p className="admin-kicker">Danh sách yêu cầu</p>
            <h2 className="mt-1 text-lg font-extrabold">Hồ sơ ({totalElements})</h2>
          </div>
          <ClipboardList className="size-5 text-[#bd443a]" />
        </div>
        {loading ? (
          <p role="status" className="px-6 py-12 text-center text-sm text-[#756d77]">
            Đang tải hồ sơ...
          </p>
        ) : reviews.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-[#756d77]">
            Không có hồ sơ ở trạng thái này.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table min-w-[720px]">
              <thead>
                <tr>
                  <th className="p-3">Đơn hàng</th>
                  <th className="p-3">Số tiền</th>
                  <th className="p-3">Lý do</th>
                  <th className="p-3">Tạo lúc</th>
                  <th className="p-3">Xử lý</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
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
                        className="admin-secondary-button !min-h-0 !py-2"
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
        <div className="flex items-center justify-end gap-3 border-t border-[#eee6e1] px-5 py-4 text-xs sm:px-7">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => {
              setPage(page - 1)
              setLoading(true)
            }}
            className="admin-secondary-button !min-h-0 !py-2"
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
            className="admin-secondary-button !min-h-0 !py-2"
          >
            Sau
          </button>
        </div>
      </section>
      {selected && (
        <section className="admin-card space-y-6 p-5 sm:p-7">
          <div className="flex justify-between gap-4">
            <div>
              <p className="admin-kicker">Chi tiết xử lý</p>
              <h2 className="mt-1 text-lg font-extrabold">Hồ sơ {selected.id}</h2>
              <p className="mt-1 text-sm text-[#756d77]">
                Thanh toán: {selected.paymentId} · {statusLabel(selected.status)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Đóng hồ sơ hoàn tiền"
              className="admin-secondary-button !min-h-0 !p-2"
            >
              <X className="size-4" />
            </button>
          </div>
          <form onSubmit={(event) => void submit(event)} className="grid max-w-2xl gap-4">
            <label className="grid gap-1 text-sm font-semibold">
              Trạng thái mới
              <select
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value as RefundReviewStatus)}
                className="admin-input font-normal"
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
                className="admin-input font-normal"
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
                className="admin-input font-normal"
              />
            </label>
            <button
              type="submit"
              disabled={saving || nextStatus === selected.status || !note.trim()}
              className="admin-primary-button w-fit"
            >
              <HandCoins className="size-4" />
              {saving ? "Đang lưu..." : "Lưu quyết định"}
            </button>
          </form>
          <div>
            <h3 className="border-t border-[#eee6e1] pt-5 font-extrabold">Lịch sử xử lý</h3>
            {historyLoading ? (
              <p className="text-sm">Đang tải...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Chưa có thao tác.</p>
            ) : (
              <ol className="mt-2 space-y-3">
                {history.map((action) => (
                  <li key={action.id} className="border-l-2 border-[#bd443a] pl-3 text-sm">
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
