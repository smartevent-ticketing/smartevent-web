"use client"

import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

import { EventCard } from "./event-card"
import { useEventBannerUrls } from "../hooks/use-event-banner-urls"
import type { useEventsCatalog } from "@/features/catalog/hooks/use-events-catalog"

type Props = Pick<
  ReturnType<typeof useEventsCatalog>,
  "events" | "currentPage" | "setCurrentPage" | "totalPages" | "isLoading"
>

export function CatalogResults({
  events,
  currentPage,
  setCurrentPage,
  totalPages,
  isLoading,
}: Props) {
  const bannerUrls = useEventBannerUrls(events)

  if (isLoading) return null

  if (events.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-white/15 bg-[#242331] px-6 py-14 text-center">
        <CalendarDays className="size-10 text-[#ff9479]" />
        <h2 className="mt-5 text-xl font-bold text-white">Chưa tìm thấy sự kiện phù hợp</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#bcb7c4]">
          Thử thay đổi từ khóa hoặc bộ lọc để khám phá những sự kiện khác.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#ff8063] px-5 py-2.5 text-sm font-bold text-[#261621] hover:bg-[#ff9b83]"
        >
          Về trang chủ <ArrowRight className="size-4" />
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event, index) => (
          <EventCard
            key={event.id}
            event={event}
            bannerUrl={event.id ? bannerUrls[event.id] : undefined}
            variant={index}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <nav
          aria-label="Phân trang sự kiện"
          className="flex flex-wrap items-center justify-center gap-3 pt-8"
        >
          <button
            type="button"
            disabled={currentPage <= 0}
            onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
            className="inline-flex items-center gap-1 rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-[#f8f2ed] transition hover:border-[#ff9479] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" /> Trang trước
          </button>
          <span className="px-2 text-xs font-medium text-[#bcb7c4]">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage((page) => page + 1)}
            className="inline-flex items-center gap-1 rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-[#f8f2ed] transition hover:border-[#ff9479] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Trang sau <ChevronRight className="size-4" />
          </button>
        </nav>
      )}
    </>
  )
}
