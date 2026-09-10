"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building,
  Calendar,
  Home,
  Inbox,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react"

const sections = [
  {
    href: "/admin/dashboard",
    label: "Tổng quan",
    title: "Bảng điều hành Quản trị viên",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/approvals",
    label: "Phê duyệt sự kiện",
    title: "Phê duyệt sự kiện mở bán",
    icon: Calendar,
  },
  {
    href: "/admin/categories",
    label: "Quản lý danh mục",
    title: "Quản lý danh mục sự kiện",
    icon: Tag,
  },
  {
    href: "/admin/venues",
    label: "Quản lý địa điểm",
    title: "Quản lý địa điểm tổ chức",
    icon: Building,
  },
  {
    href: "/admin/outbox",
    label: "Hộp thư đi",
    title: "Theo dõi thông báo và yêu cầu gửi lại",
    icon: Inbox,
  },
]

export function AdminWorkspace({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const active = sections.find((section) => section.href === pathname) ?? sections[0]

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row text-on-surface">
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-outline-variant/60">
        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <ShieldCheck className="size-5" />
          <span>SMART EVENT Quản trị</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Mở điều hướng"
          aria-expanded={mobileMenuOpen}
          className="p-2"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>
      <aside
        className={`w-64 bg-white border-r border-outline-variant/60 flex-col shrink-0 p-4 space-y-6 ${mobileMenuOpen ? "flex" : "hidden md:flex"}`}
      >
        <div className="px-2 pt-2">
          <div className="flex items-center gap-2 text-primary font-black text-xl tracking-tight">
            <ShieldCheck className="size-5" />
            <span>HỆ THỐNG ADMIN</span>
          </div>
          <span className="text-[11px] text-on-surface-variant uppercase tracking-wider block font-bold mt-1">
            Tổng quản trị SmartEvent
          </span>
        </div>
        <nav className="flex-1 space-y-1.5 text-sm font-semibold">
          {sections.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={active.href === href ? "page" : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${active.href === href ? "bg-primary text-white shadow-xs" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"}`}
            >
              <Icon className="size-4" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <Link
          href="/"
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-on-surface-variant hover:text-primary"
        >
          <Home className="size-4" />
          Về trang chủ khách hàng
        </Link>
      </aside>
      <main className="flex-1 p-4 sm:p-8 lg:p-10 space-y-8 overflow-y-auto">
        <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
          {active.title}
        </h1>
        {children}
      </main>
    </div>
  )
}
