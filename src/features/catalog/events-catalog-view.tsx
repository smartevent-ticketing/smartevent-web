"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react"
import { CatalogResults } from "./components/catalog-results"
import { EventCardSkeleton } from "./components/event-card"
import { useEventsCatalog } from "./hooks/use-events-catalog"
import { catalogUrl, type CatalogFilters } from "./model/catalog-url"

function EventsCatalogContent({ filters }: { filters: CatalogFilters }) {
  const router = useRouter()
  const [query, setQuery] = useState(filters.q)
  const [city, setCity] = useState(filters.city)
  const [categoryId, setCategoryId] = useState(filters.categoryId)
  const {
    events,
    categories,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    isLoading,
    loadError,
    retry,
  } = useEventsCatalog(filters)
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCurrentPage(0)
    router.push(catalogUrl({ q: query, city, categoryId }))
  }
  const activeFilters = [
    filters.q ? { key: "q" as const, label: "“" + filters.q + "”" } : null,
    filters.city ? { key: "city" as const, label: filters.city } : null,
    filters.categoryId
      ? {
          key: "categoryId" as const,
          label:
            categories.find((item) => item.id === filters.categoryId)?.name || "Danh mục đã chọn",
        }
      : null,
  ].filter((item) => item !== null)

  return (
    <main>
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8 lg:py-12">
          <nav aria-label="Đường dẫn" className="mb-5 flex items-center gap-2 text-xs text-muted">
            <Link href="/" className="hover:text-primary">
              Trang chủ
            </Link>
            <ChevronRight className="size-3" />
            <span aria-current="page">Khám phá sự kiện</span>
          </nav>
          <div className="se-hero-enter flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="nightline-kicker">Khám phá cùng SmartEvent</span>
              <h1 className="nightline-heading mt-2 text-4xl text-foreground sm:text-5xl">
                Tìm trải nghiệm tiếp theo.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
                Một đêm nhạc, một sân khấu hay một cuộc gặp gỡ mới. Chọn điều bạn muốn có mặt.
              </p>
            </div>
            <Link
              href="/account"
              className="se-text-link inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-xs font-semibold text-foreground hover:text-primary"
            >
              Vé của tôi <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[248px_minmax(0,1fr)] lg:px-8 lg:py-10">
        <aside className="self-start lg:sticky lg:top-26" aria-label="Bộ lọc sự kiện">
          <form
            onSubmit={submitSearch}
            className="rounded-2xl border border-border bg-white p-5 shadow-[0_2px_4px_#18223002]"
          >
            <div className="mb-6 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <SlidersHorizontal className="size-4 text-primary" />
                Bộ lọc sự kiện
              </h2>
              {activeFilters.length > 0 && (
                <Link
                  href="/events"
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Xóa lọc
                </Link>
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
              <label className="block text-xs font-semibold text-foreground">
                Từ khóa
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <Search className="size-4 shrink-0 text-slate-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Tên sự kiện, địa điểm"
                    className="w-full min-w-0 bg-transparent py-3 text-xs font-normal outline-none"
                  />
                </div>
              </label>
              <label className="block text-xs font-semibold text-foreground">
                Thành phố
                <select
                  aria-label="Thành phố"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-3 text-xs font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">Tất cả thành phố</option>
                  {city && city !== "Hồ Chí Minh" && city !== "Hà Nội" && (
                    <option value={city}>{city}</option>
                  )}
                  <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                </select>
              </label>
              <label className="block text-xs font-semibold text-foreground">
                Danh mục
                <select
                  aria-label="Danh mục"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-3 text-xs font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories
                    .filter((category) => category.id)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <button
              type="submit"
              className="se-button mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-white hover:bg-primary-hover"
            >
              <Search className="size-4" />
              Áp dụng bộ lọc
            </button>
            <p className="mt-4 text-[11px] leading-5 text-muted">
              Kết hợp các bộ lọc để tìm sự kiện phù hợp với bạn.
            </p>
          </form>
        </aside>
        <section className="min-w-0" aria-label="Kết quả sự kiện" aria-busy={isLoading}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-foreground">
              {activeFilters.length > 0 ? "Kết quả tìm kiếm" : "Tất cả sự kiện"}
            </h2>
            <p role="status" className="text-xs text-muted">
              {isLoading
                ? "Đang tìm sự kiện…"
                : loadError
                  ? "Chưa tải được kết quả"
                  : totalElements.toLocaleString("vi-VN") + " sự kiện"}
            </p>
          </div>
          {activeFilters.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2" aria-label="Bộ lọc đang áp dụng">
              {activeFilters.map((item) => (
                <Link
                  key={item.key}
                  href={catalogUrl({ ...filters, [item.key]: "" })}
                  aria-label={"Bỏ bộ lọc " + item.label}
                  className="se-chip inline-flex min-h-9 max-w-full items-center gap-2 rounded-full border border-[#ecd4ca] bg-primary-container px-3 text-xs text-on-primary-container"
                >
                  <span className="truncate">{item.label}</span>
                  <X className="size-3 shrink-0" />
                </Link>
              ))}
            </div>
          )}
          {loadError && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-white p-6">
              <h3 className="text-sm font-bold text-foreground">Không thể tải danh sách sự kiện</h3>
              <p className="mt-2 text-xs leading-6 text-muted">{loadError}</p>
              <button
                type="button"
                onClick={retry}
                className="se-button mt-4 min-h-11 rounded-xl bg-primary px-5 text-xs font-semibold text-white hover:bg-primary-hover"
              >
                Thử lại
              </button>
            </div>
          )}
          {isLoading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <EventCardSkeleton key={item} />
              ))}
            </div>
          )}
          {!loadError && (
            <CatalogResults {...{ events, currentPage, setCurrentPage, totalPages, isLoading }} />
          )}
        </section>
      </div>
    </main>
  )
}

export function EventsCatalogView() {
  const searchParams = useSearchParams()
  const filters: CatalogFilters = {
    q: searchParams.get("q") ?? "",
    city: searchParams.get("city") ?? "",
    categoryId: searchParams.get("categoryId") ?? "",
  }
  return <EventsCatalogContent key={catalogUrl(filters)} filters={filters} />
}
