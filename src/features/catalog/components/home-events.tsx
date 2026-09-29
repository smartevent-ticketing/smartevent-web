"use client"

import Link from "next/link"
import { ArrowUpRight, CalendarDays } from "lucide-react"

import { EventCard } from "./event-card"
import type { useHome } from "@/features/catalog/hooks/use-home"

type Props = Pick<ReturnType<typeof useHome>, "events" | "isLoading" | "filteredRealEvents"> & {
  bannerUrls: Record<string, string>
}

export function HomeEvents({ events, isLoading, filteredRealEvents, bannerUrls }: Props) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <span className="nightline-kicker">Chọn trải nghiệm của bạn</span>
          <h2 className="nightline-heading mt-2 text-3xl text-[#f8f2ed] sm:text-4xl">
            Sự kiện nổi bật
          </h2>
          <p className="mt-2 text-sm text-[#aaa6b7]">Những khoảnh khắc đang chờ bạn phía trước.</p>
        </div>
        <Link
          href="/events"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#ffad95] hover:text-white"
        >
          Xem tất cả <ArrowUpRight className="size-4" />
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-[370px] animate-pulse rounded-[18px] bg-[#242331]" />
          ))}
        </div>
      )}

      {!isLoading && events.length === 0 && (
        <div className="flex flex-col items-center rounded-3xl border border-white/15 bg-[#242331] px-6 py-14 text-center">
          <CalendarDays className="size-10 text-[#ff9479]" />
          <h3 className="mt-5 text-xl font-bold text-white">Chưa có sự kiện để khám phá</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#bcb7c4]">
            Các sự kiện mới sẽ xuất hiện tại đây sau khi được ban tổ chức công bố.
          </p>
          <Link
            href="/events"
            className="mt-6 rounded-xl bg-[#ff8063] px-5 py-2.5 text-sm font-bold text-[#261621] hover:bg-[#ff9b83]"
          >
            Khám phá sự kiện
          </Link>
        </div>
      )}

      {!isLoading && events.length > 0 && filteredRealEvents.length === 0 && (
        <div className="rounded-2xl border border-white/15 bg-[#242331] p-10 text-center text-sm text-[#bcb7c4]">
          Không tìm thấy sự kiện phù hợp.
        </div>
      )}

      {!isLoading && filteredRealEvents.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRealEvents.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              bannerUrl={event.id ? bannerUrls[event.id] : undefined}
              variant={index}
            />
          ))}
        </div>
      )}
    </section>
  )
}
