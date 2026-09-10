"use client"

import { Loader2 } from "lucide-react"
import { useCheckin } from "@/features/checkin/hooks/use-checkin"

type Props = Pick<
  ReturnType<typeof useCheckin>,
  "selectedEventId" | "manualCode" | "setManualCode" | "isScanning" | "handleScan"
>

export function ScanInput({
  selectedEventId,
  manualCode,
  setManualCode,
  isScanning,
  handleScan,
}: Props) {
  return (
    <>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nhập mã vé hoặc chuỗi token QR..."
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          disabled={!selectedEventId}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleScan()
            }
          }}
          className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary font-mono uppercase disabled:opacity-50"
        />
        <button
          type="button"
          disabled={isScanning || !manualCode.trim() || !selectedEventId}
          onClick={() => handleScan()}
          className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1.5"
        >
          {isScanning && <Loader2 className="size-3.5 animate-spin" />}
          <span>Kiểm tra</span>
        </button>
      </div>
    </>
  )
}
