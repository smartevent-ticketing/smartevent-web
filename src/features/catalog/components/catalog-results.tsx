"use client"

import Link from "next/link"
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react"
function formatEventDate(dateStr?: string) {
  if (!dateStr) return { date: "Chưa công bố", time: "" }
  try {
    const d = new Date(dateStr)
    const date = d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    const time = d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
    return { date, time }
  } catch {
    return { date: dateStr, time: "" }
  }
}
import { useEventsCatalog } from "@/features/catalog/hooks/use-events-catalog"

type Props = Pick<
  ReturnType<typeof useEventsCatalog>,
  "events" | "currentPage" | "setCurrentPage" | "totalPages" | "isLoading"
>

export function CatalogResults({
  events,
  currentPage,
  setCurrentPage,
  totalPages,
  isLoading,
}: Props) {
  return (
    <>
      {!isLoading && (
        <>
          {events.length === 0 ? (
            <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border border-outline-variant shadow-xs flex flex-col items-center justify-center max-w-2xl mx-auto">
              <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20">
                <Calendar className="size-8" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">
                Hiện chưa có sự kiện nào được mở bán
              </h3>
              <p className="text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
                Máy chủ chưa có sự kiện nào đạt trạng thái PUBLISHED. Ban tổ chức có thể tạo và gửi
                duyệt sự kiện mới trong màn hình Quản lý BTC.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition shadow-sm"
                >
                  Về trang chủ
                </Link>
                <Link
                  href="/organizer/events/new"
                  className="px-5 py-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface text-sm font-semibold rounded-xl border border-outline-variant transition"
                >
                  Tạo sự kiện mới (BTC)
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => {
                  const { date, time } = formatEventDate(event.startTime)
                  const categoryName = event.categories?.[0]?.name || "Sự kiện"
                  const locationText = event.venue?.name || event.city || "Địa điểm thông báo sau"

                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.slug || event.id}`}
                      className="group flex flex-col bg-white rounded-2xl border border-outline-variant/70 overflow-hidden hover:shadow-xl hover:border-primary/40 transition duration-200"
                    >
                      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100">
                        <img
                          src="/images/concert-banner.jpg"
                          alt={event.name || "Event Banner"}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-semibold text-primary">
                          {categoryName}
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-on-surface group-hover:text-primary transition line-clamp-2 mb-3">
                          {event.name}
                        </h3>

                        <div className="space-y-1.5 text-xs text-on-surface-variant mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="size-3.5 text-primary shrink-0" />
                            <span>{date}</span>
                            {time && (
                              <>
                                <span className="text-gray-300">•</span>
                                <Clock className="size-3.5 text-primary shrink-0" />
                                <span>{time}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="size-3.5 text-primary shrink-0" />
                            <span className="truncate">{locationText}</span>
                          </div>
                        </div>

                        <div className="mt-auto pt-3 border-t border-outline-variant/60 flex items-center justify-between">
                          <span className="text-xs text-on-surface-variant">Mở bán vé</span>
                          <span className="text-xs font-semibold px-3 py-1.5 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white rounded-lg transition">
                            Xem chi tiết
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Server-side Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6">
                  <button
                    type="button"
                    disabled={currentPage <= 0}
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    className="flex items-center gap-1 px-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                  >
                    <ChevronLeft className="size-4" />
                    <span>Trang trước</span>
                  </button>

                  <span className="text-xs text-on-surface-variant font-medium px-2">
                    Trang {currentPage + 1} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="flex items-center gap-1 px-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                  >
                    <span>Trang sau</span>
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
