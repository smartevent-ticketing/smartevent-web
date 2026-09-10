import type { components } from "@/lib/api/schema"

// ── Re-export schema types used across admin hooks & components ──

export type CategoryResponse = components["schemas"]["CategoryResponse"]
export type VenueResponse = components["schemas"]["VenueResponse"]
export type OutboxEvent = components["schemas"]["OutboxEvent"]

// ── Admin-specific domain types ──

/** Notification feedback shown after admin actions. */
export interface AdminNotification {
  type: "success" | "info" | "error"
  text: string
}

/** Outbox statistics returned by the stats endpoint. */
export interface OutboxStats {
  pendingCount?: number
  publishedCount?: number
  failedCount?: number
}

/**
 * Pending event awaiting admin approval.
 * Shape will evolve once the backend provides a dedicated pending-events endpoint.
 */
export interface PendingEvent {
  id: string
  name: string
  organizer: string
  venue: string
  submittedDate: string
  expectedTickets: number
  priceRange: string
}
