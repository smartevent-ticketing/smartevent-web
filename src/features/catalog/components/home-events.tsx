"use client"

import Link from "next/link"
import { Calendar, ChevronRight, Clock, Flame, MapPin } from "lucide-react"
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
import { useHome } from "@/features/catalog/hooks/use-home"

type Props = Pick<ReturnType<typeof useHome>, "events" | "isLoading" | "filteredRealEvents">

export function HomeEvents({ events, isLoading, filteredRealEvents }: Props) {
  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Flame className="size-4 text-red-500" />
              <span>Dành cho bạn</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-on-surface mt-1">Sự kiện nổi bật</h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="size-4" />
          </Link>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
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

        {/* Real data events */}
        {!isLoading && (
          <>
            {events.length === 0 ? (
              <div className="p-10 sm:p-14 text-center bg-white rounded-3xl border border-outline-variant/70 shadow-xs flex flex-col items-center justify-center max-w-2xl mx-auto">
                <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20">
                  <Calendar className="size-8" />
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-2">
                  Hiện chưa có sự kiện nào đang mở bán
                </h3>
                <p className="text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
                  Máy chủ backend chưa có sự kiện nào ở trạng thái công bố (PUBLISHED). Ban tổ chức
                  có thể tạo và gửi duyệt sự kiện mới trong màn hình quản lý BTC.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/events"
                    className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition shadow-sm"
                  >
                    Tất cả sự kiện
                  </Link>
                  <Link
                    href="/organizer/events/new"
                    className="px-5 py-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface text-sm font-semibold rounded-xl border border-outline-variant transition"
                  >
                    Tạo sự kiện mới (BTC)
                  </Link>
                </div>
              </div>
            ) : filteredRealEvents.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-outline-variant">
                <p className="text-on-surface-variant">
                  Không tìm thấy sự kiện nào phù hợp với bộ lọc hiện tại.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRealEvents.map((event) => {
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
            )}
          </>
        )}
      </section>
    </>
  )
}
