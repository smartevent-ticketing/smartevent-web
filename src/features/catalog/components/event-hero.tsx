"use client"

import { Calendar, Clock, MapPin } from "lucide-react"
import { useEventDetail } from "@/features/catalog/hooks/use-event-detail"

type Props = Pick<
  ReturnType<typeof useEventDetail>,
  "bannerUrl" | "isSaleActive" | "title" | "date" | "time" | "locationName" | "cityName"
>

export function EventHero({
  bannerUrl,
  isSaleActive,
  title,
  date,
  time,
  locationName,
  cityName,
}: Props) {
  return (
    <>
      <div className="relative w-full h-[320px] sm:h-[420px] rounded-3xl overflow-hidden shadow-xl bg-gray-900">
        <img src={bannerUrl} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111c2d]/95 via-[#111c2d]/50 to-transparent" />

        <div className="absolute bottom-0 left-0 p-6 sm:p-10 w-full text-white">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur ${
                isSaleActive ? "bg-primary/90 text-white" : "bg-gray-700/80 text-gray-200"
              }`}
            >
              {isSaleActive ? "Đang mở bán vé" : "Chưa mở bán"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold mb-3 leading-tight max-w-4xl">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-200">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4 text-primary-container" />
              <span>{date}</span>
            </div>
            {time && (
              <div className="flex items-center gap-1.5">
                <Clock className="size-4 text-primary-container" />
                <span>{time}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <MapPin className="size-4 text-primary-container" />
              <span>
                {locationName}
                {cityName ? `, ${cityName}` : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
