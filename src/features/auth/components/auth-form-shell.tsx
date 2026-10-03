import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, CalendarDays, Ticket, WalletCards } from "lucide-react"
import { SmartEventMark } from "@/components/brand/smartevent-mark"

interface AuthFormShellProps {
  children: ReactNode
  bannerTitle: string
  bannerDescription: string
  variant?: "login" | "register"
}

export function AuthFormShell({
  children,
  bannerTitle,
  bannerDescription,
  variant = "login",
}: AuthFormShellProps) {
  const registering = variant === "register"
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8 lg:py-10">
      <header className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
        <Link
          href="/"
          aria-label="SmartEvent — Trang chủ"
          className="inline-flex shrink-0 items-center gap-2.5 rounded-lg text-xl font-bold tracking-[-0.05em] text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <SmartEventMark className="size-9 sm:size-10" />
          SmartEvent
        </Link>
        <Link
          href="/events"
          className="group inline-flex min-h-11 items-center gap-1.5 rounded-lg text-xs font-medium text-muted transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:gap-2 sm:text-sm"
        >
          <span className="hidden sm:inline">Khám phá sự kiện</span>
          <span className="sm:hidden">Khám phá</span>
          <ArrowUpRight
            className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
            aria-hidden="true"
          />
        </Link>
      </header>

      <div className="overflow-hidden rounded-3xl border border-border/80 bg-white shadow-[0_24px_80px_-32px_rgba(24,34,48,0.18)] lg:grid lg:grid-cols-[1.04fr_1fr]">
        <aside className="se-auth-enter relative isolate flex min-h-36 flex-col justify-between overflow-hidden bg-[#111923] px-6 py-6 text-white sm:min-h-48 sm:px-8 lg:min-h-[660px] lg:p-10">
          <Image
            src="/brand/smartevent-banner-v1.png"
            alt=""
            fill
            preload
            sizes="(min-width: 1200px) 565px, (min-width: 1024px) 50vw, 100vw"
            className="se-auth-art -z-20 object-cover object-[65%_35%] lg:object-[66%_center]"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#111923]/90 via-[#111923]/65 to-[#111923]/10 lg:bg-gradient-to-t lg:from-[#111923] lg:from-10% lg:via-[#111923]/60 lg:via-45% lg:to-[#111923]/5" />
          <p className="hidden items-center gap-2 text-[11px] font-medium tracking-[0.14em] text-white/80 uppercase lg:flex">
            <span className="size-1.5 rounded-full bg-[#f4aa83]" aria-hidden="true" />
            Trải nghiệm bắt đầu từ đây
          </p>
          <div className="max-w-[380px] lg:mt-48">
            <p className="mb-3 text-[10px] font-semibold tracking-[0.16em] text-[#f4aa83] uppercase lg:text-[11px]">
              <span className="lg:hidden">Sẵn sàng trải nghiệm</span>
              <span className="hidden lg:inline">Một tài khoản, nhiều trải nghiệm</span>
            </p>
            <h2 className="hidden text-[40px] leading-[1.18] font-semibold tracking-[-0.045em] lg:block">
              {bannerTitle}
            </h2>
            <p className="text-xl leading-snug font-semibold tracking-[-0.03em] sm:text-2xl lg:hidden">
              <span className="block">Một vé.</span>
              <span className="block">Nhiều cảm xúc.</span>
            </p>
            <p className="mt-5 hidden max-w-[350px] text-sm leading-7 text-slate-300 lg:block">
              {bannerDescription}
            </p>
            <div className="mt-8 hidden flex-wrap gap-x-6 gap-y-3 border-t border-white/15 pt-6 lg:flex">
              {[
                { icon: CalendarDays, label: "Khám phá" },
                { icon: Ticket, label: "Đặt vé" },
                { icon: WalletCards, label: "Quản lý vé" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-slate-300">
                  <Icon className="size-4 shrink-0 text-[#f4aa83]" aria-hidden="true" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="se-auth-enter flex items-center justify-center px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <div className={`w-full ${registering ? "max-w-[420px]" : "max-w-[390px]"}`}>
            {children}
          </div>
        </div>
      </div>

      <footer className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-[11px] leading-5 text-muted sm:justify-between sm:text-xs">
        <p>SmartEvent · Kết nối bạn với những trải nghiệm đáng nhớ.</p>
        <p className="hidden sm:block">Khám phá. Đặt vé. Có mặt.</p>
      </footer>
    </div>
  )
}
