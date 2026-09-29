"use client"

import { ArrowUpRight, CalendarDays, CircleDollarSign, Ticket, TrendingUp } from "lucide-react"
import type { ReactNode } from "react"
import type { DashboardKpisProps } from "./dashboard-types"

function MetricCard({
  icon,
  label,
  value,
  note,
  color,
  background,
  loading,
  footer,
}: {
  icon: ReactNode
  label: string
  value: string
  note: string
  color: string
  background: string
  loading: boolean
  footer?: ReactNode
}) {
  return (
    <div className="workspace-card flex min-h-49 flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold text-[#756d77]">{label}</p>
        <span
          className={
            "flex size-10 shrink-0 items-center justify-center rounded-2xl " +
            color +
            " " +
            background
          }
        >
          {icon}
        </span>
      </div>
      <div>
        <p className="mt-4 break-words text-2xl font-extrabold tracking-tight tabular-nums text-[#251f29] sm:text-3xl">
          {loading ? "—" : value}
        </p>
        <p className="mt-1 text-xs leading-5 text-[#837780]">{note}</p>
      </div>
      {footer && (
        <div className="mt-4 border-t border-[#eee6e1] pt-3 text-xs font-semibold text-[#756d77]">
          {footer}
        </div>
      )}
    </div>
  )
}

export function DashboardKpis({
  isLoading,
  totalEvents,
  publishedCount,
  pendingCount,
  draftCount,
  completedCount,
  totalRevenue,
  totalSold,
  totalCapacity,
  totalHeld,
  overallOccupancyRate,
  avgRevenuePerSoldTicket,
  setActiveSection,
}: DashboardKpisProps) {
  return (
    <section aria-label="Chỉ số sự kiện" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={<CircleDollarSign className="size-5" />}
        label="Ước tính doanh thu vé"
        value={totalRevenue.toLocaleString("vi-VN") + " ₫"}
        note="Tạm tính từ vé đã bán và giá đợt bán"
        color="text-[#257555]"
        background="bg-[#eaf7ee]"
        loading={isLoading}
        footer={<>Trung bình {avgRevenuePerSoldTicket.toLocaleString("vi-VN")} ₫ / vé</>}
      />
      <MetricCard
        icon={<Ticket className="size-5" />}
        label="Vé đã bán / phát hành"
        value={totalSold.toLocaleString("vi-VN") + " / " + totalCapacity.toLocaleString("vi-VN")}
        note={overallOccupancyRate + "% số vé đã được bán"}
        color="text-[#b95b44]"
        background="bg-[#fff1e9]"
        loading={isLoading}
        footer={<>{totalHeld.toLocaleString("vi-VN")} vé đang được giữ chỗ</>}
      />
      <MetricCard
        icon={<CalendarDays className="size-5" />}
        label="Sự kiện đã xuất bản"
        value={publishedCount.toLocaleString("vi-VN")}
        note="Hiển thị công khai trên nền tảng"
        color="text-[#7653aa]"
        background="bg-[#f3edfa]"
        loading={isLoading}
        footer={
          <>
            {pendingCount} chờ duyệt · {draftCount} bản nháp
          </>
        }
      />
      <MetricCard
        icon={<TrendingUp className="size-5" />}
        label="Tổng sự kiện"
        value={totalEvents.toLocaleString("vi-VN")}
        note={completedCount + " sự kiện đã kết thúc"}
        color="text-[#286c8b]"
        background="bg-[#eaf4fa]"
        loading={isLoading}
        footer={
          <button
            type="button"
            onClick={() => setActiveSection("inventory")}
            className="inline-flex items-center gap-1 font-bold text-[#bd443a] hover:underline"
          >
            Xem kho vé <ArrowUpRight className="size-3.5" />
          </button>
        }
      />
    </section>
  )
}
