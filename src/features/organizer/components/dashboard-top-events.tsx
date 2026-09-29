"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ArrowUpRight, Sparkles } from "lucide-react"
import type { DisplayEvent } from "../model/organizer-event"

export function DashboardTopEvents({ events }: { events: DisplayEvent[] }) {
  const topRevenueEvents = useMemo(
    () =>
      [...events]
        .filter((event) => event.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3),
    [events],
  )
  return (
    <>
      {/* 2. Top Selling Events Spotlight */}
      {topRevenueEvents.length > 0 && (
        <section className="workspace-card space-y-5 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-[#fff1e9] p-2 text-[#bd443a]">
                <Sparkles className="size-4" />
              </div>
              <div>
                <p className="workspace-kicker">Điểm sáng</p>
                <h2 className="mt-0.5 text-lg font-extrabold">
                  Sự kiện dẫn đầu doanh thu ước tính
                </h2>
              </div>
            </div>
            <span className="text-xs font-medium text-[#837780]">
              Tạm tính theo số vé đã bán và giá đợt bán hiện tại
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topRevenueEvents.map((ev, idx) => (
              <div
                key={ev.id}
                className="space-y-4 rounded-2xl border border-[#eee6e1] bg-[#fbf9f7] p-5 transition hover:border-[#d6aaa0]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center justify-center size-6 rounded-full text-xs font-black ${
                        idx === 0
                          ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
                          : idx === 1
                            ? "bg-slate-100 text-slate-700 ring-1 ring-slate-300"
                            : "bg-orange-100 text-orange-800 ring-1 ring-orange-300"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-[#756d77]">
                      {ev.category}
                    </span>
                  </div>
                  <Link
                    href={`/organizer/events/${ev.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#bd443a] hover:underline"
                  >
                    <span>Quản lý</span>
                    <ArrowUpRight className="size-3" />
                  </Link>
                </div>

                <div>
                  <h3
                    className="line-clamp-1 text-sm font-extrabold text-[#251f29]"
                    title={ev.name}
                  >
                    {ev.name}
                  </h3>
                  <div className="mt-1 text-xl font-extrabold text-[#257555]">
                    {ev.revenue.toLocaleString("vi-VN")} ₫
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span>
                      Đã bán: <strong>{ev.ticketsSold.toLocaleString("vi-VN")}</strong> /{" "}
                      {ev.totalTickets.toLocaleString("vi-VN")}
                    </span>
                    <span className="font-semibold text-emerald-700">{ev.occupancyRate}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8ded8]">
                    <div
                      className="h-full rounded-full bg-[#ff8063]"
                      style={{ width: `${Math.min(100, ev.occupancyRate)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
