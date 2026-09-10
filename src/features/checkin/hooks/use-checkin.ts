"use client"

import { useEffect, useRef, useState } from "react"
import { checkinApi } from "../api/checkin-api"
import { normalizeScanInput, type CheckinStatus } from "../model/checkin"
import { useCheckinEvents } from "./use-checkin-events"
import { useCheckinHistory } from "./use-checkin-history"
import { getApiErrorMessage } from "@/lib/api/result"

interface ScanResult {
  eventId: string
  status: CheckinStatus
  code: string
  name: string
  tier: string
  gate: string
  seatCode?: string
  time?: string
  message?: string
}

export function useCheckin() {
  const events = useCheckinEvents()
  const history = useCheckinHistory(events.selectedEventId)
  const [gateName, setGateName] = useState("Cổng A - Cửa chính")
  const [manualCode, setManualCode] = useState("")
  const [isScanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const inFlight = useRef<AbortController | null>(null)
  useEffect(() => () => inFlight.current?.abort(), [])

  async function handleScan(input?: string) {
    const code = normalizeScanInput(input ?? manualCode)
    const eventId = events.selectedEventId
    if (!code || !eventId || inFlight.current) return
    const controller = new AbortController()
    inFlight.current = controller
    setScanning(true)
    try {
      const response = await checkinApi.scanTicket({
        body: { ticketCodeOrToken: code, eventId, gateName },
        signal: controller.signal,
      })
      if (controller.signal.aborted) return
      const data = response.data?.data
      setResult({
        eventId,
        status: data?.result ?? "INVALID",
        code: data?.ticketCode ?? code,
        name: data?.attendeeName ?? "Khách tham dự",
        tier: data?.ticketTypeName ?? "Vé sự kiện",
        gate: data?.gateName ?? gateName,
        seatCode: data?.seatCode ?? undefined,
        message: data?.message ?? "Chưa nhận được kết quả soát vé hợp lệ.",
        time: data?.checkedAt ? new Date(data.checkedAt).toLocaleTimeString("vi-VN") : undefined,
      })
      history.refreshHistory()
    } catch (error) {
      if (!controller.signal.aborted)
        setResult({
          eventId,
          status: "TIMEOUT",
          code,
          name: "Chưa xác nhận",
          tier: "Chưa xác định",
          gate: gateName,
          message: getApiErrorMessage(
            error,
            "Không thể xác nhận kết quả. Vui lòng tải lại lịch sử trước khi thử tiếp.",
          ),
        })
    } finally {
      if (!controller.signal.aborted) {
        setScanning(false)
        setManualCode("")
      }
      if (inFlight.current === controller) inFlight.current = null
    }
  }
  const lastScanned = result?.eventId === events.selectedEventId ? result : null
  return {
    ...events,
    ...history,
    gateName,
    setGateName,
    manualCode,
    setManualCode,
    isScanning,
    handleScan,
    lastScanned,
    resultStatus: lastScanned?.status ?? "IDLE",
    loadError: events.eventsError ?? history.historyError,
    successCount: history.history.filter((item) => item.status === "SUCCESS").length,
    duplicateCount: history.history.filter((item) => item.status === "DUPLICATE").length,
    invalidCount: history.history.filter((item) => item.status === "INVALID").length,
  }
}
