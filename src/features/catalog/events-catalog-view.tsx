"use client"

import { useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { CatalogResults } from "./components/catalog-results"
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
  } = useEventsCatalog(filters)

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCurrentPage(0)
    router.push(catalogUrl({ q: query, city, categoryId }))
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="max-w-2xl">
        <span className="nightline-kicker">Khám phá / SmartEvent</span>
        <h1 className="nightline-heading mt-3 text-4xl text-[#f8f2ed] sm:text-6xl">
          Tìm sự kiện cho bạn.
        </h1>
        <p className="mt-4 text-base text-[#bcb7c4]">
          Chọn một sự kiện đáng mong đợi, rồi để những khoảnh khắc đẹp bắt đầu.
        </p>
      </div>

      <form
        onSubmit={submitSearch}
        className="grid grid-cols-1 gap-3 rounded-2xl border border-white/15 bg-[#242331] p-4 md:grid-cols-[minmax(0,1fr)_12rem_12rem_auto]"
      >
        <input
          type="search"
          aria-label="Từ khóa sự kiện"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tên sự kiện hoặc địa điểm"
          className="rounded-xl border border-white/15 bg-[#1a1a26] px-4 py-3 text-sm text-white outline-none placeholder:text-[#aaa6b7] focus:border-[#ff9479]"
        />
        <select
          aria-label="Thành phố"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className="rounded-xl border border-white/15 bg-[#1a1a26] px-3 py-3 text-sm text-white outline-none focus:border-[#ff9479]"
        >
          <option value="">Tất cả thành phố</option>
          <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
          <option value="Hà Nội">Hà Nội</option>
        </select>
        <select
          aria-label="Danh mục"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="rounded-xl border border-white/15 bg-[#1a1a26] px-3 py-3 text-sm text-white outline-none focus:border-[#ff9479]"
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
        <button
          type="submit"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#ff8063] px-5 py-3 text-sm font-bold text-[#261621] hover:bg-[#ff9b83]"
        >
          <Search className="size-4" /> Tìm kiếm
        </button>
      </form>

      {loadError && (
        <div
          role="alert"
          className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200"
        >
          {loadError}
        </div>
      )}
      <p className="text-sm text-[#aaa6b7]">
        Tìm thấy {totalElements.toLocaleString("vi-VN")} sự kiện
      </p>
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="h-[370px] animate-pulse rounded-2xl bg-[#242331]" />
          ))}
        </div>
      )}
      <CatalogResults {...{ events, currentPage, setCurrentPage, totalPages, isLoading }} />
    </div>
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
