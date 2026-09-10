"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Shield,
  Ticket,
  User,
  X,
} from "lucide-react"

import { useAuth } from "@/features/auth"

export function SiteHeader() {
  const { user, isAuthenticated, isLoading, hasRole, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Chữ cái đầu tiên cho avatar placeholder
  const avatarInitial = user?.fullName?.charAt(0)?.toUpperCase() ?? "U"

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-outline-variant shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-[72px] px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl sm:text-2xl font-bold tracking-tight text-primary hover:opacity-90 transition"
          >
            <span className="bg-primary text-white p-1.5 rounded-lg">
              <Ticket className="size-5" />
            </span>
            <span>SMART EVENT</span>
          </Link>
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="text-primary font-semibold border-b-2 border-primary pb-1">
            Khám phá
          </Link>
          <Link href="/events" className="text-on-surface-variant hover:text-primary transition">
            Sự kiện
          </Link>
          {isAuthenticated && (
            <Link href="/account" className="text-on-surface-variant hover:text-primary transition">
              Vé của tôi
            </Link>
          )}
          {hasRole("ORGANIZER") && (
            <Link
              href="/organizer"
              className="text-on-surface-variant hover:text-primary transition"
            >
              Dành cho BTC
            </Link>
          )}
        </nav>

        {/* Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện, nghệ sĩ..."
              className="w-56 pl-10 pr-4 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          {/* Auth buttons / User menu */}
          {isLoading ? (
            <div className="w-20 h-9 bg-gray-100 rounded-xl animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-on-surface hover:bg-surface-container-low rounded-xl transition cursor-pointer"
              >
                <span className="size-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                  {avatarInitial}
                </span>
                <span className="max-w-[120px] truncate hidden lg:inline">{user.fullName}</span>
                <ChevronDown className="size-3.5 text-on-surface-variant" />
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <>
                  {/* Overlay để đóng menu khi click ra ngoài */}
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-outline-variant rounded-xl shadow-lg z-50 py-2">
                    <div className="px-4 py-2 border-b border-outline-variant">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-surface-container-low transition"
                    >
                      <User className="size-4" />
                      Tài khoản
                    </Link>

                    {hasRole("ORGANIZER") && (
                      <Link
                        href="/organizer"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-surface-container-low transition"
                      >
                        <LayoutDashboard className="size-4" />
                        Quản lý sự kiện
                      </Link>
                    )}

                    {hasRole("ADMIN") && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-surface-container-low transition"
                      >
                        <Shield className="size-4" />
                        Quản trị hệ thống
                      </Link>
                    )}

                    <div className="border-t border-outline-variant mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false)
                          logout()
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <LogOut className="size-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-low rounded-xl transition"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-on-surface hover:text-primary focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-outline-variant bg-white px-4 pt-2 pb-6 space-y-3">
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <nav className="flex flex-col space-y-3 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-primary font-semibold rounded-lg hover:bg-surface-container-low"
            >
              Khám phá
            </Link>
            <Link
              href="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-on-surface hover:bg-surface-container-low rounded-lg"
            >
              Tất cả sự kiện
            </Link>
            {isAuthenticated && (
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 text-on-surface hover:bg-surface-container-low rounded-lg"
              >
                Vé của tôi
              </Link>
            )}
            {hasRole("ORGANIZER") && (
              <Link
                href="/organizer"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 text-on-surface hover:bg-surface-container-low rounded-lg"
              >
                Dành cho Ban tổ chức
              </Link>
            )}
            {hasRole("ADMIN") && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 text-on-surface hover:bg-surface-container-low rounded-lg"
              >
                Quản trị hệ thống
              </Link>
            )}
          </nav>

          {/* Auth section */}
          <div className="pt-2 border-t border-outline-variant flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 px-2 py-2">
                  <span className="size-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {avatarInitial}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    logout()
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition cursor-pointer"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold text-primary border border-primary/30 rounded-xl"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold text-white bg-primary rounded-xl"
                >
                  Đăng ký tài khoản
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
