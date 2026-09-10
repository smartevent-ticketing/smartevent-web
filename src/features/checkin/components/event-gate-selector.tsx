"use client"

import { CheckCircle2, DoorOpen, Loader2 } from "lucide-react"
import { useCheckin } from "@/features/checkin/hooks/use-checkin"

type Props = Pick<
  ReturnType<typeof useCheckin>,
  | "events"
  | "selectedEventId"
  | "setSelectedEventId"
  | "gateName"
  | "setGateName"
  | "isLoadingEvents"
  | "successCount"
>

export function EventGateSelector({
  events,
  selectedEventId,
  setSelectedEventId,
  gateName,
  setGateName,
  isLoadingEvents,
  successCount,
}: Props) {
  return (
    <>
      <div className="bg-gray-900/90 border border-gray-800 p-4 rounded-2xl space-y-3 shadow-lg">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Sự kiện đang soát vé
          </label>
          {isLoadingEvents ? (
            <div className="flex items-center gap-2 py-2 text-xs text-gray-400">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>Đang tải danh sách sự kiện...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="p-3 bg-gray-800/80 rounded-xl text-xs text-amber-400 border border-amber-500/30">
              Chưa có sự kiện nào để soát vé. Vui lòng tạo hoặc công bố sự kiện trước.
            </div>
          ) : (
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer truncate"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} {ev.venueName ? `(${ev.venueName})` : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
              Cổng vào
            </label>
            <div className="relative">
              <DoorOpen className="size-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={gateName}
                onChange={(e) => setGateName(e.target.value)}
                placeholder="VD: Cổng A"
                className="w-full pl-8 pr-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
              Đã soát vé
            </label>
            <div className="flex items-center gap-2 h-8 px-2.5 bg-gray-800/80 rounded-lg border border-gray-700/60 text-xs font-bold text-green-400">
              <CheckCircle2 className="size-3.5 text-green-400" />
              <span>{successCount} lượt</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
