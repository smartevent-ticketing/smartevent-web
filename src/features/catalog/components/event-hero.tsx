"use client"

import { Calendar, Clock, MapPin, Ticket, ArrowDown } from "lucide-react"
import { useEventDetail } from "@/features/catalog/hooks/use-event-detail"

type Props = Pick<
  ReturnType<typeof useEventDetail>,
  | "bannerUrl"
  | "isSaleActive"
  | "title"
  | "date"
  | "time"
  | "locationName"
  | "cityName"
  | "minPrice"
>

export function EventHero({
  bannerUrl,
  isSaleActive,
  title,
  date,
  time,
  locationName,
  cityName,
  minPrice = 0,
}: Props) {
  const handleScrollToTickets = () => {
    const section = document.getElementById("ticket-picker-section")
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-[#0f172a] border border-slate-800 text-white">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Ticket-Card Split Container (Ticketbox Format) */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 p-6 sm:p-8 lg:p-10 items-center">
        {/* Left Column: Event Information & Ticket Details (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
          <div className="space-y-4">
            {/* Status & Category Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  isSaleActive
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${isSaleActive ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`}
                />
                {isSaleActive ? "Đang mở bán vé" : "Chưa mở bán"}
              </span>
            </div>

            {/* Event Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight text-white">
              {title}
            </h1>

            {/* Schedule & Venue Meta */}
            <div className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <Calendar className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-semibold">{date}</span>
                {time && (
                  <span className="flex items-center gap-1 text-slate-400">
                    • <Clock className="size-3.5" /> {time}
                  </span>
                )}
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {locationName}
                  {cityName ? `, ${cityName}` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & CTA Section */}
          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                Giá vé từ
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                {minPrice > 0 ? `${minPrice.toLocaleString("vi-VN")} đ` : "Miễn phí"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleScrollToTickets}
              disabled={!isSaleActive}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                isSaleActive
                  ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.99]"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Ticket className="size-4" />
              <span>{isSaleActive ? "Mua vé ngay" : "Tạm ngưng mở bán"}</span>
              {isSaleActive && <ArrowDown className="size-3.5 animate-bounce ml-1" />}
            </button>
          </div>
        </div>

        {/* Right Column: Hero High-Res Banner Display (7 cols) */}
        <div className="lg:col-span-7">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-950 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
