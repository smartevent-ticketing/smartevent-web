"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, LayoutDashboard, LogOut, Menu, Search, Shield, User, X } from "lucide-react"

import { useAuth } from "@/features/auth"
import { UserAvatar } from "@/components/ui/user-avatar"
import { SmartEventMark } from "@/components/brand/smartevent-mark"
import { catalogUrl } from "@/features/catalog/model"

export function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, avatarUrl, isAuthenticated, isLoading, hasRole, logout } = useAuth()
  const [headerQuery, setHeaderQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)
  const userMenuButtonRef = useRef<HTMLButtonElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mobileMenuOpen && !userMenuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      if (mobileMenuOpen) {
        setMobileMenuOpen(false)
        mobileMenuButtonRef.current?.focus()
      } else {
        setUserMenuOpen(false)
        userMenuButtonRef.current?.focus()
      }
    }
    const closeOutsideAccount = (event: PointerEvent) => {
      if (
        userMenuOpen &&
        event.target instanceof Node &&
        !userMenuRef.current?.contains(event.target)
      ) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("keydown", closeOnEscape)
    document.addEventListener("pointerdown", closeOutsideAccount)
    return () => {
      document.removeEventListener("keydown", closeOnEscape)
      document.removeEventListener("pointerdown", closeOutsideAccount)
    }
  }, [mobileMenuOpen, userMenuOpen])

  const avatarInitial = user?.fullName?.charAt(0)?.toUpperCase() ?? "U"
  const navigation = [
    { href: "/", label: "Khám phá", active: pathname === "/" },
    { href: "/events", label: "Sự kiện", active: pathname.startsWith("/events") },
    ...(isAuthenticated
      ? [{ href: "/account", label: "Vé của tôi", active: pathname.startsWith("/account") }]
      : []),
    ...(hasRole("ORGANIZER")
      ? [{ href: "/organizer", label: "Ban tổ chức", active: pathname.startsWith("/organizer") }]
      : []),
  ]
  const focusStyle =
    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMobileMenuOpen(false)
    router.push(catalogUrl({ q: headerQuery }))
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 text-foreground backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className={`flex shrink-0 items-center gap-2.5 rounded-sm text-xl font-extrabold tracking-[-0.05em] ${focusStyle}`}
          aria-label="SmartEvent — Trang chủ"
        >
          <SmartEventMark className="size-9 shrink-0 rounded-xl shadow-sm shadow-primary/15" />
          SmartEvent
        </Link>

        <nav
          aria-label="Điều hướng chính"
          className="hidden items-center gap-6 self-stretch text-sm lg:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={`se-nav-link flex items-center border-b-2 px-0.5 font-medium transition-colors ${focusStyle} ${item.active ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <form
            role="search"
            aria-label="Tìm sự kiện"
            onSubmit={submitSearch}
            className="relative mr-1"
          >
            <button
              type="submit"
              aria-label="Tìm sự kiện"
              className={`absolute left-3 top-1/2 -translate-y-1/2 rounded-sm text-muted hover:text-primary ${focusStyle}`}
            >
              <Search className="size-4" aria-hidden="true" />
            </button>
            <input
              type="search"
              aria-label="Tìm sự kiện hoặc nghệ sĩ"
              placeholder="Tìm sự kiện..."
              value={headerQuery}
              onChange={(event) => setHeaderQuery(event.target.value)}
              className="h-10 w-44 rounded-xl border border-border bg-surface pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 xl:w-52"
            />
          </form>
          {isLoading ? (
            <div
              className="h-10 w-24 animate-pulse rounded-xl bg-surface"
              aria-label="Đang tải tài khoản"
            />
          ) : isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                ref={userMenuButtonRef}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setUserMenuOpen(!userMenuOpen)
                }}
                aria-label={`Tài khoản ${user.fullName || "của bạn"}`}
                aria-expanded={userMenuOpen}
                aria-controls="site-user-menu"
                className={`flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-2.5 text-sm font-medium transition hover:bg-surface ${focusStyle}`}
              >
                <UserAvatar
                  src={avatarUrl}
                  name={user.fullName}
                  initials={avatarInitial}
                  className="flex size-7 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-on-primary-container"
                />
                <span className="hidden max-w-[100px] truncate xl:inline">{user.fullName}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={`size-3.5 text-muted transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
              {userMenuOpen && (
                <div
                  id="site-user-menu"
                  className="se-menu-enter absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-border bg-white py-2 shadow-xl shadow-slate-900/10"
                >
                  <div className="mb-1 border-b border-border px-4 py-3">
                    <p className="truncate text-sm font-semibold">{user.fullName}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">{user.email}</p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setUserMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition hover:bg-surface ${focusStyle}`}
                  >
                    <User className="size-4 text-muted" aria-hidden="true" />
                    Tài khoản & vé
                  </Link>
                  {hasRole("ORGANIZER") && (
                    <Link
                      href="/organizer"
                      onClick={() => setUserMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition hover:bg-surface ${focusStyle}`}
                    >
                      <LayoutDashboard className="size-4 text-muted" aria-hidden="true" />
                      Quản lý sự kiện
                    </Link>
                  )}
                  {hasRole("ADMIN") && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition hover:bg-surface ${focusStyle}`}
                    >
                      <Shield className="size-4 text-muted" aria-hidden="true" />
                      Quản trị hệ thống
                    </Link>
                  )}
                  <div className="mt-1 border-t border-border pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false)
                        logout()
                      }}
                      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 transition hover:bg-red-50 ${focusStyle}`}
                    >
                      <LogOut className="size-4" aria-hidden="true" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={`se-button rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-surface ${focusStyle}`}
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className={`se-button rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover ${focusStyle}`}
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>

        <button
          ref={mobileMenuButtonRef}
          type="button"
          onClick={() => {
            setUserMenuOpen(false)
            setMobileMenuOpen(!mobileMenuOpen)
          }}
          className={`flex size-10 items-center justify-center rounded-xl border border-border bg-white text-foreground lg:hidden ${focusStyle}`}
          aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="site-mobile-menu"
        >
          <span
            aria-hidden="true"
            className={`inline-flex transition-transform duration-200 ${mobileMenuOpen ? "rotate-90" : ""}`}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </span>
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          id="site-mobile-menu"
          className="se-menu-enter max-h-[calc(100dvh-76px)] overflow-y-auto border-t border-border bg-white px-4 py-5 shadow-lg shadow-slate-900/5 sm:px-6 lg:hidden"
        >
          <form
            role="search"
            aria-label="Tìm sự kiện"
            onSubmit={submitSearch}
            className="relative mb-4"
          >
            <button
              type="submit"
              aria-label="Tìm sự kiện"
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 rounded-sm text-muted ${focusStyle}`}
            >
              <Search className="size-4" aria-hidden="true" />
            </button>
            <input
              type="search"
              aria-label="Tìm sự kiện hoặc nghệ sĩ"
              placeholder="Tìm sự kiện, nghệ sĩ..."
              value={headerQuery}
              onChange={(event) => setHeaderQuery(event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </form>
          <nav aria-label="Điều hướng trên điện thoại" className="flex flex-col gap-1 text-sm">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={item.active ? "page" : undefined}
                className={`rounded-xl px-3 py-3 font-medium ${focusStyle} ${item.active ? "bg-primary-container text-on-primary-container" : "text-foreground hover:bg-surface"}`}
              >
                {item.label}
              </Link>
            ))}
            {hasRole("ADMIN") && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={pathname.startsWith("/admin") ? "page" : undefined}
                className={`rounded-xl px-3 py-3 font-medium text-foreground hover:bg-surface ${focusStyle}`}
              >
                Quản trị hệ thống
              </Link>
            )}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            {isLoading ? (
              <div
                className="h-11 animate-pulse rounded-xl bg-surface"
                aria-label="Đang tải tài khoản"
              />
            ) : isAuthenticated && user ? (
              <>
                <div className="mb-1 flex items-center gap-3 px-3 py-2">
                  <UserAvatar
                    src={avatarUrl}
                    name={user.fullName}
                    initials={avatarInitial}
                    className="flex size-9 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-on-primary-container"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.fullName}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    logout()
                  }}
                  className={`se-button flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 ${focusStyle}`}
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`se-button rounded-xl border border-border py-3 text-center text-sm font-semibold ${focusStyle}`}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`se-button rounded-xl bg-primary py-3 text-center text-sm font-semibold text-white ${focusStyle}`}
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
