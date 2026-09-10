"use client"
import { CatalogResults } from "./components/catalog-results"

import { Info } from "lucide-react"

import { useEventsCatalog } from "./hooks/use-events-catalog"

export function EventsCatalogView() {
  const { events, currentPage, setCurrentPage, totalPages, totalElements, isLoading, loadError } =
    useEventsCatalog()
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Tất cả sự kiện</h1>
          <p className="text-sm text-on-surface-variant mt-1.5">
            Khám phá danh sách các sự kiện văn hóa, thể thao và nghệ thuật hot nhất.
          </p>
        </div>
      </div>

      {loadError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {loadError}
        </div>
      )}

      {/* Info notice for server pagination */}
      <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-primary shrink-0" />
          <span>
            Danh sách hiển thị theo phân trang máy chủ thực tế. Bộ lọc đa tiêu chí đang chờ đồng bộ
            API tìm kiếm phía máy chủ.
          </span>
        </div>
        <span className="font-semibold text-on-surface hidden sm:inline">
          Tổng cộng: {totalElements} sự kiện
        </span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-outline-variant/60 overflow-hidden animate-pulse"
            >
              <div className="h-52 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="pt-4 border-t border-gray-100 flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-6 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Real backend events view */}
      {/* Real backend events view */}
      <CatalogResults {...{ events, currentPage, setCurrentPage, totalPages, isLoading }} />
    </div>
  )
}
