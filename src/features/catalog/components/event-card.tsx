import Link from "next/link"
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react"
import { EventArtwork } from "./event-artwork"
import type { components } from "@/lib/api/schema"

type Event = components["schemas"]["EventResponse"]
type Props = { event: Event; bannerUrl?: string; variant?: number }

export function EventCard({ event, bannerUrl, variant = 0 }: Props) {
  const category = event.categories?.[0]?.name || "Sự kiện"
  const location = event.venue?.name || event.city || "Địa điểm sắp công bố"
  const rawDate = event.startTime ? new Date(event.startTime) : null
  const date = rawDate && Number.isFinite(rawDate.getTime()) ? rawDate : null
  const eventDate = date
    ? date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Asia/Ho_Chi_Minh",
      })
    : "Thời gian sắp công bố"
  const day = date?.toLocaleDateString("vi-VN", { day: "2-digit", timeZone: "Asia/Ho_Chi_Minh" })
  const month = date?.toLocaleDateString("vi-VN", {
    month: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  })

  return (
    <Link
      href={"/events/" + (event.slug || event.id)}
      className="nightline-event-card group flex h-full flex-col"
      aria-label={"Xem sự kiện " + (event.name || "chưa đặt tên")}
    >
      <div className="relative overflow-hidden">
        <EventArtwork
          event={event}
          bannerUrl={bannerUrl}
          variant={variant}
          className="se-card-art aspect-[16/10]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-slate-950/25 to-transparent"
        />
        {date && (
          <div
            aria-hidden="true"
            className="absolute left-4 top-4 flex min-w-12 flex-col items-center rounded-xl bg-white px-2.5 py-2 shadow-sm"
          >
            <span className="text-xl font-extrabold leading-none text-foreground">{day}</span>
            <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-primary">
              Tháng {month}
            </span>
          </div>
        )}
        {event.city && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-slate-950/50 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
            <MapPin className="size-3" />
            {event.city}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="w-fit rounded-md bg-primary-container px-2 py-1 text-[10px] font-semibold text-primary">
          {category}
        </span>
        <h3 className="mt-3 line-clamp-2 min-h-13 text-[17px] font-bold leading-6 text-foreground group-hover:text-primary">
          {event.name || "Sự kiện"}
        </h3>
        <div className="mt-3 space-y-2 text-xs text-muted">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-3.5 shrink-0 text-slate-400" />
            {eventDate}
          </span>
          <span className="flex min-w-0 items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{location}</span>
          </span>
        </div>
        <div className="mt-5 flex items-center justify-between gap-2 border-t border-border pt-4 text-xs">
          <span className="text-muted">Thông tin & hạng vé</span>
          <span className="inline-flex items-center gap-1 font-semibold text-primary">
            Xem chi tiết <ArrowUpRight className="se-card-arrow size-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function EventCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-[20px] border border-border bg-white"
    >
      <div className="aspect-[16/10] animate-pulse bg-surface-container-low" />
      <div className="space-y-4 p-5">
        <div className="h-5 w-20 animate-pulse rounded bg-surface-container-low" />
        <div className="h-6 w-4/5 animate-pulse rounded bg-surface-container-low" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-surface-container-low" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-container-low" />
        <div className="h-8 animate-pulse rounded bg-surface-container-low" />
      </div>
    </div>
  )
}
