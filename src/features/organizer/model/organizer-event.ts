export interface DisplayEvent {
  id: string
  name: string
  category: string
  venue: string
  date: string
  rawDate?: string
  ticketsSold: number
  totalTickets: number
  heldTickets: number
  availableTickets: number
  revenue: number
  status: string
  occupancyRate: number
  phasesCount: number
}
