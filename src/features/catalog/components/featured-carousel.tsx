"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CalendarDays, MapPin } from "lucide-react"

import { EventArtwork } from "./event-artwork"
import type { components } from "@/lib/api/schema"

type Event = components["schemas"]["EventResponse"]

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
  const [paused, setPaused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const active = events.length ? slide % events.length : 0

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduceMotion(media.matches)
    media.addEventListener("change", update)
    const initial = window.setTimeout(update, 0)
    return () => {
      window.clearTimeout(initial)
      media.removeEventListener("change", update)
    }
  }, [])

  useEffect(() => {
    if (events.length < 2 || paused || reduceMotion) return
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setSlide((current) => (current + 1) % events.length)
      }
    }, 6500)
    return () => window.clearInterval(timer)
  }, [events.length, paused, reduceMotion])

  if (events.length === 0) {
    return (
      <div className="nightline-art relative flex min-h-[380px] flex-col justify-end overflow-hidden rounded-[28px] border border-white/15 p-8 sm:min-h-[440px] sm:p-12">
        <span className="nightline-kicker relative z-10 !text-white">SmartEvent</span>
        <p className="relative z-10 mt-3 max-w-lg text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
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
      className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[#242331] shadow-2xl shadow-black/25"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false)
      }}
    >
      <div
        className="flex h-[460px] transition-transform duration-700 ease-in-out motion-reduce:transition-none sm:h-[500px]"
        style={{ transform: "translateX(-" + active * 100 + "%)" }}
      >
        {events.map((event, index) => (
          <div
            key={event.id || index}
            aria-hidden={index !== active}
            aria-roledescription="slide"
            aria-label={index + 1 + " / " + events.length}
            inert={index !== active}
            className="relative h-full min-w-full"
          >
            <EventArtwork
              event={event}
              bannerUrl={event.id ? bannerUrls[event.id] : undefined}
              variant={index}
              showFallbackTitle={false}
              className="absolute inset-0 size-full"
            />
            <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#12111e]/95 via-[#12111e]/75 to-[#12111e]/10 sm:via-[#12111e]/55" />
            <div className="absolute inset-0 z-30 flex flex-col justify-end p-7 pb-20 sm:p-11 sm:pb-20 lg:p-14 lg:pb-20">
              <span className="nightline-kicker">Nổi bật trên SmartEvent</span>
              <h2 className="mt-3 line-clamp-3 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                {event.name}
              </h2>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#ece6e9]">
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
                className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-[#ff8063] px-5 py-3 text-sm font-bold text-[#261621] transition hover:bg-[#ff9b83] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Xem sự kiện <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      {events.length > 1 && (
        <div className="absolute bottom-5 left-7 right-7 z-40 flex items-center justify-between gap-4 sm:left-11 sm:right-11 lg:left-14 lg:right-14">
          <div className="flex items-center gap-2" aria-label="Chọn sự kiện nổi bật">
            {events.map((event, index) => (
              <button
                key={event.id || index}
                type="button"
                aria-label={"Xem sự kiện nổi bật " + (index + 1)}
                aria-current={index === active ? "true" : undefined}
                onClick={() => setSlide(index)}
                className={
                  "h-2 rounded-full transition-all " +
                  (index === active ? "w-9 bg-[#ff9479]" : "w-2 bg-white/50 hover:bg-white")
                }
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Sự kiện trước"
              onClick={() => setSlide((current) => (current - 1 + events.length) % events.length)}
              className="flex size-9 items-center justify-center rounded-full border border-white/25 bg-[#151521]/65 text-white backdrop-blur transition hover:bg-[#ff8063] hover:text-[#261621]"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Sự kiện tiếp theo"
              onClick={() => setSlide((current) => (current + 1) % events.length)}
              className="flex size-9 items-center justify-center rounded-full border border-white/25 bg-[#151521]/65 text-white backdrop-blur transition hover:bg-[#ff8063] hover:text-[#261621]"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
