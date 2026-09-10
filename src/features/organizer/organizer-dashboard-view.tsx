"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  Calendar,
  FileSpreadsheet,
  Home,
  Menu,
  Plus,
  RefreshCw,
  Ticket,
  X,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/features/auth"
import { useOrganizerEvents } from "@/features/organizer/hooks/use-organizer-events"
import { OrganizerDashboardPanel } from "@/features/organizer/components/dashboard-panel"
import { OrganizerEventsPanel } from "@/features/organizer/components/events-panel"
import { OrganizerInventoryPanel } from "@/features/organizer/components/inventory-panel"

export function OrganizerDashboardView() {
  const { isAuthenticated, isLoading: isAuthLoading, hasRole } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const isOrganizer = hasRole("ORGANIZER") || hasRole("ADMIN")

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        router.replace("/login?callbackUrl=" + encodeURIComponent(pathname))
      } else if (!isOrganizer) {
        router.replace("/")
      }
    }
  }, [isAuthLoading, isAuthenticated, isOrganizer, router, pathname])
  const activeSection =
    pathname === "/organizer/inventory"
      ? "inventory"
      : pathname === "/organizer/events"
        ? "events"
        : "dashboard"
  function setActiveSection(section: "dashboard" | "events" | "inventory") {
    router.push(section === "dashboard" ? "/organizer/dashboard" : "/organizer/" + section)
    setMobileMenuOpen(false)
  }
  const {
    events,
    isLoading,
    setIsLoading,
    setRefreshTrigger,
    totalEvents,
    publishedCount,
    pendingCount,
    totalRevenue,
    totalSold,
  } = useOrganizerEvents()

  if (isAuthLoading || !isAuthenticated || !isOrganizer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-on-surface-variant font-medium">
            Đang kiểm tra quyền ban tổ chức...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row text-on-surface">
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-outline-variant/60">
        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <Ticket className="size-5" />
          <span>SMART EVENT Organizer</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-on-surface"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-64 bg-white border-r border-outline-variant/60 flex flex-col shrink-0 p-4 space-y-6 ${
          mobileMenuOpen ? "block" : "hidden md:flex"
        }`}
      >
        <div className="px-2 pt-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary font-extrabold text-xl tracking-tight"
          >
            <span className="bg-primary text-white p-1 rounded-lg">
              <Ticket className="size-4" />
            </span>
            <span>SMART EVENT</span>
          </Link>
          <span className="text-[11px] text-on-surface-variant uppercase tracking-wider block font-bold mt-1">
            Cổng Ban tổ chức
          </span>
        </div>

        <nav className="flex-1 space-y-1.5 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveSection("dashboard")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left cursor-pointer ${
              activeSection === "dashboard"
                ? "bg-primary text-white shadow-xs"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            <BarChart3 className="size-4" />
            <span>Tổng quan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("events")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left cursor-pointer ${
              activeSection === "events"
                ? "bg-primary text-white shadow-xs"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            <Calendar className="size-4" />
            <span>Quản lý sự kiện ({totalEvents})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("inventory")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left cursor-pointer ${
              activeSection === "inventory"
                ? "bg-primary text-white shadow-xs"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            <FileSpreadsheet className="size-4" />
            <span>Báo cáo tồn kho vé</span>
          </button>
        </nav>

        <div className="pt-4 border-t border-outline-variant/60 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition"
          >
            <Home className="size-4" />
            <span>Về trang chủ khách hàng</span>
          </Link>
        </div>
      </aside>

      {/* Main Workspace Content */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 space-y-8 overflow-y-auto">
        {/* Header with Title and Create Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              {activeSection === "dashboard"
                ? "Bảng điều khiển Ban tổ chức"
                : activeSection === "events"
                  ? "Danh sách sự kiện của bạn"
                  : "Báo cáo tồn kho & Doanh thu vé"}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Quản lý vận hành sự kiện, tình trạng phân phối vé và phê duyệt mở bán.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsLoading(true)
                setRefreshTrigger((prev) => prev + 1)
              }}
              className="p-2.5 rounded-xl border border-outline-variant/60 hover:bg-surface-container text-on-surface transition cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <Link
              href="/organizer/events/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-sm transition"
            >
              <Plus className="size-4" />
              <span>Tạo sự kiện mới</span>
            </Link>
          </div>
        </div>

        {/* 1. Stat Cards (Dashboard Overview) */}
        {activeSection === "dashboard" && (
          <OrganizerDashboardPanel
            events={events}
            isLoading={isLoading}
            totalEvents={totalEvents}
            publishedCount={publishedCount}
            pendingCount={pendingCount}
            totalRevenue={totalRevenue}
            totalSold={totalSold}
            setActiveSection={setActiveSection}
          />
        )}

        {/* 2. Events Management Section */}
        {activeSection === "events" && <OrganizerEventsPanel events={events} />}

        {/* 3. Inventory Section */}
        {activeSection === "inventory" && <OrganizerInventoryPanel />}
      </main>
    </div>
  )
}
