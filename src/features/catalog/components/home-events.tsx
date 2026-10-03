"use client"

import Link from "next/link"
import { ArrowRight, CalendarDays } from "lucide-react"
import { EventCard, EventCardSkeleton } from "./event-card"
import { MotionReveal } from "@/components/shared/motion-reveal"
import type { useHome } from "@/features/catalog/hooks/use-home"

type Props = Pick<ReturnType<typeof useHome>, "events" | "isLoading" | "filteredRealEvents"> & {
  bannerUrls: Record<string, string>
}

export function HomeEvents({ events, isLoading, filteredRealEvents, bannerUrls }: Props) {
  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      aria-labelledby="home-events-title"
    >
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="nightline-kicker">Lên kế hoạch cho lần hẹn tiếp theo</span>
          <h2
            id="home-events-title"
            className="nightline-heading mt-2 text-3xl text-foreground sm:text-4xl"
          >
            Khám phá sự kiện
          </h2>
          <p className="mt-3 text-sm text-muted">
            Tìm một trải nghiệm hợp với bạn, ngay trên SmartEvent.
          </p>
        </div>
        <Link
          href="/events"
          className="se-text-link inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-4 text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary"
        >
          Xem tất cả <ArrowRight className="size-4" />
        </Link>
      </div>
      {isLoading && (
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Đang tải sự kiện"
        >
          {[1, 2, 3].map((item) => (
            <EventCardSkeleton key={item} />
          ))}
        </div>
      )}
      {!isLoading && events.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-white px-6 py-14 text-center">
          <div className="rounded-2xl bg-primary-container p-4 text-primary">
            <CalendarDays className="size-7" />
          </div>
          <h3 className="mt-5 text-lg font-bold text-foreground">
            Trải nghiệm mới đang được chuẩn bị
          </h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted">
            Sự kiện sẽ xuất hiện tại đây sau khi được ban tổ chức công bố.
          </p>
          <Link
            href="/events"
            className="se-button mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Xem danh sách sự kiện
          </Link>
        </div>
      )}
      {!isLoading && events.length > 0 && filteredRealEvents.length === 0 && (
        <div className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted">
          Không tìm thấy sự kiện phù hợp.
        </div>
      )}
      {!isLoading && filteredRealEvents.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRealEvents.map((event, index) => (
            <MotionReveal key={event.id} delay={(index % 3) * 65} className="h-full min-w-0">
              <EventCard
                event={event}
                bannerUrl={event.id ? bannerUrls[event.id] : undefined}
                variant={index}
              />
            </MotionReveal>
          ))}
        </div>
      )}
    </section>
  )
}
