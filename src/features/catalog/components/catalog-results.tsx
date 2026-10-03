"use client"

import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

import { EventCard } from "./event-card"
import { MotionReveal } from "@/components/shared/motion-reveal"
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
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-white px-6 py-14 text-center">
        <span className="rounded-2xl bg-primary-container p-4">
          <CalendarDays className="size-7 text-primary" />
        </span>
        <h3 className="mt-5 text-lg font-bold text-foreground">Chưa tìm thấy sự kiện phù hợp</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted">
          Thử thay đổi từ khóa hoặc bộ lọc để khám phá những sự kiện khác.
        </p>
        <Link
          href="/events"
          className="se-button mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover"
        >
          Xem tất cả sự kiện <ArrowRight className="size-4" />
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {events.map((event, index) => (
          <MotionReveal key={event.id} delay={(index % 3) * 75} className="h-full min-w-0">
            <EventCard
              event={event}
              bannerUrl={event.id ? bannerUrls[event.id] : undefined}
              variant={index}
            />
          </MotionReveal>
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
            className="se-button inline-flex min-h-11 items-center gap-1 rounded-xl border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" /> Trang trước
          </button>
          <span className="px-2 text-xs font-medium text-muted">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage((page) => page + 1)}
            className="se-button inline-flex min-h-11 items-center gap-1 rounded-xl border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Trang sau <ChevronRight className="size-4" />
          </button>
        </nav>
      )}
    </>
  )
}
