"use client"

import { AlertTriangle, CheckCheck, Clock3, Inbox, Loader2, RotateCcw } from "lucide-react"
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
  const stats = [
    {
      label: "Đang chờ",
      value: outboxStats?.pendingCount ?? pendingOutbox.length,
      icon: Clock3,
      color: "text-[#b87a38]",
      background: "bg-[#fff4e6]",
    },
    {
      label: "Đã gửi",
      value: outboxStats?.publishedCount ?? 0,
      icon: CheckCheck,
      color: "text-[#257555]",
      background: "bg-[#eaf7ee]",
    },
    {
      label: "Gặp lỗi",
      value: outboxStats?.failedCount ?? failedOutbox.length,
      icon: AlertTriangle,
      color: "text-[#b7474f]",
      background: "bg-[#fff0f1]",
    },
  ]

  return (
    <div className="space-y-7">
      <ActionFeedback message={notification} onDismiss={() => setNotification(null)} />
      {isLoadingOutbox ? (
        <div
          role="status"
          className="admin-card flex items-center justify-center gap-2 py-16 text-sm text-[#756d77]"
        >
          <Loader2 className="size-4 animate-spin text-[#bd443a]" /> Đang tải thông báo...
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map(({ label, value, icon: Icon, color, background }) => (
              <div key={label} className="admin-card flex items-center gap-4 p-5">
                <span
                  className={
                    "flex size-12 items-center justify-center rounded-2xl " +
                    color +
                    " " +
                    background
                  }
                >
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-2xl font-extrabold tabular-nums">
                    {value.toLocaleString("vi-VN")}
                  </p>
                  <p className="text-xs font-semibold text-[#756d77]">{label}</p>
                </div>
              </div>
            ))}
          </div>
          <section className="admin-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee6e1] px-5 py-5 sm:px-7">
              <div>
                <p className="admin-kicker">Cần can thiệp</p>
                <h2 className="mt-1 text-lg font-extrabold">
                  Thông điệp gửi lỗi ({failedOutbox.length})
                </h2>
                <p className="mt-1 text-xs text-[#756d77]">
                  Kiểm tra trước khi gửi lại để tránh lặp thông báo.
                </p>
              </div>
              <Inbox className="size-5 text-[#bd443a]" />
            </div>
            {failedOutbox.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#eaf7ee] text-[#257555]">
                  <CheckCheck className="size-6" />
                </span>
                <p className="mt-4 text-sm font-bold">Chưa có thông điệp gửi lỗi</p>
                <p className="mt-1 text-xs text-[#756d77]">
                  Các thông điệp trong hộp thư đi đang được xử lý bình thường.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="admin-table min-w-[700px]">
                  <thead>
                    <tr>
                      <th>Outbox ID</th>
                      <th>Loại sự kiện</th>
                      <th>Trạng thái</th>
                      <th>Thời gian</th>
                      <th className="text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failedOutbox.map((task) => (
                      <tr key={task.id}>
                        <td className="max-w-64 break-all font-mono text-[11px] text-[#756d77]">
                          {task.id}
                        </td>
                        <td className="font-semibold">{task.aggregateType || "OUTBOX_EVENT"}</td>
                        <td>
                          <span className="rounded-full bg-[#fff0f1] px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#b7474f]">
                            Gửi lỗi
                          </span>
                        </td>
                        <td className="whitespace-nowrap text-[#756d77]">
                          {task.createdAt
                            ? new Date(task.createdAt).toLocaleString("vi-VN")
                            : "Gần đây"}
                        </td>
                        <td className="text-right">
                          {task.id && (
                            <button
                              type="button"
                              onClick={() => handleRetryOutbox(task.id!)}
                              disabled={retryingId === task.id}
                              className="admin-secondary-button !min-h-0 !py-2"
                            >
                              <RotateCcw className="size-3.5" />
                              {retryingId === task.id ? "Đang gửi..." : "Gửi lại"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
