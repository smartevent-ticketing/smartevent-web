"use client"

import { useState } from "react"
import { ArrowDown, CalendarDays, Clock3, MapPin, Ticket } from "lucide-react"
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
  const [failedBanner, setFailedBanner] = useState<string>()
  const scrollToTickets = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    document.getElementById("ticket-picker-section")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
    })
  }

  return (
    <section
      aria-labelledby="event-title"
      className="overflow-hidden rounded-3xl border border-border bg-white shadow-[0_12px_40px_-24px_rgba(24,34,48,0.18)]"
    >
      <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
        <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-surface p-5 sm:min-h-[360px] sm:p-8 lg:min-h-[440px]">
          {bannerUrl && bannerUrl !== failedBanner ? (
            <>
              {/* Presigned media URLs have dynamic hosts; retain the backend-provided URL. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bannerUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 size-full scale-110 object-cover opacity-15 blur-2xl"
              />
              <div className="absolute inset-0 bg-white/30" aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bannerUrl}
                alt={"Ảnh bìa " + title}
                onError={() => setFailedBanner(bannerUrl)}
                className="se-auth-art relative block max-h-[400px] w-auto max-w-full rounded-2xl object-contain shadow-[0_18px_50px_-20px_rgba(24,34,48,0.35)]"
              />
            </>
          ) : (
            <div className="relative flex min-h-64 w-full flex-col justify-between overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary-container via-white to-surface p-7 sm:min-h-80 sm:p-9">
              <span
                className="absolute -right-12 -top-12 size-56 rounded-full border-[28px] border-primary/5"
                aria-hidden="true"
              />
              <span className="relative flex items-center gap-2 text-xs font-semibold tracking-widest text-primary">
                <Ticket className="size-4" aria-hidden="true" /> SMARTEVENT
              </span>
              <p className="relative mt-10 max-w-md break-words text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                {title}
              </p>
              <span className="relative text-xs text-muted">Sự kiện · Trải nghiệm · Kết nối</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-8 p-6 sm:p-8 lg:p-10">
          <div className="se-hero-enter">
            <span
              className={
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold " +
                (isSaleActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-border bg-surface text-muted")
              }
            >
              <span
                className={
                  "size-1.5 rounded-full " + (isSaleActive ? "bg-emerald-500" : "bg-slate-400")
                }
                aria-hidden="true"
              />
              {isEnded ? "Đã kết thúc" : isSaleActive ? "Đang mở bán" : "Chưa mở bán"}
            </span>
            <h1
              id="event-title"
              className="mt-5 break-words text-3xl font-bold leading-[1.2] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]"
            >
              {title}
            </h1>
            <dl className="mt-7 space-y-5">
              <div className="flex gap-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
                  <CalendarDays className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <dt className="text-xs text-muted">Thời gian diễn ra</dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">
                    {date}
                    {time && (
                      <span className="mt-1 flex items-center gap-1.5 text-xs font-normal text-muted">
                        <Clock3 className="size-3.5" aria-hidden="true" />
                        {time}
                      </span>
                    )}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
                  <MapPin className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs text-muted">Địa điểm</dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-foreground">
                    {locationName}
                    {cityName && (
                      <span className="mt-1 block text-xs font-normal text-muted">{cityName}</span>
                    )}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="flex flex-col gap-5 border-t border-border pt-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs text-muted">Giá vé từ</p>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-primary">
                {minPrice > 0
                  ? minPrice.toLocaleString("vi-VN") + " ₫"
                  : isSaleActive
                    ? "Miễn phí"
                    : "Chưa công bố"}
              </p>
            </div>
            <button
              type="button"
              onClick={scrollToTickets}
              disabled={!isSaleActive}
              className="se-button inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-muted"
            >
              <Ticket className="size-4" aria-hidden="true" />
              {isSaleActive ? "Chọn vé ngay" : isEnded ? "Sự kiện đã kết thúc" : "Chưa mở bán"}
              {isSaleActive && <ArrowDown className="size-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
