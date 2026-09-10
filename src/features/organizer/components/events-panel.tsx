"use client"

import Link from "next/link"
import type { useOrganizerEvents } from "@/features/organizer/hooks/use-organizer-events"

type Props = Pick<ReturnType<typeof useOrganizerEvents>, "events">
export function OrganizerEventsPanel({ events }: Props) {
  return (
    <div className="bg-white rounded-3xl border border-outline-variant/60 shadow-xs p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-on-surface">Tất cả sự kiện ({events.length})</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-low text-xs uppercase font-bold text-on-surface-variant border-b border-outline-variant/60">
            <tr>
              <th className="px-5 py-3.5">Tên sự kiện</th>
              <th className="px-5 py-3.5">Thời gian & Địa điểm</th>
              <th className="px-5 py-3.5">Vé đã bán</th>
              <th className="px-5 py-3.5">Trạng thái</th>
              <th className="px-5 py-3.5 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40 text-xs sm:text-sm">
            {events.map((ev) => (
              <tr key={ev.id} className="hover:bg-surface-container-low/50 transition">
                <td className="px-5 py-4 font-bold text-on-surface">{ev.name}</td>
                <td className="px-5 py-4 text-on-surface-variant">
                  <div>{ev.date}</div>
                  <div className="text-xs text-gray-400">{ev.venue}</div>
                </td>
                <td className="px-5 py-4">
                  {ev.ticketsSold !== undefined && ev.totalTickets !== undefined ? (
                    `${ev.ticketsSold} / ${ev.totalTickets}`
                  ) : (
                    <span className="text-on-surface-variant text-xs italic">Chưa có báo cáo</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      ev.status === "PUBLISHED"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : ev.status === "PENDING_APPROVAL"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {ev.status === "PUBLISHED"
                      ? "Đang mở bán"
                      : ev.status === "PENDING_APPROVAL"
                        ? "Chờ duyệt"
                        : ev.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right space-x-2">
                  <Link
                    href={`/organizer/events/${ev.id}`}
                    className="inline-block px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition shadow-xs"
                  >
                    Quản lý
                  </Link>
                  <Link
                    href={`/events/${ev.id}`}
                    className="inline-block px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg transition"
                  >
                    Xem trang bán
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
