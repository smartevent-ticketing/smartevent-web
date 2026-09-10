"use client"

import { ActionFeedback } from "@/components/shared/action-feedback"
import { useAdminDashboard } from "@/features/admin/hooks/use-dashboard"

export function AdminDashboardPanel() {
  const {
    notification,
    setNotification,
    pendingEvents,
    categories,
    isLoadingCategories,
    venues,
    isLoadingVenues,
    failedOutbox,
    isLoadingOutbox,
  } = useAdminDashboard()
  return (
    <div className="space-y-6">
      <ActionFeedback message={notification} onDismiss={() => setNotification(null)} />
      <>
        {isLoadingCategories || isLoadingVenues || isLoadingOutbox ? (
          <p role="status">Đang tải tổng quan...</p>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-xs space-y-2">
                <span className="text-xs text-on-surface-variant font-semibold">
                  Sự kiện chờ phê duyệt
                </span>
                <div className="text-3xl font-black text-amber-600">{pendingEvents.length}</div>
                <span className="text-[11px] text-on-surface-variant">Cần xem xét nội dung</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-xs space-y-2">
                <span className="text-xs text-on-surface-variant font-semibold">
                  Danh mục hệ thống
                </span>
                <div className="text-3xl font-black text-primary">{categories.length}</div>
                <span className="text-[11px] text-on-surface-variant">
                  Đang hoạt động trên portal
                </span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-xs space-y-2">
                <span className="text-xs text-on-surface-variant font-semibold">
                  Địa điểm đã định danh
                </span>
                <div className="text-3xl font-black text-blue-600">{venues.length}</div>
                <span className="text-[11px] text-on-surface-variant">
                  SVĐ, Nhà hát, Trung tâm SECC
                </span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-xs space-y-2">
                <span className="text-xs text-on-surface-variant font-semibold">
                  Sự kiện Outbox lỗi (Failed)
                </span>
                <div className="text-3xl font-black text-red-600">{failedOutbox.length}</div>
                <span className="text-[11px] text-on-surface-variant">
                  Cần retry gửi lại Message Broker
                </span>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  )
}
