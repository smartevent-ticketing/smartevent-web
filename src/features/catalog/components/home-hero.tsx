"use client"

import { ArrowRight, ChevronDown, MapPin, Search, Ticket } from "lucide-react"
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
  isLoading: boolean
}

export function HomeHero({
  searchQuery,
  setSearchQuery,
  selectedCity,
  setSelectedCity,
  events,
  bannerUrls,
  isLoading,
}: Props) {
  const router = useRouter()
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const city = selectedCity === "hcm" ? "Hồ Chí Minh" : selectedCity === "hn" ? "Hà Nội" : ""
    router.push(catalogUrl({ q: searchQuery, city }))
  }

  return (
    <section className="se-home-hero relative overflow-hidden border-b border-border bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_20%,#fff1e9_0%,transparent_55%)]"
      />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1fr_1fr] lg:gap-14 lg:px-8 lg:py-16">
        <div className="min-w-0">
          <span className="se-hero-enter inline-flex items-center gap-2 rounded-full border border-[#eed5cb] bg-white/80 px-3 py-1.5 text-xs font-semibold text-primary">
            <span className="size-1.5 rounded-full bg-primary" /> Một cuộc hẹn với điều bạn yêu
            thích
          </span>
          <h1
            className="se-hero-enter nightline-heading mt-6 text-[clamp(2.6rem,4.7vw,4.15rem)]"
            style={{ animationDelay: "70ms" }}
          >
            Những trải nghiệm
            <br className="hidden xl:block" /> đáng để{" "}
            <span className="se-gradient-text">có mặt.</span>
          </h1>
          <p
            className="se-hero-enter mt-5 max-w-lg text-sm leading-7 text-muted sm:text-base sm:leading-8"
            style={{ animationDelay: "140ms" }}
          >
            Từ đêm nhạc bạn chờ đợi đến cuộc gặp gỡ truyền cảm hứng. Tìm sự kiện của bạn, chọn vé và
            sẵn sàng cho khoảnh khắc tiếp theo.
          </p>

          <form
            onSubmit={submitSearch}
            className="se-hero-enter se-search-shell mt-8 rounded-2xl border border-border bg-white p-2 shadow-[0_8px_30px_#18223006]"
            style={{ animationDelay: "210ms" }}
          >
            <label className="flex items-center gap-3 px-3">
              <Search className="size-5 shrink-0 text-primary" />
              <span className="sr-only">Tìm sự kiện</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tên sự kiện, địa điểm..."
                className="w-full min-w-0 bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-slate-400"
              />
            </label>
            <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
              <label className="flex min-w-0 items-center gap-2 px-3 text-muted">
                <MapPin className="size-4 shrink-0" />
                <span className="sr-only">Thành phố</span>
                <select
                  aria-label="Thành phố"
                  value={selectedCity}
                  onChange={(event) => setSelectedCity(event.target.value)}
                  className="min-w-0 appearance-none bg-transparent py-2 pr-1 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <option value="all">Toàn quốc</option>
                  <option value="hcm">TP. HCM</option>
                  <option value="hn">Hà Nội</option>
                </select>
                <ChevronDown className="size-3 shrink-0" />
              </label>
              <button
                type="submit"
                className="se-button inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover sm:px-5"
              >
                Tìm sự kiện <ArrowRight className="size-4" />
              </button>
            </div>
          </form>
          <div
            className="se-hero-enter mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted"
            style={{ animationDelay: "270ms" }}
          >
            <span>Khám phá tại</span>
            <Link
              href={catalogUrl({ city: "Hà Nội" })}
              className="se-text-link inline-flex min-h-8 items-center gap-1 font-semibold text-foreground hover:text-primary"
            >
              Hà Nội <ArrowRight className="size-3" />
            </Link>
            <span aria-hidden="true" className="text-slate-300">
              /
            </span>
            <Link
              href={catalogUrl({ city: "Hồ Chí Minh" })}
              className="se-text-link inline-flex min-h-8 items-center gap-1 font-semibold text-foreground hover:text-primary"
            >
              TP. Hồ Chí Minh <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
        <div className="se-hero-enter min-w-0" style={{ animationDelay: "230ms" }}>
          {isLoading ? (
            <div
              aria-label="Đang tải sự kiện nổi bật"
              className="h-[460px] animate-pulse rounded-3xl bg-surface-container-low"
            />
          ) : (
            <FeaturedCarousel events={events} bannerUrls={bannerUrls} />
          )}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
            <Ticket className="size-4 text-primary" /> Khám phá sự kiện · Chọn vé · Nhận mã QR
          </div>
        </div>
      </div>
    </section>
  )
}
