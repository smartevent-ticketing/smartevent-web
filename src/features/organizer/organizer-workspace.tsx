"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  LogOut,
  Menu,
  Plus,
  Ticket,
  Tickets,
  X,
} from "lucide-react"
import { useAuth } from "@/features/auth"
import { UserAvatar } from "@/components/ui/user-avatar"

const sections = [
  { href: "/organizer/dashboard", label: "Tổng quan", icon: BarChart3 },
  { href: "/organizer/events", label: "Sự kiện của tôi", icon: CalendarDays },
  { href: "/organizer/inventory", label: "Kho vé", icon: Tickets },
] as const

function pageInfo(pathname: string) {
  if (pathname === "/organizer/events/new")
    return {
      active: "/organizer/events",
      label: "Tạo sự kiện",
      title: "Tạo sự kiện mới",
      description: "Hoàn thiện từng bước để chuẩn bị mở bán trên SmartEvent.",
    }
  if (pathname.startsWith("/organizer/events/"))
    return {
      active: "/organizer/events",
      label: "Chi tiết sự kiện",
      title: "Quản lý sự kiện",
      description: "Cập nhật thông tin, phân khu, vé và các đợt mở bán.",
    }
  if (pathname === "/organizer/events")
    return {
      active: "/organizer/events",
      label: "Sự kiện của tôi",
      title: "Sự kiện của tôi",
      description: "Theo dõi và quản lý toàn bộ vòng đời sự kiện.",
    }
  if (pathname === "/organizer/inventory")
    return {
      active: "/organizer/inventory",
      label: "Kho vé",
      title: "Kho vé & phân phối",
      description: "Kiểm tra vé đã bán, đang giữ và số lượng còn lại.",
    }
  return {
    active: "/organizer/dashboard",
    label: "Tổng quan",
    title: "Tổng quan Ban tổ chức",
    description: "Một nơi để theo dõi sự kiện, doanh thu và tình hình bán vé.",
  }
}

export function OrganizerWorkspace({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, hasRole, user, avatarUrl, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const info = pageInfo(pathname)
  const isOrganizer = hasRole("ORGANIZER") || hasRole("ADMIN")

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) router.replace("/login?callbackUrl=" + encodeURIComponent(pathname))
      else if (!isOrganizer) router.replace("/")
    }
  }, [isLoading, isAuthenticated, isOrganizer, pathname, router])

  if (isLoading || !isAuthenticated || !isOrganizer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4f1]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-[#ff8063] border-t-transparent" />
          <p className="text-sm font-medium text-[#756d77]">Đang kiểm tra quyền Ban tổ chức...</p>
        </div>
      </div>
    )
  }

  const name = user?.fullName || user?.email || "Ban tổ chức"
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return (
    <div className="min-h-screen bg-[#f7f4f1] text-[#251f29] lg:flex">
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-[#191824] px-4 text-white lg:hidden">
        <Link
          href="/organizer/dashboard"
          className="flex items-center gap-2 text-base font-extrabold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-[#ff8063] text-[#281922]">
            <Ticket className="size-4" />
          </span>
          SmartEvent <span className="font-medium text-[#aaa5b8]">Organizer</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Đóng điều hướng" : "Mở điều hướng"}
          aria-expanded={mobileMenuOpen}
          aria-controls="organizer-navigation"
          className="rounded-xl border border-white/15 p-2"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Đóng điều hướng"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-[#11111a]/60 lg:hidden"
        />
      )}
      <aside
        id="organizer-navigation"
        className={
          "fixed bottom-0 left-0 top-16 z-40 flex w-[280px] flex-col border-r border-white/10 bg-[#191824] px-4 pb-5 text-white shadow-2xl lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:shadow-none " +
          (mobileMenuOpen ? "" : "hidden lg:flex")
        }
      >
        <Link
          href="/organizer/dashboard"
          className="hidden items-center gap-3 px-2 pb-7 pt-8 lg:flex"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-[#ff8063] text-[#281922]">
            <Ticket className="size-5" />
          </span>
          <span>
            <strong className="block text-lg leading-5 tracking-tight">SmartEvent</strong>
            <small className="mt-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#aaa5b8]">
              Organizer studio
            </small>
          </span>
        </Link>
        <nav
          aria-label="Điều hướng Ban tổ chức"
          className="min-h-0 flex-1 space-y-1 overflow-y-auto pt-4 lg:pt-0"
        >
          <p className="px-3 pb-2 pt-4 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#8e899d]">
            Không gian làm việc
          </p>
          {sections.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={info.active === href ? "page" : undefined}
              className={
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition " +
                (info.active === href
                  ? "bg-[#ff8063] text-[#2b1b25] shadow-lg shadow-[#ff806326]"
                  : "text-[#c2bfce] hover:bg-white/8 hover:text-white")
              }
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {info.active === href && <ChevronRight className="size-3.5" />}
            </Link>
          ))}
          <p className="px-3 pb-2 pt-5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#8e899d]">
            Tạo mới
          </p>
          <Link
            href="/organizer/events/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 rounded-xl border border-white/15 px-3 py-3 text-sm font-semibold text-[#f1e9ee] transition hover:border-[#ff8063] hover:text-white"
          >
            <Plus className="size-4" />
            Tạo sự kiện
          </Link>
        </nav>
        <div className="space-y-3 border-t border-white/10 pt-5">
          <Link
            href="/"
            className="flex items-center justify-between rounded-xl border border-white/15 px-3 py-2.5 text-xs font-semibold text-[#d9d4df] transition hover:border-[#ff8063] hover:text-white"
          >
            Xem trang bán vé <ArrowUpRight className="size-4" />
          </Link>
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <Link
              href="/account?tab=profile"
              className="flex min-w-0 flex-1 items-center gap-3"
              title="Mở hồ sơ cá nhân"
            >
              <UserAvatar
                src={avatarUrl}
                name={name}
                initials={initials}
                className="flex size-9 items-center justify-center rounded-xl bg-[#45313d] text-xs font-extrabold text-[#ffb09c]"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold">{name}</span>
                <span className="mt-0.5 block text-[11px] text-[#aaa5b8]">Ban tổ chức</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={logout}
              aria-label="Đăng xuất"
              title="Đăng xuất"
              className="rounded-lg p-1.5 text-[#aaa5b8] transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="border-b border-[#e9e1dc] bg-white/75 px-4 py-4 backdrop-blur sm:px-7 lg:px-10">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8b8188]">
              <span>Ban tổ chức</span>
              <ChevronRight className="size-3.5" />
              <span className="text-[#bd443a]">{info.label}</span>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e9e1dc] bg-white px-3 py-1.5 text-[11px] font-bold text-[#655a64]">
              <span className="size-1.5 rounded-full bg-[#47a37a]" /> Không gian BTC
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] space-y-8 px-4 pb-16 pt-8 sm:px-7 lg:px-10 lg:pt-10">
          <div>
            <p className="workspace-kicker">SmartEvent / Organizer</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#251f29] sm:text-4xl">
              {info.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#756d77]">{info.description}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
