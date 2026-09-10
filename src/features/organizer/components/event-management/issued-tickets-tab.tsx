"use client"

import { useState } from "react"
import { Search, Ticket, CheckCircle2, Clock } from "lucide-react"

interface IssuedTicketItem {
  id: string
  ticketCode: string
  ticketTypeName: string
  areaName?: string
  seatName?: string
  status: "ACTIVE" | "CHECKED_IN" | "CANCELLED"
  checkedInAt?: string
  issuedAt?: string
}

interface IssuedTicketsTabProps {
  eventId: string
  tickets: IssuedTicketItem[]
}

export function IssuedTicketsTab({ tickets }: IssuedTicketsTabProps) {
  const [query, setQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")

  const filteredTickets = tickets.filter((t) => {
    const matchQuery =
      t.ticketCode.toLowerCase().includes(query.toLowerCase()) ||
      t.ticketTypeName.toLowerCase().includes(query.toLowerCase())
    const matchStatus = filterStatus === "ALL" || t.status === filterStatus
    return matchQuery && matchStatus
  })

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-on-surface">Vé đã phát hành của sự kiện</h3>
          <p className="text-xs text-on-surface-variant">
            Danh sách vé đã được khách hàng thanh toán thành công và có hiệu lực tham gia sự kiện.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="size-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mã vé hoặc hạng vé..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant text-xs bg-white"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-outline-variant text-xs bg-white font-medium"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Chưa soát vé (Hợp lệ)</option>
            <option value="CHECKED_IN">Đã check-in tại cổng</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white border border-outline-variant/60 rounded-3xl shadow-xs overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Ticket className="size-10 text-primary/40 mx-auto" />
            <h4 className="text-sm font-bold text-on-surface">Không tìm thấy vé nào</h4>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Chưa có vé nào được phát hành hoặc không có vé phù hợp với bộ lọc tìm kiếm hiện tại.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-xs uppercase font-bold text-on-surface-variant border-b border-outline-variant/60">
                <tr>
                  <th className="px-6 py-4">Mã vé (Ticket Code)</th>
                  <th className="px-6 py-4">Hạng vé</th>
                  <th className="px-6 py-4">Vị trí</th>
                  <th className="px-6 py-4">Ngày phát hành</th>
                  <th className="px-6 py-4">Trạng thái Check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filteredTickets.map((t) => {
                  const isCheckedIn = t.status === "CHECKED_IN"
                  const isCancelled = t.status === "CANCELLED"

                  return (
                    <tr key={t.id} className="hover:bg-surface-container-low/40 transition">
                      <td className="px-6 py-4 font-mono font-bold text-primary">{t.ticketCode}</td>
                      <td className="px-6 py-4 font-medium text-on-surface">{t.ticketTypeName}</td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant">
                        {t.areaName || "Khu vực chung"}{" "}
                        {t.seatName && <strong className="text-on-surface">({t.seatName})</strong>}
                      </td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant font-mono">
                        {t.issuedAt ? new Date(t.issuedAt).toLocaleString("vi-VN") : "Gần đây"}
                      </td>
                      <td className="px-6 py-4">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle2 className="size-3" />
                            <span>
                              Đã check-in (
                              {t.checkedInAt
                                ? new Date(t.checkedInAt).toLocaleTimeString("vi-VN")
                                : "Tại cổng"}
                              )
                            </span>
                          </span>
                        ) : isCancelled ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                            Đã hủy
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <Clock className="size-3" />
                            <span>Chưa soát vé</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
