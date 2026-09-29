import type { FetchOptions } from "openapi-fetch"
import { apiClient, type ApiPaths } from "@/lib/api/client"
import { requireApiSuccess } from "@/lib/api/result"
import type { components } from "@/lib/api/schema"
import type {
  EventFileType,
  SalePhaseStatus,
  CreateEventPayload,
  UpdateEventPayload,
} from "@/lib/api/event-setup-contract"

export const organizerApi = {
  createVenue: (body: components["schemas"]["VenueRequest"]) =>
    requireApiSuccess(apiClient.POST("/api/v1/venues", { body })),

  createEventSetup: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/events/setup"]["post"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.POST("/api/v1/events/setup", options)),

  completeDraftSetup: (
    eventId: string,
    tiers: components["schemas"]["CompleteDraftSetupRequest"]["tiers"],
  ) =>
    requireApiSuccess(
      apiClient.POST("/api/v1/events/{eventId}/complete-setup", {
        params: { path: { eventId } },
        body: { tiers },
      }),
    ),

  getEvent: (id: string) =>
    requireApiSuccess(
      apiClient.GET("/api/v1/events/{id}", {
        params: { path: { id } },
      }),
    ),

  updateEvent: (id: string, body: UpdateEventPayload) =>
    requireApiSuccess(
      apiClient.PUT("/api/v1/events/{id}", {
        params: { path: { id } },
        body: body as components["schemas"]["UpdateEventRequest"],
      }),
    ),

  submitEvent: (id: string) =>
    requireApiSuccess(
      apiClient.POST("/api/v1/events/{id}/submit", {
        params: { path: { id } },
      }),
    ),

  cancelEvent: (id: string, reason?: string) =>
    requireApiSuccess(
      apiClient.POST("/api/v1/events/{id}/cancel", {
        params: { path: { id }, query: reason ? { reason } : undefined },
      }),
    ),

  getAreas: (eventId: string) =>
    requireApiSuccess(
      apiClient.GET("/api/v1/events/{eventId}/areas", {
        params: { path: { eventId } },
      }),
    ),

  createArea: (
    eventId: string,
    body: {
      name: string
      areaType: "STANDING" | "SEATED"
      capacity: number
      sortOrder?: number
      description?: string
    },
  ) =>
    requireApiSuccess(
      apiClient.POST("/api/v1/events/{eventId}/areas", {
        params: { path: { eventId } },
        body,
      }),
    ),

  updateArea: (
    areaId: string,
    body: {
      name: string
      areaType: "STANDING" | "SEATED"
      capacity: number
      sortOrder?: number
      description?: string
    },
  ) =>
    requireApiSuccess(
      apiClient.PUT("/api/v1/areas/{id}", {
        params: { path: { id: areaId } },
        body,
      }),
    ),

  deleteArea: (areaId: string) =>
    requireApiSuccess(
      apiClient.DELETE("/api/v1/areas/{id}", {
        params: { path: { id: areaId } },
      }),
    ),

  getTicketTypes: (eventId: string) =>
    requireApiSuccess(
      apiClient.GET("/api/v1/events/{eventId}/ticket-types", {
        params: { path: { eventId } },
      }),
    ),

  createTicketType: (
    eventId: string,
    body: {
      eventAreaId: string
      name: string
      description?: string
      status?: "ACTIVE" | "INACTIVE"
    },
  ) =>
    requireApiSuccess(
      apiClient.POST("/api/v1/events/{eventId}/ticket-types", {
        params: { path: { eventId } },
        body,
      }),
    ),

  updateTicketType: (id: string, body: components["schemas"]["TicketTypeRequest"]) =>
    requireApiSuccess(
      apiClient.PUT("/api/v1/ticket-types/{id}", {
        params: { path: { id } },
        body,
      }),
    ),

  deleteTicketType: (id: string) =>
    requireApiSuccess(
      apiClient.DELETE("/api/v1/ticket-types/{id}", {
        params: { path: { id } },
      }),
    ),

  getSalePhases: (eventId: string) =>
    requireApiSuccess(
      apiClient.GET("/api/v1/events/{eventId}/sale-phases", {
        params: { path: { eventId } },
      }),
    ),

  createSalePhase: (
    ticketTypeId: string,
    body: {
      name: string
      price: number
      quantity: number
      saleStartAt: string
      saleEndAt: string
      maxPerOrder?: number
      maxPerUser?: number
    },
  ) =>
    requireApiSuccess(
      apiClient.POST("/api/v1/ticket-types/{ticketTypeId}/sale-phases", {
        params: { path: { ticketTypeId } },
        body,
      }),
    ),

  updateSalePhase: (id: string, body: components["schemas"]["TicketSalePhaseRequest"]) =>
    requireApiSuccess(
      apiClient.PUT("/api/v1/sale-phases/{id}", {
        params: { path: { id } },
        body,
      }),
    ),

  getInventory: (eventId: string) =>
    requireApiSuccess(
      apiClient.GET("/api/v1/events/{eventId}/inventory", {
        params: { path: { eventId } },
      }),
    ),

  getEventTickets: (eventId: string) =>
    requireApiSuccess(
      apiClient.GET("/api/v1/tickets/events/{eventId}", {
        params: { path: { eventId } },
      }),
    ),

  getSeatsByArea: (areaId: string, page = 0) =>
    requireApiSuccess(
      apiClient.GET("/api/v1/areas/{areaId}/seats", {
        params: { path: { areaId }, query: { pageable: { page, size: 1000 } } },
      }),
    ),

  createSingleSeat: (areaId: string, body: components["schemas"]["EventSeatRequest"]) =>
    requireApiSuccess(
      apiClient.POST("/api/v1/areas/{areaId}/seats", {
        params: { path: { areaId } },
        body,
      }),
    ),

  deleteSeat: (id: string) =>
    requireApiSuccess(
      apiClient.DELETE("/api/v1/seats/{id}", {
        params: { path: { id } },
      }),
    ),

  generateSeats: (
    areaId: string,
    body: {
      fromRow: string
      toRow: string
      seatsPerRow: number
    },
  ) =>
    requireApiSuccess(
      apiClient.POST("/api/v1/areas/{areaId}/seats/generate", {
        params: { path: { areaId } },
        body,
      }),
    ),

  deleteAllSeatsInArea: (areaId: string) =>
    requireApiSuccess(
      apiClient.DELETE("/api/v1/areas/{areaId}/seats", {
        params: { path: { areaId } },
      }),
    ),

  createDraftEvent: (body: CreateEventPayload) =>
    requireApiSuccess(
      apiClient.POST("/api/v1/events", {
        body: body as components["schemas"]["CreateEventRequest"],
      }),
    ),

  uploadEventMedia: async (eventId: string, file: File | Blob, type: EventFileType) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    return requireApiSuccess(
      apiClient.POST("/api/v1/events/{eventId}/media", {
        params: { path: { eventId }, query: { type } },
        body: formData,
      }),
    )
  },

  getEventMedia: (eventId: string) =>
    requireApiSuccess(
      apiClient.GET("/api/v1/events/{eventId}/media", {
        params: { path: { eventId } },
      }),
    ),

  updateMediaOrder: (eventId: string, body: components["schemas"]["UpdateMediaOrderRequest"]) =>
    requireApiSuccess(
      apiClient.PUT("/api/v1/events/{eventId}/media/order", {
        params: { path: { eventId } },
        body,
      }),
    ),

  deleteEventMedia: (eventId: string, eventFileId: string) =>
    requireApiSuccess(
      apiClient.DELETE("/api/v1/events/{eventId}/media/{eventFileId}", {
        params: { path: { eventId, eventFileId } },
      }),
    ),

  updateSalePhaseStatus: (id: string, status: SalePhaseStatus) =>
    requireApiSuccess(
      apiClient.PATCH("/api/v1/sale-phases/{id}/status", {
        params: { path: { id } },
        body: { status },
      }),
    ),

  deleteSalePhase: (id: string) =>
    requireApiSuccess(
      apiClient.DELETE("/api/v1/sale-phases/{id}", {
        params: { path: { id } },
      }),
    ),

  getSubmissionReadiness: (id: string) =>
    requireApiSuccess(
      apiClient.GET("/api/v1/events/{id}/submission-readiness", {
        params: { path: { id } },
      }),
    ),
}
