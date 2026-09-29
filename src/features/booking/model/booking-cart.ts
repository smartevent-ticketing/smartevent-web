import type { components } from "@/lib/api/schema"

export type EventSeat = components["schemas"]["EventSeatResponse"]

export function getSeatLabel(seat: EventSeat): string {
  return seat.label || `${seat.rowName || ""}${seat.seatNumber || ""}` || "Ghế"
}

export interface AvailableTier {
  id: string
  name: string
  description?: string
  areaId: string
  areaName: string
  areaType: "STANDING" | "SEATED"
  phaseId: string
  phaseName: string
  price: number
  available: number
  maxAllowed: number
}

export interface CartItem {
  id: string
  ticketTypeId: string
  ticketTypeName: string
  salePhaseId: string
  salePhaseName: string
  areaId: string
  areaName: string
  areaType: "STANDING" | "SEATED"
  unitPrice: number
  quantity: number
  maxAllowed: number
  available: number
  selectedSeats?: EventSeat[]
}
