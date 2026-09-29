"use client"

import { ArrowRight, MapPin, Search, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { FormEvent } from "react"

import { FeaturedCarousel } from "./featured-carousel"
import { catalogUrl } from "../model/catalog-url"
import type { useHome } from "@/features/catalog/hooks/use-home"
import type { components } from "@/lib/api/schema"

type Event = components["schemas"]["EventResponse"]
type Props = Pick<
  ReturnType<typeof useHome>,
  "searchQuery" | "setSearchQuery" | "selectedCity" | "setSelectedCity"
> & {
  events: Event[]
  bannerUrls: Record<string, string>
}

export function HomeHero({
  searchQuery,
  setSearchQuery,
  selectedCity,
  setSelectedCity,
  events,
  bannerUrls,
}: Props) {
  const router = useRouter()
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const city = selectedCity === "hcm" ? "Hồ Chí Minh" : selectedCity === "hn" ? "Hà Nội" : ""
    router.push(catalogUrl({ q: searchQuery, city }))
  }

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="pointer-events-none absolute -top-48 right-[-12%] size-[620px] rounded-full bg-[#8f345e]/20 blur-[110px]" />
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:items-end lg:gap-12">
          <div>
            <div className="nightline-kicker flex items-center gap-2">
              <Sparkles className="size-4" />
              Những trải nghiệm đáng mong đợi
            </div>
            <h1 className="nightline-heading mt-4 max-w-2xl text-[clamp(3rem,5.8vw,5.4rem)]">
              Chọn đêm nay.
              <br />
              <span className="text-[#ff9479]">Sống hết mình.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#c2bec9] sm:text-base">
              Khám phá những sân khấu, cuộc gặp gỡ và khoảnh khắc đáng nhớ. Sự kiện tiếp theo của
              bạn bắt đầu ngay tại đây.
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-[#e9e3e9]">
              Bạn đang tìm trải nghiệm nào?
            </p>
            <form
              onSubmit={submitSearch}
              className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-[#242331] p-2 shadow-2xl shadow-black/20 sm:flex-row"
            >
              <label className="flex min-w-0 flex-1 items-center gap-3 px-3 text-[#a9a5b3]">
                <Search className="size-5 shrink-0" />
                <span className="sr-only">Tìm sự kiện</span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Sự kiện, nghệ sĩ, địa điểm..."
                  className="w-full min-w-0 bg-transparent py-3 text-sm text-white outline-none placeholder:text-[#a9a5b3]"
                />
              </label>
              <label className="flex items-center gap-2 border-t border-white/10 px-3 text-[#a9a5b3] sm:border-l sm:border-t-0">
                <MapPin className="size-4 shrink-0" />
                <span className="sr-only">Thành phố</span>
                <select
                  value={selectedCity}
                  onChange={(event) => setSelectedCity(event.target.value)}
                  className="w-full appearance-none bg-transparent py-3 pr-2 text-sm text-white outline-none sm:w-25 [&_option]:text-[#231b23]"
                >
                  <option value="all">Toàn quốc</option>
                  <option value="hcm">TP. HCM</option>
                  <option value="hn">Hà Nội</option>
                </select>
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff8063] px-5 py-3 text-sm font-bold text-[#261621] transition hover:bg-[#ff9b83]"
              >
                Tìm vé <ArrowRight className="size-4" />
              </button>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#aaa6b7]">
              <span>Khám phá nhanh</span>
              <Link
                href="/events"
                className="rounded-full border border-white/20 px-3 py-1.5 text-white hover:border-[#ff9479]"
              >
                Tất cả
              </Link>
              <Link
                href={catalogUrl({ city: "Hồ Chí Minh" })}
                className="rounded-full border border-white/20 px-3 py-1.5 text-white hover:border-[#ff9479]"
              >
                TP. Hồ Chí Minh
              </Link>
              <Link
                href={catalogUrl({ city: "Hà Nội" })}
                className="rounded-full border border-white/20 px-3 py-1.5 text-white hover:border-[#ff9479]"
              >
                Hà Nội
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-9 lg:mt-11">
          <FeaturedCarousel events={events} bannerUrls={bannerUrls} />
        </div>
      </div>
    </section>
  )
}
