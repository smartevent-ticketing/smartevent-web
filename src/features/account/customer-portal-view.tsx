"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowUpRight,
  CreditCard,
  FileText,
  LogOut,
  ShieldCheck,
  Ticket,
  UserRound,
} from "lucide-react"

import { useAuth } from "@/features/auth"
import { UserAvatar } from "@/components/ui/user-avatar"
import { CustomerTicketsPanel } from "./components/tickets-panel"
import { CustomerOrdersPanel } from "./components/orders-panel"
import { CustomerInvoicesPanel } from "./components/invoices-panel"
import { CustomerProfilePanel } from "./components/profile-panel"

type AccountTab = "tickets" | "orders" | "invoices" | "profile"

const sections = [
  {
    id: "tickets",
    label: "Vé của tôi",
    title: "Vé của tôi",
    description: "Lưu giữ vé điện tử và mã QR cho những sự kiện bạn tham gia.",
    icon: Ticket,
  },
  {
    id: "orders",
    label: "Đơn hàng",
    title: "Lịch sử đơn hàng",
    description: "Theo dõi thanh toán và xem lại từng lần đặt vé.",
    icon: CreditCard,
  },
  {
    id: "invoices",
    label: "Hóa đơn",
    title: "Hóa đơn điện tử",
    description: "Tra cứu, tải xuống và gửi lại hóa đơn của bạn.",
    icon: FileText,
  },
  {
    id: "profile",
    label: "Hồ sơ cá nhân",
    title: "Hồ sơ cá nhân",
    description: "Thông tin liên hệ, vai trò và trạng thái tài khoản.",
    icon: UserRound,
  },
] as const

export function CustomerPortalView() {
  const { user, avatarUrl, logout, hasRole } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const requested = searchParams.get("tab")
  const activeTab: AccountTab =
    requested === "orders" || requested === "invoices" || requested === "profile"
      ? requested
      : "tickets"
  const current = sections.find((section) => section.id === activeTab) ?? sections[0]
  const role = hasRole("ADMIN")
    ? "Quản trị viên"
    : hasRole("ORGANIZER")
      ? "Ban tổ chức"
      : "Thành viên"
  const initials = (user?.fullName || user?.email || "S")
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
  const greetingName =
    user?.fullName
      ?.trim()
      .replace(/[).,!?\s]+$/u, "")
      .split(/\s+/u)
      .at(-1) || "bạn"

  function selectTab(tab: AccountTab) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace("/account?" + params.toString(), { scroll: false })
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="border-b border-outline-variant bg-white text-on-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8 lg:py-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Tài khoản / SmartEvent
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Xin chào, {greetingName}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-on-surface-variant">
              Mọi tấm vé, đơn hàng và thông tin tài khoản ở cùng một nơi.
            </p>
          </div>
          <div className="flex min-w-0 items-center gap-4 rounded-xl border border-outline-variant bg-surface/60 p-4 md:max-w-sm">
            <UserAvatar
              src={avatarUrl}
              name={user?.fullName}
              initials={initials}
              className="flex size-14 items-center justify-center rounded-2xl bg-primary-container text-xl font-bold text-primary"
            />
            <div className="min-w-0">
              <p className="truncate font-bold">{user?.fullName || "Tài khoản SmartEvent"}</p>
              <p className="mt-0.5 truncate text-xs text-on-surface-variant">{user?.email}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-on-surface-variant">
                <ShieldCheck className="size-3" /> {role}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:px-8 lg:py-10">
        <aside className="rounded-2xl border border-outline-variant bg-white p-3 shadow-sm lg:sticky lg:top-24">
          <p className="px-4 pb-2 pt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
            Tài khoản của tôi
          </p>
          <nav aria-label="Quản lý tài khoản" className="flex gap-1 overflow-x-auto lg:flex-col">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => selectTab(section.id)}
                  aria-current={activeTab === section.id ? "page" : undefined}
                  className={
                    "inline-flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition lg:w-full " +
                    (activeTab === section.id
                      ? "bg-primary-container text-primary"
                      : "text-on-surface-variant hover:bg-surface hover:text-on-surface")
                  }
                >
                  <Icon className="size-4 shrink-0" />
                  {section.label}
                </button>
              )
            })}
          </nav>
          <div className="mt-3 hidden border-t border-outline-variant px-2 pt-3 lg:block">
            <Link
              href="/events"
              className="flex items-center justify-between rounded-xl bg-on-surface px-4 py-3 text-sm font-semibold text-white transition hover:bg-on-surface/90"
            >
              Khám phá sự kiện <ArrowUpRight className="size-4 text-white/80" />
            </Link>
            <button
              type="button"
              onClick={logout}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50"
            >
              <LogOut className="size-4" /> Đăng xuất
            </button>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 px-1">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-on-surface">{current.title}</h2>
              <p className="mt-1 text-sm text-on-surface-variant">{current.description}</p>
            </div>
          </div>
          {activeTab === "tickets" && <CustomerTicketsPanel />}
          {activeTab === "orders" && <CustomerOrdersPanel />}
          {activeTab === "invoices" && <CustomerInvoicesPanel />}
          {activeTab === "profile" && <CustomerProfilePanel />}
          <div className="mt-6 flex justify-center gap-4 text-xs lg:hidden">
            <Link href="/events" className="font-semibold text-primary">
              Khám phá sự kiện
            </Link>
            <button type="button" onClick={logout} className="font-semibold text-red-700">
              Đăng xuất
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
