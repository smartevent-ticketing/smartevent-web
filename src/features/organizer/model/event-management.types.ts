import type { EventSubmissionReadiness, SalePhaseStatus } from "@/lib/api/event-setup-contract"

export interface EventManagementData {
  id: string
  name: string
  status: string
  location?: string
  date?: string
  startTime?: string
  endTime?: string
  expectedRevenue?: number
  totalTickets?: number
}

export interface AreaItem {
  id: string
  name: string
  type: "STANDING" | "SEATED"
  capacity: number
  totalSeats?: number
}

export interface TicketTypeItem {
  id: string
  name: string
  price: number
  totalQuota: number
  soldCount?: number
  areaName?: string
  areaId?: string
  description?: string
}

export interface SalePhaseItem {
  id: string
  ticketTypeId: string
  name: string
  price: number
  quantity: number
  saleStartAt: string
  saleEndAt: string
  status?: SalePhaseStatus
  maxPerOrder?: number
  maxPerUser?: number
  ticketTypeName?: string
}

export interface IssuedTicketItem {
  id: string
  ticketCode: string
  ticketTypeName: string
  areaName?: string
  seatName?: string
  status: "ACTIVE" | "CHECKED_IN" | "CANCELLED"
  checkedInAt?: string
  issuedAt?: string
}

export interface CreateAreaInput {
  name: string
  type: "STANDING" | "SEATED"
  capacity: number
}

export interface UpdateAreaInput {
  name: string
  type: "STANDING" | "SEATED"
  capacity: number
}

export interface CreateTicketTypeInput {
  name: string
  price?: number
  areaId?: string
  description?: string
}

export interface CreateSalePhaseInput {
  ticketTypeId: string
  name: string
  price: number
  quantity: number
  saleStartAt: string
  saleEndAt: string
  maxPerOrder?: number
  maxPerUser?: number
}

export interface EventManagementLoadResult {
  event: EventManagementData | null
  areas: AreaItem[]
  ticketTypes: TicketTypeItem[]
  salePhases: SalePhaseItem[]
  issuedTickets: IssuedTicketItem[]
  readiness: EventSubmissionReadiness | null
  errorMessage?: string
}
