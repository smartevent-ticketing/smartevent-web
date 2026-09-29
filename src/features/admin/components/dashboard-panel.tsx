"use client"

import Link from "next/link"
import { ArrowRight, Building2, CalendarCheck2, Inbox, Tags } from "lucide-react"
import { ActionFeedback } from "@/components/shared/action-feedback"
import { useAdminDashboard } from "@/features/admin/hooks/use-dashboard"

export function AdminDashboardPanel() {
  const {
    notification,
    setNotification,
    pendingCount,
    isLoadingPendingEvents,
    categories,
    isLoadingCategories,
    venues,
    isLoadingVenues,
    failedOutboxCount,
    isLoadingOutbox,
  } = useAdminDashboard()
  const loading =
    isLoadingPendingEvents || isLoadingCategories || isLoadingVenues || isLoadingOutbox

  const metrics = [
    {
      label: "Chờ duyệt",
      value: pendingCount,
      detail: "Hồ sơ sự kiện",
      href: "/admin/approvals",
      icon: CalendarCheck2,
      color: "text-[#bc6147]",
      background: "bg-[#fff1e9]",
    },
    {
      label: "Danh mục",
      value: categories.length,
      detail: "Chủ đề đang có",
      href: "/admin/categories",
      icon: Tags,
      color: "text-[#7653aa]",
      background: "bg-[#f3edfa]",
    },
    {
      label: "Địa điểm",
      value: venues.length,
      detail: "Không gian tổ chức",
      href: "/admin/venues",
      icon: Building2,
      color: "text-[#286c8b]",
      background: "bg-[#eaf4fa]",
    },
    {
      label: "Gửi lỗi",
      value: failedOutboxCount,
      detail: "Thông điệp cần xử lý",
      href: "/admin/outbox",
      icon: Inbox,
      color: "text-[#b7474f]",
      background: "bg-[#fff0f1]",
    },
  ]

  return (
    <div className="space-y-7">
      <ActionFeedback message={notification} onDismiss={() => setNotification(null)} />
      <section className="relative overflow-hidden rounded-[28px] bg-[#211e2b] px-7 py-8 text-white sm:px-9 sm:py-9">
        <div className="pointer-events-none absolute -right-20 -top-36 size-[360px] rounded-full bg-[#a4486c]/30 blur-[75px]" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#ffad95]">
              Bảng điều hành
            </p>
            <h2 className="mt-3 max-w-xl text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
              Mọi hoạt động quan trọng, trong một màn hình.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#c5becc]">
              Ưu tiên duyệt sự kiện và kiểm tra các thông điệp gửi lỗi để hành trình mua vé diễn ra
              thông suốt.
            </p>
          </div>
          <Link
            href="/admin/approvals"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ff8063] px-5 py-3 text-sm font-extrabold text-[#291b25] transition hover:bg-[#ffa18a]"
          >
            Đến hàng chờ duyệt <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section aria-label="Chỉ số vận hành">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="admin-kicker">Tình hình hiện tại</p>
            <h2 className="mt-1 text-xl font-extrabold">Tổng quan nhanh</h2>
          </div>
          {loading && (
            <span role="status" className="text-xs text-[#756d77]">
              Đang cập nhật...
            </span>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, detail, href, icon: Icon, color, background }) => (
            <Link
              key={href}
              href={href}
              className="admin-card group flex min-h-44 flex-col justify-between p-5 transition hover:-translate-y-0.5 hover:border-[#d6aaa0] hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={
                    "flex size-11 items-center justify-center rounded-2xl " +
                    background +
                    " " +
                    color
                  }
                >
                  <Icon className="size-5" />
                </span>
                <ArrowRight className="size-4 text-[#b1a6ad] transition group-hover:translate-x-1 group-hover:text-[#bd443a]" />
              </div>
              <div>
                <p className="text-3xl font-extrabold tracking-tight tabular-nums">
                  {loading ? "—" : value.toLocaleString("vi-VN")}
                </p>
                <p className="mt-1 text-sm font-bold">{label}</p>
                <p className="mt-0.5 text-xs text-[#837780]">{detail}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Link
          href="/admin/refund-reviews"
          className="admin-card group flex items-center justify-between gap-5 p-6 transition hover:border-[#d6aaa0]"
        >
          <div>
            <p className="admin-kicker">Hỗ trợ khách hàng</p>
            <h3 className="mt-2 text-lg font-extrabold">Hồ sơ hoàn tiền</h3>
            <p className="mt-1 text-sm leading-6 text-[#756d77]">
              Xem yêu cầu, ghi chú xử lý và xác nhận hoàn tiền khi đã có bằng chứng.
            </p>
          </div>
          <ArrowRight className="size-5 shrink-0 text-[#bd443a] transition group-hover:translate-x-1" />
        </Link>
        <Link
          href="/admin/outbox"
          className="admin-card group flex items-center justify-between gap-5 p-6 transition hover:border-[#d6aaa0]"
        >
          <div>
            <p className="admin-kicker">Thông báo hệ thống</p>
            <h3 className="mt-2 text-lg font-extrabold">Theo dõi hộp thư đi</h3>
            <p className="mt-1 text-sm leading-6 text-[#756d77]">
              Kiểm tra số thông điệp đang chờ, đã gửi và gặp lỗi.
            </p>
          </div>
          <ArrowRight className="size-5 shrink-0 text-[#bd443a] transition group-hover:translate-x-1" />
        </Link>
      </section>
    </div>
  )
}
