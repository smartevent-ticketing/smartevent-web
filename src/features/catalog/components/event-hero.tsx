"use client"

import { ArrowDown, CalendarDays, MapPin, Ticket } from "lucide-react"
import type { useEventDetail } from "@/features/catalog/hooks/use-event-detail"

type Props = Pick<
  ReturnType<typeof useEventDetail>,
  | "bannerUrl"
  | "isSaleActive"
  | "isEnded"
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
  isEnded,
  title,
  date,
  time,
  locationName,
  cityName,
  minPrice = 0,
}: Props) {
  const scrollToTickets = () => {
    document.getElementById("ticket-picker-section")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/15 bg-[#242331]">
      <div className="grid lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        <div className="flex flex-col justify-between gap-8 p-7 sm:p-8 lg:p-9">
          <div>
            <span className="nightline-kicker">SmartEvent / Trải nghiệm sắp tới</span>
            <h1 className="nightline-heading mt-4 text-4xl text-white sm:text-5xl">{title}</h1>
            <div className="mt-6 space-y-3 text-sm text-[#d1cbd3]">
              <p className="flex items-center gap-3">
                <CalendarDays className="size-5 shrink-0 text-[#ff9479]" />
                {date}
                {time ? " · " + time : ""}
              </p>
              <p className="flex items-center gap-3">
                <MapPin className="size-5 shrink-0 text-[#ff9479]" />
                {locationName}
                {cityName ? ", " + cityName : ""}
              </p>
            </div>
          </div>
          <div className="border-t border-white/15 pt-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#aaa6b7]">Giá vé từ</p>
            <p className="mt-1 text-3xl font-extrabold text-[#ffad95]">
              {minPrice > 0 ? minPrice.toLocaleString("vi-VN") + " ₫" : "Miễn phí"}
            </p>
            <button
              type="button"
              onClick={scrollToTickets}
              disabled={!isSaleActive}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff8063] px-5 py-3.5 text-sm font-bold text-[#261621] transition hover:bg-[#ff9b83] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-[#aaa6b7]"
            >
              <Ticket className="size-4" />
              {isSaleActive ? "Chọn vé ngay" : isEnded ? "Sự kiện đã kết thúc" : "Chưa mở bán"}
              {isSaleActive && <ArrowDown className="size-4" />}
            </button>
          </div>
        </div>
        <div className="nightline-art relative flex min-h-[280px] items-center justify-center p-4 sm:p-6 lg:min-h-[410px]">
          {bannerUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bannerUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 z-10 size-full scale-110 object-cover opacity-30 blur-2xl"
              />
              {/* Presigned media URLs have dynamic hosts, so this cannot use a fixed Next image host. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bannerUrl}
                alt={"Ảnh bìa " + title}
                className="relative z-20 block h-auto max-h-[360px] w-auto max-w-full rounded-xl object-contain shadow-2xl shadow-black/40"
              />
            </>
          ) : (
            <span className="absolute bottom-9 left-8 right-8 z-10 text-5xl font-black uppercase leading-[0.9] tracking-[-0.08em] text-white drop-shadow-xl sm:text-7xl">
              {title}
            </span>
          )}
          <span className="absolute right-5 top-5 z-30 rounded-full border border-white/25 bg-[#151521]/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            {isEnded ? "Đã kết thúc" : isSaleActive ? "Đang mở bán" : "Chưa mở bán"}
          </span>
        </div>
      </div>
    </section>
  )
}
