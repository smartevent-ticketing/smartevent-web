"use client"

import { Clock, History, RefreshCw } from "lucide-react"
import { useCheckin } from "@/features/checkin/hooks/use-checkin"

type Props = Pick<
  ReturnType<typeof useCheckin>,
  | "selectedEventId"
  | "history"
  | "isLoadingHistory"
  | "refreshHistory"
  | "successCount"
  | "duplicateCount"
  | "invalidCount"
>

export function CheckinHistory({
  selectedEventId,
  history,
  isLoadingHistory,
  refreshHistory,
  successCount,
  duplicateCount,
  invalidCount,
}: Props) {
  return (
    <>
      <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="size-4 text-cyan-400" />
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Lịch sử soát vé gần nhất
            </span>
          </div>

          <button
            type="button"
            onClick={() => refreshHistory()}
            disabled={isLoadingHistory || !selectedEventId}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition cursor-pointer disabled:opacity-50"
            title="Tải lại lịch sử"
          >
            <RefreshCw
              className={`size-3.5 ${isLoadingHistory ? "animate-spin text-cyan-400" : ""}`}
            />
          </button>
        </div>

        {/* Mini Status Breakdown */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
          <div className="p-2 rounded-xl bg-green-950/50 border border-green-800/40 text-green-400">
            {successCount} Hợp lệ
          </div>
          <div className="p-2 rounded-xl bg-amber-950/50 border border-amber-800/40 text-amber-400">
            {duplicateCount} Trùng
          </div>
          <div className="p-2 rounded-xl bg-red-950/50 border border-red-800/40 text-red-400">
            {invalidCount} Sai vé
          </div>
        </div>

        <div className="space-y-2 pt-1 max-h-72 overflow-y-auto pr-1">
          {history.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-xs">
              {selectedEventId
                ? "Chưa có lượt quét nào cho sự kiện này"
                : "Chưa chọn sự kiện để xem lịch sử"}
            </div>
          ) : (
            history.map((rec) => (
              <div
                key={rec.id}
                className="p-2.5 rounded-xl bg-gray-800/80 border border-gray-700/60 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-mono font-bold text-white flex items-center gap-2">
                    <span>{rec.code}</span>
                    <span className="text-[10px] font-normal text-gray-400">({rec.gate})</span>
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                    <span>{rec.buyerName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-gray-500" />
                      {rec.time}
                    </span>
                  </div>
                </div>

                {rec.status === "SUCCESS" && (
                  <span className="px-2 py-0.5 rounded-md bg-green-500/20 text-green-400 text-[10px] font-bold border border-green-500/30">
                    HỢP LỆ
                  </span>
                )}
                {rec.status === "DUPLICATE" && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                    TRÙNG
                  </span>
                )}
                {rec.status === "INVALID" && (
                  <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                    SAI VÉ
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
