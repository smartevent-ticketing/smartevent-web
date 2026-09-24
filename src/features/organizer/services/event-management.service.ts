import { organizerApi } from "../api/organizer-api"
import type {
  EventManagementData,
  AreaItem,
  TicketTypeItem,
  SalePhaseItem,
  IssuedTicketItem,
  EventManagementLoadResult,
} from "../model/event-management.types"
import type { EventSubmissionReadiness, SalePhaseStatus } from "@/lib/api/event-setup-contract"

export function parseEventData(raw: any): EventManagementData {
  return {
    id: raw?.id || "",
    name: raw?.name || "Sự kiện không tên",
    status: raw?.status || "DRAFT",
    location: raw?.venue?.name
      ? `${raw.venue.name}, ${raw.venue.city || ""}`
      : "Chưa cấu hình địa điểm",
    date: raw?.startTime
      ? new Date(raw.startTime).toLocaleString("vi-VN")
      : "Chưa cấu hình thời gian",
    startTime: raw?.startTime,
    endTime: raw?.endTime,
    expectedRevenue: 0,
    totalTickets: 0,
  }
}

export function parseAreas(raw: any): AreaItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.areaType || a.type || "SEATED",
    capacity: a.capacity || 0,
    totalSeats: a.totalSeats,
  }))
}

export function parseSalePhases(raw: any): SalePhaseItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((p) => ({
    id: p.id,
    ticketTypeId: p.ticketTypeId,
    name: p.name,
    price: Number(p.price) || 0,
    quantity: Number(p.quantity) || 0,
    saleStartAt: p.saleStartAt || p.startTime,
    saleEndAt: p.saleEndAt || p.endTime,
    status: (p.status as SalePhaseStatus) || "DRAFT",
    maxPerOrder: p.maxPerOrder || 4,
    maxPerUser: p.maxPerUser,
    ticketTypeName: p.ticketTypeName,
  }))
}

export function parseTicketTypes(raw: any, phases: SalePhaseItem[]): TicketTypeItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((t) => {
    const matchedPhase = phases.find((p) => p.ticketTypeId === t.id)
    return {
      id: t.id,
      name: t.name,
      price: matchedPhase?.price ?? t.price ?? 0,
      totalQuota: matchedPhase?.quantity ?? t.totalQuota ?? 0,
      soldCount: (matchedPhase as any)?.soldCount ?? t.soldCount ?? 0,
      areaName: t.areaName || "Khu vực chung",
      areaId: t.eventAreaId || t.areaId,
      description: t.description || "",
    }
  })
}

export function parseIssuedTickets(raw: any): IssuedTicketItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((tk) => {
    let status: "ACTIVE" | "CHECKED_IN" | "CANCELLED" = "ACTIVE"
    if (tk.status === "USED" || tk.status === "CHECKED_IN") {
      status = "CHECKED_IN"
    } else if (tk.status === "CANCELLED" || tk.status === "VOID") {
      status = "CANCELLED"
    }
    return {
      id: tk.id,
      ticketCode: tk.ticketCode || tk.code || tk.id,
      ticketTypeName: tk.ticketTypeName || "Vé sự kiện",
      areaName: tk.areaName,
      seatName: tk.seatName || tk.seatCode,
      status,
      checkedInAt: tk.usedAt || tk.checkedInAt,
      issuedAt: tk.issuedAt || tk.createdAt,
    }
  })
}

export function computePhaseStats(phases: SalePhaseItem[]): {
  totalRevenue: number
  totalTickets: number
} {
  const totalRevenue = phases.reduce(
    (sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0),
    0,
  )
  const totalTickets = phases.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0)
  return { totalRevenue, totalTickets }
}

/**
 * Service orchestrating parallel data retrieval and mapping for event management
 */
export async function loadEventManagementData(eventId: string): Promise<EventManagementLoadResult> {
  const [eventRes, areasRes, typesRes, phasesRes, ticketsRes, readinessRes] =
    await Promise.allSettled([
      organizerApi.getEvent(eventId),
      organizerApi.getAreas(eventId),
      organizerApi.getTicketTypes(eventId),
      organizerApi.getSalePhases(eventId),
      organizerApi.getEventTickets(eventId),
      organizerApi.getSubmissionReadiness(eventId),
    ])

  let event: EventManagementData | null = null
  let errorMessage: string | undefined

  if (eventRes.status === "fulfilled" && eventRes.value?.data) {
    const ev = (eventRes.value.data as any)?.data ?? eventRes.value.data
    event = parseEventData(ev)
  } else {
    errorMessage =
      eventRes.status === "rejected"
        ? eventRes.reason?.message || "Không thể tải thông tin sự kiện."
        : "Dữ liệu sự kiện không hợp lệ."
  }

  // Parse Areas
  const rawAreas =
    areasRes.status === "fulfilled" && areasRes.value?.data
      ? ((areasRes.value.data as any)?.data ?? areasRes.value.data)
      : []
  const areas = parseAreas(rawAreas)

  // Parse Sale Phases
  const rawPhases =
    phasesRes.status === "fulfilled" && phasesRes.value?.data
      ? ((phasesRes.value.data as any)?.data ?? phasesRes.value.data)
      : []
  const salePhases = parseSalePhases(rawPhases)

  // Compute Revenue & Ticket Totals
  if (event) {
    const { totalRevenue, totalTickets } = computePhaseStats(salePhases)
    event.expectedRevenue = totalRevenue
    event.totalTickets = totalTickets
  }

  // Parse Ticket Types
  const rawTypes =
    typesRes.status === "fulfilled" && typesRes.value?.data
      ? ((typesRes.value.data as any)?.data ?? typesRes.value.data)
      : []
  const ticketTypes = parseTicketTypes(rawTypes, salePhases)

  // Parse Issued Tickets
  const rawTickets =
    ticketsRes.status === "fulfilled" && ticketsRes.value?.data
      ? ((ticketsRes.value.data as any)?.data ?? ticketsRes.value.data)
      : []
  const issuedTickets = parseIssuedTickets(rawTickets)

  // Parse Readiness
  const readiness =
    readinessRes.status === "fulfilled" && readinessRes.value?.data
      ? (((readinessRes.value.data as any)?.data ??
          readinessRes.value.data) as EventSubmissionReadiness)
      : null

  return {
    event,
    areas,
    ticketTypes,
    salePhases,
    issuedTickets,
    readiness,
    errorMessage,
  }
}

export async function fetchSubmissionReadiness(
  eventId: string,
): Promise<EventSubmissionReadiness | null> {
  try {
    const res = await organizerApi.getSubmissionReadiness(eventId)
    return (
      (((res as any)?.data?.data ?? (res as any)?.data ?? res) as EventSubmissionReadiness) || null
    )
  } catch {
    return null
  }
}
