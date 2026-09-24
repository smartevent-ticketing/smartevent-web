"use client"

import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Send,
  ArrowRight,
  ShieldCheck,
} from "lucide-react"
import type { EventSubmissionReadiness } from "@/lib/api/event-setup-contract"

interface SubmissionReadinessCardProps {
  readiness: EventSubmissionReadiness | null
  isLoading: boolean
  isDraft: boolean
  onRefresh: () => Promise<void>
  onSwitchTab: (
    tab: "overview" | "media" | "areas" | "ticket-types" | "sale-phases" | "tickets",
  ) => void
  onSubmitForApproval: () => void
}

interface ChecklistItemMeta {
  key: keyof EventSubmissionReadiness["checklist"]
  label: string
  targetTab: "overview" | "media" | "areas" | "ticket-types" | "sale-phases" | "tickets"
  actionLabel: string
}

const CHECKLIST_ITEMS: ChecklistItemMeta[] = [
  {
    key: "hasBasicInfo",
    label: "Thông tin cơ bản (Tên, thời gian bắt đầu & kết thúc)",
    targetTab: "overview",
    actionLabel: "Kiểm tra",
  },
  {
    key: "hasVenue",
    label: "Địa điểm tổ chức sự kiện",
    targetTab: "overview",
    actionLabel: "Chọn địa điểm",
  },
  {
    key: "hasCategories",
    label: "Thuộc ít nhất một danh mục sự kiện",
    targetTab: "overview",
    actionLabel: "Chọn danh mục",
  },
  {
    key: "hasBanner",
    label: "Ảnh Banner đại diện sự kiện",
    targetTab: "media",
    actionLabel: "Tải ảnh banner",
  },
  {
    key: "hasAreas",
    label: "Cấu hình ít nhất một phân khu (Area)",
    targetTab: "areas",
    actionLabel: "Thêm khu vực",
  },
  {
    key: "hasTicketTypes",
    label: "Cấu hình ít nhất một hạng vé (Ticket Type)",
    targetTab: "ticket-types",
    actionLabel: "Thêm hạng vé",
  },
  {
    key: "hasSalePhases",
    label: "Lên lịch ít nhất một đợt mở bán (Sale Phase)",
    targetTab: "sale-phases",
    actionLabel: "Tạo đợt bán",
  },
  {
    key: "areaCapacityValid",
    label: "Sức chứa khán đài và cấu hình vé hợp lệ",
    targetTab: "areas",
    actionLabel: "Xem sức chứa",
  },
  {
    key: "draftStatus",
    label: "Sự kiện ở trạng thái Nháp (DRAFT)",
    targetTab: "overview",
    actionLabel: "Chi tiết",
  },
]

export function SubmissionReadinessCard({
  readiness,
  isLoading,
  isDraft,
  onRefresh,
  onSwitchTab,
  onSubmitForApproval,
}: SubmissionReadinessCardProps) {
  if (!isDraft || !readiness) {
    return null
  }

  const checklist = readiness.checklist || ({} as EventSubmissionReadiness["checklist"])
  const passedCount = CHECKLIST_ITEMS.filter((item) => Boolean(checklist[item.key])).length
  const totalCount = CHECKLIST_ITEMS.length
  const isReady = readiness.ready

  return (
    <div
      className={`border rounded-3xl p-6 shadow-xs space-y-4 transition ${
        isReady ? "bg-emerald-50/50 border-emerald-200" : "bg-white border-outline-variant/60"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              isReady ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary"
            }`}
          >
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-on-surface">Tiêu chuẩn kiểm duyệt sự kiện</h4>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isReady ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {passedCount}/{totalCount} tiêu chí đạt
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              {isReady
                ? "Sự kiện đã hoàn tất mọi cấu hình và đủ điều kiện gửi Ban quản trị duyệt."
                : "Vui lòng hoàn thành các tiêu chí còn thiếu trước khi gửi phê duyệt."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onRefresh()}
            disabled={isLoading}
            className="p-2 border border-outline-variant rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition cursor-pointer"
            title="Kiểm tra lại điều kiện"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {isReady && (
            <button
              type="button"
              onClick={onSubmitForApproval}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <Send className="size-3.5" />
              <span>Gửi duyệt ngay</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isReady ? "bg-emerald-600" : "bg-primary"
          }`}
          style={{ width: `${(passedCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Blockers Alert (if not ready) */}
      {!isReady && readiness.blockers && readiness.blockers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <AlertCircle className="size-4 text-amber-600 shrink-0" />
            <span>Cần khắc phục {readiness.blockers.length} mục trước khi gửi duyệt:</span>
          </div>
          <ul className="text-xs text-amber-800 space-y-1 pl-6 list-disc">
            {readiness.blockers.map((b, idx) => (
              <li key={idx}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
        {CHECKLIST_ITEMS.map((item) => {
          const isPassed = Boolean(checklist[item.key])

          return (
            <div
              key={item.key}
              className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 transition ${
                isPassed
                  ? "bg-emerald-50/40 border-emerald-200/60 text-emerald-950"
                  : "bg-surface-container-low/60 border-outline-variant/60 text-on-surface"
              }`}
            >
              <div className="flex items-center gap-2">
                {isPassed ? (
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="size-4 text-red-500 shrink-0" />
                )}
                <span className={`font-medium ${isPassed ? "" : "text-on-surface"}`}>
                  {item.label}
                </span>
              </div>

              {!isPassed && (
                <button
                  type="button"
                  onClick={() => onSwitchTab(item.targetTab)}
                  className="text-[11px] font-bold text-primary hover:underline shrink-0 inline-flex items-center gap-0.5 cursor-pointer ml-1"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="size-3" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
