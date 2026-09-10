"use client"

import { useSearchParams } from "next/navigation"
import { CreditCard, FileText, LogOut, Mail, Phone, Ticket, User } from "lucide-react"
import { useAuth } from "@/features/auth"
import { useRouter } from "next/navigation"
import { CustomerTicketsPanel } from "@/features/account/components/tickets-panel"
import { CustomerOrdersPanel } from "@/features/account/components/orders-panel"
import { CustomerInvoicesPanel } from "@/features/account/components/invoices-panel"
import { CustomerProfilePanel } from "@/features/account/components/profile-panel"

export function CustomerPortalView() {
  const { user, logout, hasRole } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get("tab")
  const activeTab = tab === "orders" || tab === "invoices" || tab === "profile" ? tab : "tickets"
  function setActiveTab(tab: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace("/account?" + params.toString(), { scroll: false })
  }
  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Thông báo kết quả thao tác */}

        {/* Profile Card Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-outline-variant/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="size-16 sm:size-20 rounded-2xl bg-primary text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
              {(user?.fullName || "Khách").charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
                  {user?.fullName || "Tài khoản SmartEvent"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  {hasRole("ORGANIZER")
                    ? "Ban tổ chức"
                    : hasRole("ADMIN")
                      ? "Quản trị viên"
                      : "Khách hàng"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  <span>{user?.email || "Chưa cập nhật email"}</span>
                </span>
                {user?.phone && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="size-3.5" />
                      <span>{user.phone}</span>
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-2 border border-red-200 cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>Đăng xuất</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-px overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("tickets")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "tickets"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-primary"
            }`}
          >
            <Ticket className="size-4" />
            <span>Vé của tôi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "orders"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-primary"
            }`}
          >
            <CreditCard className="size-4" />
            <span>Lịch sử đơn hàng</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("invoices")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "invoices"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-primary"
            }`}
          >
            <FileText className="size-4" />
            <span>Hóa đơn điện tử</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-primary"
            }`}
          >
            <User className="size-4" />
            <span>Thông tin cá nhân</span>
          </button>
        </div>

        {/* TAB 1: Vé của tôi (Tickets) */}
        {activeTab === "tickets" && <CustomerTicketsPanel />}

        {/* TAB 2: Lịch sử đơn hàng (Orders) */}
        {activeTab === "orders" && <CustomerOrdersPanel />}

        {/* TAB 3: Hóa đơn điện tử (Invoices) */}
        {activeTab === "invoices" && <CustomerInvoicesPanel />}

        {/* TAB 4: Thông tin cá nhân (Profile) */}
        {activeTab === "profile" && <CustomerProfilePanel />}

        {/* MODAL QR CODE CHECK-IN */}

        {/* MODAL CHUYỂN NHƯỢNG VÉ */}
      </div>
    </div>
  )
}
