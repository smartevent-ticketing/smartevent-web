import type { components } from "@/lib/api/schema"

export type CheckinStatus = "IDLE" | "SUCCESS" | "DUPLICATE" | "INVALID" | "TIMEOUT"
export interface ScanRecord {
  id: string
  code: string
  buyerName: string
  tier: string
  gate: string
  time: string
  status: "SUCCESS" | "DUPLICATE" | "INVALID"
}

/**
 * Distinguish dynamic/cryptographic QR tokens from human-entered ticket codes.
 * QR tokens contain signatures, hashes, UUIDs, or delimiters that are case-sensitive.
 * Uppercasing a QR token changes its SHA-256 hash and causes backend findByTokenHash(hash) to fail.
 * Regular ticket codes (e.g. SE-SOL-89241-01) should be trimmed and normalized to uppercase.
 */
export function isQrToken(input: string): boolean {
  const trimmed = input.trim()
  if (trimmed.startsWith("TCK-QR.") || trimmed.startsWith("SE-QR.")) return true
  if (trimmed.includes(".") || trimmed.includes(":") || trimmed.includes("/")) return true
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(trimmed))
    return true
  if (trimmed.length > 24 && /[a-z]/.test(trimmed) && /[A-Z]/.test(trimmed)) return true
  return false
}

export function normalizeScanInput(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ""
  if (isQrToken(trimmed)) {
    return trimmed
  }
  return trimmed.toUpperCase()
}

export function mapCheckinHistory(items: components["schemas"]["TicketCheckin"][]): ScanRecord[] {
  return items.map((item, index) => ({
    id: item.id ?? `${item.ticketId}-${item.checkedAt}-${index}`,
    code: item.ticketId?.slice(0, 13).toUpperCase() ?? "MÃ VÉ",
    buyerName: item.checkedByUserId ? `NV: ${item.checkedByUserId.slice(0, 8)}` : "Hệ thống",
    tier: "Vé điện tử",
    gate: item.gateName ?? "Cổng chung",
    time: item.checkedAt ? new Date(item.checkedAt).toLocaleTimeString("vi-VN") : "--:--",
    status: item.result === "SUCCESS" || item.result === "DUPLICATE" ? item.result : "INVALID",
  }))
}
