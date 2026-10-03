"use client"

import Link from "next/link"
import { ArrowRight, CalendarPlus, QrCode, Search, Ticket } from "lucide-react"
import { MotionReveal } from "@/components/shared/motion-reveal"

const steps = [
  {
    icon: Search,
    title: "Tìm trải nghiệm của bạn",
    description:
      "Khám phá theo danh mục, thành phố hoặc tên sự kiện. Xem thông tin trước khi chọn vé.",
  },
  {
    icon: Ticket,
    title: "Chọn vé phù hợp",
    description:
      "Xem hạng vé, chọn số lượng hoặc ghế ngồi và kiểm tra đơn hàng trước khi thanh toán.",
  },
  {
    icon: QrCode,
    title: "Sẵn sàng có mặt",
    description:
      "Sau khi đơn hàng được xác nhận, mở vé điện tử trong tài khoản để check-in bằng mã QR.",
  },
]

export function ServiceBenefits() {
  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      aria-labelledby="home-steps-title"
    >
      <div className="rounded-3xl border border-border bg-white p-6 sm:p-9 lg:p-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-xl">
            <span className="nightline-kicker">Từ khám phá đến trải nghiệm</span>
            <h2 id="home-steps-title" className="nightline-heading mt-2 text-3xl text-foreground">
              Một hành trình rõ ràng.
            </h2>
          </div>
          <Link
            href="/account"
            className="se-text-link inline-flex items-center gap-2 text-xs font-semibold text-primary"
          >
            Xem vé của tôi <ArrowRight className="size-4" />
          </Link>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <li key={title}>
              <MotionReveal
                delay={index * 70}
                className="se-benefit-card h-full rounded-2xl border border-border bg-background p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-white text-primary">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-xs font-bold tabular-nums text-slate-400">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-bold text-foreground">{title}</h3>
                <p className="mt-3 text-xs leading-6 text-muted">{description}</p>
              </MotionReveal>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-8 flex flex-col items-start justify-between gap-6 rounded-3xl bg-[#1b2934] px-6 py-8 text-white sm:px-9 md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <div className="hidden rounded-2xl border border-white/15 bg-white/5 p-3 sm:block">
            <CalendarPlus className="size-6 text-orange-200" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">
              Mang sự kiện của bạn đến với mọi người.
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Tạo sự kiện, quản lý hạng vé và theo dõi check-in trong không gian dành cho ban tổ
              chức.
            </p>
          </div>
        </div>
        <Link
          href="/organizer"
          className="se-button inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-slate-900 hover:bg-orange-50"
        >
          Dành cho ban tổ chức <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}
