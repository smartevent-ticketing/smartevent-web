import Link from "next/link"
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react"
import { EventArtwork } from "./event-artwork"
import type { components } from "@/lib/api/schema"

type Event = components["schemas"]["EventResponse"]

type Props = {
  event: Event
  bannerUrl?: string
  variant?: number
}

export function EventCard({ event, bannerUrl, variant = 0 }: Props) {
  const category = event.categories?.[0]?.name || "Sự kiện"
  const location = event.venue?.name || event.city || "Địa điểm sắp công bố"
  const date = event.startTime ? new Date(event.startTime) : null
  const eventDate =
    date && Number.isFinite(date.getTime())
      ? date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "Asia/Ho_Chi_Minh",
        })
      : "Sắp công bố"

  return (
    <Link
      href={"/events/" + (event.slug || event.id)}
      className="nightline-event-card group flex flex-col"
      aria-label={"Xem sự kiện " + (event.name || "chưa đặt tên")}
    >
      <EventArtwork
        event={event}
        bannerUrl={bannerUrl}
        variant={variant}
        className="h-48 sm:h-52"
      />
      <div className="flex flex-1 flex-col p-5">
        <span className="nightline-kicker !text-[10px]">{category}</span>
        <h3 className="mt-2 line-clamp-2 min-h-12 text-lg font-bold leading-snug text-[#f8f2ed] group-hover:text-[#ffad95]">
          {event.name}
        </h3>
        <div className="mt-3 space-y-1.5 text-xs text-[#bcb7c4]">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-3.5 text-[#ff9479]" />
            {eventDate}
          </span>
          <span className="flex items-center gap-2 truncate">
            <MapPin className="size-3.5 shrink-0 text-[#ff9479]" />
            <span className="truncate">{location}</span>
          </span>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-bold">
          <span className="text-[#bcb7c4]">Khám phá sự kiện</span>
          <span className="inline-flex items-center gap-1 text-[#ffad95]">
            Xem vé <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
