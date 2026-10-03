"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Pause, Play } from "lucide-react"

import { EventArtwork } from "./event-artwork"
import type { components } from "@/lib/api/schema"

type Event = components["schemas"]["EventResponse"]

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)")
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

function reducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange)
  return () => document.removeEventListener("visibilitychange", onChange)
}

function hiddenSnapshot() {
  return document.visibilityState !== "visible"
}

const pauseOnServer = () => true

function eventDate(event: Event) {
  const date = new Date(event.startTime ?? "")
  if (!Number.isFinite(date.getTime())) return "Sắp công bố"
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  })
}

export function FeaturedCarousel({
  events,
  bannerUrls,
}: {
  events: Event[]
  bannerUrls: Record<string, string>
}) {
  const [slide, setSlide] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    reducedMotionSnapshot,
    pauseOnServer,
  )
  const hidden = useSyncExternalStore(subscribeVisibility, hiddenSnapshot, pauseOnServer)
  const active = events.length ? slide % events.length : 0
  const playing =
    events.length > 1 && !hovered && !focused && !userPaused && !reduceMotion && !hidden

  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(() => {
      setSlide((current) => (current + 1) % events.length)
    }, 7000)
    return () => window.clearTimeout(timer)
  }, [active, events.length, playing])

  function selectSlide(next: number) {
    setSlide((next + events.length) % events.length)
    setUserPaused(true)
  }

  if (events.length === 0) {
    return (
      <div className="nightline-art relative flex min-h-[460px] flex-col justify-end overflow-hidden rounded-3xl p-8">
        <span className="nightline-kicker relative z-10 !text-white">SmartEvent</span>
        <p className="relative z-10 mt-3 max-w-lg text-4xl font-bold leading-tight tracking-tight text-white">
          Mỗi sự kiện,
          <br />
          một câu chuyện.
        </p>
      </div>
    )
  }

  return (
    <section
      aria-label="Sự kiện nổi bật"
      aria-roledescription="carousel"
      className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-[0_20px_45px_#18223018]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      <div className="relative h-[440px] sm:h-[460px]" aria-live={playing ? "off" : "polite"}>
        {events.map((event, index) => (
          <div
            key={event.id || index}
            role="group"
            aria-hidden={index !== active}
            aria-roledescription="slide"
            aria-label={index + 1 + " / " + events.length}
            inert={index !== active}
            data-active={index === active}
            className="nightline-carousel-slide absolute inset-0"
          >
            <EventArtwork
              event={event}
              bannerUrl={event.id ? bannerUrls[event.id] : undefined}
              variant={index}
              showFallbackTitle={false}
              className="nightline-carousel-art absolute inset-0 size-full"
            />
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/10" />
            <span className="absolute left-6 top-6 z-30 inline-flex rounded-full border border-white/25 bg-slate-900/30 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
              Nổi bật trên SmartEvent
            </span>
            <div className="absolute inset-0 z-30 flex flex-col justify-end p-6 pb-23 sm:p-8 sm:pb-24">
              <span className="nightline-carousel-copy text-xs font-semibold text-orange-200 [--slide-delay:60ms]">
                {event.categories?.[0]?.name || "Trải nghiệm cùng SmartEvent"}
              </span>
              <h2 className="nightline-carousel-copy mt-3 line-clamp-3 text-[1.7rem] font-bold leading-tight tracking-tight text-white [--slide-delay:120ms] sm:text-3xl">
                {event.name}
              </h2>
              <div className="nightline-carousel-copy mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/85 [--slide-delay:200ms]">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="size-4 text-[#ffad95]" />
                  {eventDate(event)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4 text-[#ffad95]" />
                  {event.city || event.venue?.name || "Địa điểm sắp công bố"}
                </span>
              </div>
              <Link
                href={"/events/" + (event.slug || event.id)}
                tabIndex={index === active ? 0 : -1}
                className="nightline-carousel-copy mt-5 inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 [--slide-delay:260ms] hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Xem sự kiện <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      {events.length > 1 && (
        <div className="absolute bottom-5 left-6 right-6 z-40 flex items-center justify-between gap-3 sm:left-8 sm:right-8">
          <div
            role="group"
            aria-label={"Sự kiện nổi bật " + (active + 1) + " trên " + events.length}
            className="text-sm tabular-nums text-white sm:hidden"
          >
            <span aria-hidden="true">
              {String(active + 1).padStart(2, "0")}
              <span className="mx-2 text-white/40">/</span>
              <span className="text-white/60">{String(events.length).padStart(2, "0")}</span>
            </span>
          </div>
          <div className="hidden items-center gap-1 sm:flex" aria-label="Chọn sự kiện nổi bật">
            {events.map((event, index) => (
              <button
                key={event.id || index}
                type="button"
                aria-label={"Xem sự kiện nổi bật " + (index + 1)}
                aria-current={index === active ? "true" : undefined}
                onClick={() => selectSlide(index)}
                className="group flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span
                  className={
                    "h-1.5 rounded-full transition-[width,background-color] duration-500 motion-reduce:transition-none " +
                    (index === active ? "w-9 bg-[#ff9479]" : "w-2 bg-white/50 group-hover:bg-white")
                  }
                />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={
                reduceMotion
                  ? "Phát tự động tắt theo thiết lập giảm chuyển động"
                  : userPaused
                    ? "Phát tự động sự kiện nổi bật"
                    : "Tạm dừng phát tự động"
              }
              disabled={reduceMotion}
              title={reduceMotion ? "Phát tự động tắt theo thiết lập giảm chuyển động" : undefined}
              onClick={() => setUserPaused((current) => !current)}
              className="nightline-control flex size-11 items-center justify-center rounded-full border border-white/25 bg-[#151521]/65 text-white backdrop-blur transition-colors duration-300 hover:bg-[#ff8063] hover:text-[#261621] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-default disabled:opacity-50"
            >
              {userPaused || reduceMotion ? (
                <Play className="size-4" />
              ) : (
                <Pause className="size-4" />
              )}
            </button>
            <button
              type="button"
              aria-label="Sự kiện trước"
              onClick={() => selectSlide(active - 1)}
              className="nightline-control flex size-11 items-center justify-center rounded-full border border-white/25 bg-[#151521]/65 text-white backdrop-blur transition-colors duration-300 hover:bg-[#ff8063] hover:text-[#261621] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Sự kiện tiếp theo"
              onClick={() => selectSlide(active + 1)}
              className="nightline-control flex size-11 items-center justify-center rounded-full border border-white/25 bg-[#151521]/65 text-white backdrop-blur transition-colors duration-300 hover:bg-[#ff8063] hover:text-[#261621] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
