"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Asterisk,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Shield,
  User,
  X,
} from "lucide-react"

import { useAuth } from "@/features/auth"
import { UserAvatar } from "@/components/ui/user-avatar"
import { catalogUrl } from "@/features/catalog/model"

export function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, avatarUrl, isAuthenticated, isLoading, hasRole, logout } = useAuth()
  const [headerQuery, setHeaderQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Chữ cái đầu tiên cho avatar placeholder
  const avatarInitial = user?.fullName?.charAt(0)?.toUpperCase() ?? "U"

  return (
    <header className="sticky top-0 z-50 w-full bg-[#151521]/95 text-[#f8f2ed] backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-[72px] px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-xl sm:text-2xl font-extrabold tracking-[-0.06em] text-[#f8f2ed] hover:text-[#ff9479] transition"
          >
            <span className="bg-[#ff8063] text-[#261621] p-1.5 rounded-[10px_16px_10px_16px]">
              <Asterisk className="size-5" strokeWidth={3} />
            </span>
            <span>SmartEvent</span>
          </Link>
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={
              pathname === "/"
                ? "border-b-2 border-[#ff9479] pb-1 font-semibold text-[#ff9479]"
                : "text-[#c1bdc9] transition hover:text-white"
            }
          >
            Khám phá
          </Link>
          <Link
            href="/events"
            aria-current={pathname.startsWith("/events") ? "page" : undefined}
            className={
              pathname.startsWith("/events")
                ? "border-b-2 border-[#ff9479] pb-1 font-semibold text-[#ff9479]"
                : "text-[#c1bdc9] transition hover:text-white"
            }
          >
            Sự kiện
          </Link>
          {isAuthenticated && (
            <Link href="/account" className="text-[#c1bdc9] hover:text-white transition">
              Vé của tôi
            </Link>
          )}
          {hasRole("ORGANIZER") && (
            <Link href="/organizer" className="text-[#c1bdc9] hover:text-white transition">
              Dành cho BTC
            </Link>
          )}
        </nav>

        {/* Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Search bar */}
          <form
            className="relative"
            onSubmit={(event) => {
              event.preventDefault()
              router.push(catalogUrl({ q: headerQuery }))
            }}
          >
            <button
              type="submit"
              aria-label="Tìm sự kiện"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa6b7] cursor-pointer"
            >
              <Search className="size-4" />
            </button>
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện, nghệ sĩ..."
              value={headerQuery}
              onChange={(event) => setHeaderQuery(event.target.value)}
              className="w-56 pl-10 pr-4 py-2 text-sm bg-white/5 border border-white/20 rounded-full text-white placeholder:text-[#aaa6b7] focus:outline-none focus:ring-2 focus:ring-[#ff9479] focus:border-transparent transition"
            />
          </form>

          {/* Auth buttons / User menu */}
          {isLoading ? (
            <div className="w-20 h-9 bg-white/10 rounded-xl animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              >
                <UserAvatar
                  src={avatarUrl}
                  name={user.fullName}
                  initials={avatarInitial}
                  className="flex size-8 items-center justify-center rounded-full bg-[#ff8063] text-xs font-bold text-[#261621]"
                />
                <span className="max-w-[120px] truncate hidden lg:inline">{user.fullName}</span>
                <ChevronDown className="size-3.5 text-[#aaa6b7]" />
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <>
                  {/* Overlay để đóng menu khi click ra ngoài */}
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#242331] border border-white/15 rounded-xl shadow-2xl z-50 py-2">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                      <p className="text-xs text-[#aaa6b7] truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#e7e2ea] hover:bg-white/10 transition"
                    >
                      <User className="size-4" />
                      Tài khoản
                    </Link>

                    {hasRole("ORGANIZER") && (
                      <Link
                        href="/organizer"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#e7e2ea] hover:bg-white/10 transition"
                      >
                        <LayoutDashboard className="size-4" />
                        Quản lý sự kiện
                      </Link>
                    )}

                    {hasRole("ADMIN") && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#e7e2ea] hover:bg-white/10 transition"
                      >
                        <Shield className="size-4" />
                        Quản trị hệ thống
                      </Link>
                    )}

                    <div className="border-t border-white/10 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false)
                          logout()
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-[#ff9b91] hover:bg-white/10 transition cursor-pointer"
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
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-[#f8f2ed] hover:bg-white/10 rounded-xl transition"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-[#261621] bg-[#ff8063] hover:bg-[#ff9b83] rounded-xl shadow-xs transition"
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
            className="p-2 text-white hover:text-[#ff9479] focus:outline-none cursor-pointer"
            aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#1e1d2a] px-4 pt-2 pb-6 space-y-3">
          <form
            className="relative mb-4"
            onSubmit={(event) => {
              event.preventDefault()
              setMobileMenuOpen(false)
              router.push(catalogUrl({ q: headerQuery }))
            }}
          >
            <button
              type="submit"
              aria-label="Tìm sự kiện"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa6b7] cursor-pointer"
            >
              <Search className="size-4" />
            </button>
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện..."
              value={headerQuery}
              onChange={(event) => setHeaderQuery(event.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white/5 border border-white/20 rounded-full text-white placeholder:text-[#aaa6b7] focus:outline-none focus:ring-2 focus:ring-[#ff9479]"
            />
          </form>
          <nav className="flex flex-col space-y-3 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-[#ff9479] font-semibold rounded-lg hover:bg-white/10"
            >
              Khám phá
            </Link>
            <Link
              href="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-white hover:bg-white/10 rounded-lg"
            >
              Tất cả sự kiện
            </Link>
            {isAuthenticated && (
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 text-white hover:bg-white/10 rounded-lg"
              >
                Vé của tôi
              </Link>
            )}
            {hasRole("ORGANIZER") && (
              <Link
                href="/organizer"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 text-white hover:bg-white/10 rounded-lg"
              >
                Dành cho Ban tổ chức
              </Link>
            )}
            {hasRole("ADMIN") && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 text-white hover:bg-white/10 rounded-lg"
              >
                Quản trị hệ thống
              </Link>
            )}
          </nav>

          {/* Auth section */}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 px-2 py-2">
                  <UserAvatar
                    src={avatarUrl}
                    name={user.fullName}
                    initials={avatarInitial}
                    className="flex size-9 items-center justify-center rounded-full bg-[#ff8063] text-sm font-bold text-[#261621]"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                    <p className="text-xs text-[#aaa6b7] truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    logout()
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold text-[#ff9b91] border border-white/20 rounded-xl hover:bg-white/10 transition cursor-pointer"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold text-[#ff9479] border border-[#ff9479]/40 rounded-xl"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold text-[#261621] bg-[#ff8063] rounded-xl"
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
