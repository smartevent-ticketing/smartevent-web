"use client"
import { CheckinHistory } from "./components/checkin-history"
import { ScanResult } from "./components/scan-result"
import { ScanInput } from "./components/scan-input"
import { ScannerViewport } from "./components/scanner-viewport"
import { EventGateSelector } from "./components/event-gate-selector"

import Link from "next/link"
import { Home, QrCode } from "lucide-react"

import { useCheckin } from "./hooks/use-checkin"

export function CheckinAppView() {
  const {
    events,
    selectedEventId,
    setSelectedEventId,
    gateName,
    setGateName,
    manualCode,
    setManualCode,
    isLoadingEvents,
    isScanning,
    resultStatus,
    lastScanned,
    history,
    isLoadingHistory,
    refreshHistory,
    handleScan,
    successCount,
    duplicateCount,
    invalidCount,
  } = useCheckin()
  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-md mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
              <QrCode className="size-6" />
            </span>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>SMART CHECK-IN</span>
              </h1>
              <p className="text-[11px] text-gray-400">Ứng dụng soát vé điện tử trực tiếp</p>
            </div>
          </div>

          <Link
            href="/organizer"
            className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Home className="size-4" />
            <span>Thoát</span>
          </Link>
        </div>

        {/* Event & Gate Selector */}
        <EventGateSelector
          {...{
            events,
            selectedEventId,
            setSelectedEventId,
            gateName,
            setGateName,
            isLoadingEvents,
            successCount,
          }}
        />

        {/* Camera Scanner Viewport */}
        <ScannerViewport onScan={handleScan} isScanning={isScanning} />

        {/* Manual Code Entry Form */}
        <ScanInput {...{ selectedEventId, manualCode, setManualCode, isScanning, handleScan }} />

        {/* Real-time Verification Result Banners */}
        <ScanResult {...{ resultStatus, lastScanned, handleScan }} />

        {/* Scan History Feed */}
        <CheckinHistory
          {...{
            selectedEventId,
            history,
            isLoadingHistory,
            refreshHistory,
            successCount,
            duplicateCount,
            invalidCount,
          }}
        />
      </div>
    </div>
  )
}
