import type { DisplayEvent } from "../model/organizer-event"

export type OrganizerDashboardProps = {
  events: DisplayEvent[]
  isLoading: boolean
  totalEvents: number
  publishedCount: number
  pendingCount: number
  draftCount: number
  completedCount: number
  totalRevenue: number
  totalSold: number
  totalCapacity: number
  totalHeld: number
  overallOccupancyRate: number
  avgRevenuePerSoldTicket: number
  setActiveSection: (section: "dashboard" | "events" | "inventory") => void
}

export type DashboardKpisProps = Pick<
  OrganizerDashboardProps,
  | "isLoading"
  | "totalEvents"
  | "publishedCount"
  | "pendingCount"
  | "draftCount"
  | "completedCount"
  | "totalRevenue"
  | "totalSold"
  | "totalCapacity"
  | "totalHeld"
  | "overallOccupancyRate"
  | "avgRevenuePerSoldTicket"
  | "setActiveSection"
>

export type DashboardEventsTableProps = Pick<
  OrganizerDashboardProps,
  "events" | "isLoading" | "totalEvents" | "setActiveSection"
>
