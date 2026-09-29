"use client"

import { DashboardKpis } from "./dashboard-kpis"
import { DashboardTopEvents } from "./dashboard-top-events"
import { DashboardEventsTable } from "./dashboard-events-table"
import type { OrganizerDashboardProps } from "./dashboard-types"

export function OrganizerDashboardPanel(props: OrganizerDashboardProps) {
  return (
    <div className="space-y-8">
      <DashboardKpis
        isLoading={props.isLoading}
        totalEvents={props.totalEvents}
        publishedCount={props.publishedCount}
        pendingCount={props.pendingCount}
        draftCount={props.draftCount}
        completedCount={props.completedCount}
        totalRevenue={props.totalRevenue}
        totalSold={props.totalSold}
        totalCapacity={props.totalCapacity}
        totalHeld={props.totalHeld}
        overallOccupancyRate={props.overallOccupancyRate}
        avgRevenuePerSoldTicket={props.avgRevenuePerSoldTicket}
        setActiveSection={props.setActiveSection}
      />
      <DashboardTopEvents events={props.events} />
      <DashboardEventsTable
        events={props.events}
        isLoading={props.isLoading}
        totalEvents={props.totalEvents}
        setActiveSection={props.setActiveSection}
      />
    </div>
  )
}
