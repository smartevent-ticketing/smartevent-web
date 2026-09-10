"use client"

import { AlertTriangle, Loader2 } from "lucide-react"
import { ActionFeedback } from "@/components/shared/action-feedback"
import { useAdminOutbox } from "@/features/admin/hooks/use-outbox"

export function AdminOutboxPanel() {
  const {
    notification,
    setNotification,
    outboxStats,
    pendingOutbox,
    failedOutbox,
    isLoadingOutbox,
    retryingId,
    handleRetryOutbox,
  } = useAdminOutbox()
  return (
    <div className="space-y-6">
      <ActionFeedback message={notification} onDismiss={() => setNotification(null)} />
      <div className="space-y-6">
        {isLoadingOutbox ? (
          <div className="flex items-center justify-center py-12 text-on-surface-variant gap-2 text-sm">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>Đang tải thông tin Outbox...</span>
          </div>
        ) : (
          <>
            {/* Outbox Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-outline-variant/60 shadow-xs space-y-1">
                <span className="text-xs text-on-surface-variant font-semibold">
                  Tin nhắn đang chờ (Pending)
                </span>
                <div className="text-2xl font-black text-amber-600">
                  {outboxStats?.pendingCount ?? pendingOutbox.length}
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-outline-variant/60 shadow-xs space-y-1">
                <span className="text-xs text-on-surface-variant font-semibold">
                  Đã phát thành công (Published)
                </span>
                <div className="text-2xl font-black text-green-600">
                  {outboxStats?.publishedCount ?? 0}
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-outline-variant/60 shadow-xs space-y-1">
                <span className="text-xs text-on-surface-variant font-semibold">
                  Tin nhắn lỗi (Failed)
                </span>
                <div className="text-2xl font-black text-red-600">
                  {outboxStats?.failedCount ?? failedOutbox.length}
                </div>
              </div>
            </div>

            {/* Danh sách lỗi cần retry */}
            <div className="bg-white rounded-3xl border border-outline-variant/60 shadow-xs p-6 space-y-4">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <AlertTriangle className="size-4 text-red-600" />
                <span>Các sự kiện Outbox lỗi cần can thiệp ({failedOutbox.length})</span>
              </h3>

              {failedOutbox.length === 0 ? (
                <div className="py-8 text-center text-xs text-on-surface-variant">
                  Hiện không có tin nhắn Outbox nào bị lỗi. Toàn bộ thông điệp RabbitMQ hoạt động
                  thông suốt.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-container-low uppercase font-bold text-on-surface-variant border-b border-outline-variant/60">
                      <tr>
                        <th className="px-4 py-3">Outbox ID</th>
                        <th className="px-4 py-3">Loại sự kiện</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3">Thời gian</th>
                        <th className="px-4 py-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/40">
                      {failedOutbox.map((task) => (
                        <tr key={task.id} className="hover:bg-surface-container-low/50">
                          <td className="px-4 py-3 font-mono font-bold text-primary">{task.id}</td>
                          <td className="px-4 py-3 font-semibold text-on-surface">
                            {task.aggregateType || "OUTBOX_EVENT"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                              FAILED
                            </span>
                          </td>
                          <td className="px-4 py-3 text-on-surface-variant">
                            {task.createdAt
                              ? new Date(task.createdAt).toLocaleString("vi-VN")
                              : "Gần đây"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {task.id && (
                              <button
                                type="button"
                                onClick={() => handleRetryOutbox(task.id!)}
                                disabled={retryingId === task.id}
                                className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition cursor-pointer shadow-xs disabled:opacity-50"
                              >
                                {retryingId === task.id ? "Đang gửi..." : "Thử lại (Retry)"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
