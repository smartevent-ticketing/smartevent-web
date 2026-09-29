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
    <div className="min-h-screen bg-[#f7f3ef] pb-20">
      <div className="relative overflow-hidden bg-[#1b1a27] text-white">
        <div className="pointer-events-none absolute -right-20 -top-52 size-[520px] rounded-full bg-[#a94467]/30 blur-[100px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-24 pt-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8 lg:pb-28 lg:pt-16">
          <div>
            <span className="nightline-kicker">Không gian của bạn / SmartEvent</span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Xin chào, {greetingName}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#c9c4cf] sm:text-base">
              Mọi tấm vé, đơn hàng và thông tin tài khoản ở cùng một nơi.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur">
            <UserAvatar
              src={avatarUrl}
              name={user?.fullName}
              initials={initials}
              className="flex size-14 items-center justify-center rounded-2xl bg-[#ff8063] text-xl font-extrabold text-[#261621]"
            />
            <div className="min-w-0">
              <p className="truncate font-bold">{user?.fullName || "Tài khoản SmartEvent"}</p>
              <p className="mt-0.5 truncate text-xs text-[#c9c4cf]">{user?.email}</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-[#ffb19e]">
                <ShieldCheck className="size-3" /> {role}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto -mt-12 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[252px_minmax(0,1fr)] lg:items-start lg:px-8">
        <aside className="rounded-3xl border border-[#e7ddd7] bg-white p-3 shadow-xl shadow-[#291d2610] lg:sticky lg:top-24">
          <p className="px-4 pb-2 pt-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#92848a]">
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
                      ? "bg-[#bd443a]/10 text-[#a73530]"
                      : "text-[#655c63] hover:bg-[#f7f3ef] hover:text-[#231b23]")
                  }
                >
                  <Icon className="size-4 shrink-0" />
                  {section.label}
                </button>
              )
            })}
          </nav>
          <div className="mt-3 hidden border-t border-[#e7ddd7] px-2 pt-3 lg:block">
            <Link
              href="/events"
              className="flex items-center justify-between rounded-xl bg-[#231f2d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3a2c3d]"
            >
              Khám phá sự kiện <ArrowUpRight className="size-4 text-[#ffad95]" />
            </Link>
            <button
              type="button"
              onClick={logout}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#9a4b4b] transition hover:bg-[#fff1ef]"
            >
              <LogOut className="size-4" /> Đăng xuất
            </button>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 rounded-3xl border border-[#e7ddd7] bg-white px-6 py-5 shadow-sm sm:px-7">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#bd443a]">
                Quản lý tài khoản
              </span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#231b23]">
                {current.title}
              </h2>
              <p className="mt-1 text-sm text-[#74696e]">{current.description}</p>
            </div>
          </div>
          {activeTab === "tickets" && <CustomerTicketsPanel />}
          {activeTab === "orders" && <CustomerOrdersPanel />}
          {activeTab === "invoices" && <CustomerInvoicesPanel />}
          {activeTab === "profile" && <CustomerProfilePanel />}
          <div className="mt-6 flex justify-center gap-4 text-xs lg:hidden">
            <Link href="/events" className="font-semibold text-[#a73530]">
              Khám phá sự kiện
            </Link>
            <button type="button" onClick={logout} className="font-semibold text-[#9a4b4b]">
              Đăng xuất
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
