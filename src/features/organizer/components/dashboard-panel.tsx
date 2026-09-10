"use client"

import { Calendar, DollarSign, Loader2, Ticket, TrendingUp, Users } from "lucide-react"
import type { useOrganizerEvents } from "@/features/organizer/hooks/use-organizer-events"

type Props = Pick<
  ReturnType<typeof useOrganizerEvents>,
  | "events"
  | "isLoading"
  | "totalEvents"
  | "publishedCount"
  | "pendingCount"
  | "totalRevenue"
  | "totalSold"
> & { setActiveSection: (section: "dashboard" | "events" | "inventory") => void }
export function OrganizerDashboardPanel({
  events,
  isLoading,
  totalEvents,
  publishedCount,
  pendingCount,
  totalRevenue,
  totalSold,
  setActiveSection,
}: Props) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Doanh thu */}
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Tổng doanh thu</span>
            <div className="size-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-on-surface">
            {totalRevenue !== undefined
              ? `${totalRevenue.toLocaleString("vi-VN")} ₫`
              : "Chưa có báo cáo"}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-semibold">
            {totalRevenue !== undefined ? (
              <>
                <TrendingUp className="size-3.5 text-green-600" />
                <span className="text-green-600">Cập nhật theo thời gian thực</span>
              </>
            ) : (
              <span>Chờ API thống kê doanh thu</span>
            )}
          </div>
        </div>

        {/* Card 2: Vé đã bán */}
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Tổng vé đã bán</span>
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Ticket className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-on-surface">
            {totalSold !== undefined
              ? `${totalSold.toLocaleString("vi-VN")} vé`
              : "Chưa có báo cáo"}
          </div>
          <div className="text-xs text-on-surface-variant">
            {totalSold !== undefined ? "Phân bổ qua các đợt mở bán" : "Chờ API thống kê lượng vé"}
          </div>
        </div>

        {/* Card 3: Sự kiện đang chạy */}
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">
              Đang mở bán (Published)
            </span>
            <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-on-surface">{publishedCount} Sự kiện</div>
          <div className="text-xs text-on-surface-variant">
            {pendingCount} sự kiện đang chờ phê duyệt
          </div>
        </div>

        {/* Card 4: Tổng sự kiện */}
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Tổng sự kiện tạo</span>
            <div className="size-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-on-surface">{totalEvents} Sự kiện</div>
          <div className="text-xs text-primary font-semibold">Hạ tầng vé số hóa bảo mật</div>
        </div>
      </div>

      {/* Recent Events Table */}
      <div className="bg-white rounded-3xl border border-outline-variant/60 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-on-surface">Sự kiện của bạn</h3>
          <button
            type="button"
            onClick={() => setActiveSection("events")}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Xem tất cả sự kiện →
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="text-xs">Đang tải danh sách sự kiện...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="py-12 text-center text-xs text-on-surface-variant">
            Bạn chưa tạo sự kiện nào. Bấm &quot;Tạo sự kiện mới&quot; để bắt đầu!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-xs uppercase font-bold text-on-surface-variant border-b border-outline-variant/60">
                <tr>
                  <th className="px-5 py-3.5">Tên sự kiện</th>
                  <th className="px-5 py-3.5">Thời gian & Địa điểm</th>
                  <th className="px-5 py-3.5">Vé đã bán</th>
                  <th className="px-5 py-3.5">Doanh thu</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 text-xs sm:text-sm">
                {events.slice(0, 5).map((ev) => (
                  <tr key={ev.id} className="hover:bg-surface-container-low/50 transition">
                    <td className="px-5 py-4 font-bold text-on-surface">{ev.name}</td>
                    <td className="px-5 py-4 text-on-surface-variant">
                      <div>{ev.date}</div>
                      <div className="text-xs text-gray-400">{ev.venue}</div>
                    </td>
                    <td className="px-5 py-4">
                      {ev.ticketsSold !== undefined && ev.totalTickets !== undefined ? (
                        <>
                          <span className="font-bold text-on-surface">
                            {ev.ticketsSold.toLocaleString("vi-VN")}
                          </span>
                          <span className="text-gray-400">
                            {" "}
                            / {ev.totalTickets.toLocaleString("vi-VN")}
                          </span>
                        </>
                      ) : (
                        <span className="text-on-surface-variant text-xs italic">
                          Chưa có báo cáo
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold text-primary">
                      {ev.revenue !== undefined ? (
                        `${ev.revenue.toLocaleString("vi-VN")} ₫`
                      ) : (
                        <span className="text-on-surface-variant text-xs italic font-normal">
                          Chưa có báo cáo
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {ev.status === "PUBLISHED" ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                          Đang mở bán
                        </span>
                      ) : ev.status === "PENDING_APPROVAL" ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Chờ phê duyệt
                        </span>
                      ) : ev.status === "COMPLETED" ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Đã kết thúc
                        </span>
                      ) : ev.status === "CANCELLED" ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          Đã hủy
                        </span>
                      ) : ev.status === "DRAFT" ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          Bản nháp
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          {ev.status}
                        </span>
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
  )
}
