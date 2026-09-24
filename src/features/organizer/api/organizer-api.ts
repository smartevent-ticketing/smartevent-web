import type { FetchOptions } from "openapi-fetch"
import { apiClient } from "@/lib/api/client"
import { requireApiSuccess } from "@/lib/api/result"
import type { paths, components } from "@/lib/api/schema"
import type {
  EventSetupPaths,
  EventMediaPaths,
  EventFileType,
  SalePhaseStatus,
  SalePhasePaths,
} from "@/lib/api/event-setup-contract"

type ApiPaths = paths & EventSetupPaths & EventMediaPaths & SalePhasePaths

export const organizerApi = {
  createEventSetup: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/events/setup"]["post"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.POST("/api/v1/events/setup", options)),

  getEvent: (id: string) =>
    requireApiSuccess(
      apiClient.GET("/api/v1/events/{id}", {
        params: { path: { id } },
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
      status?: string
    },
  ) =>
    requireApiSuccess(
      apiClient.POST("/api/v1/events/{eventId}/ticket-types", {
        params: { path: { eventId } },
        body,
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

  getSeatsByArea: (
    areaId: string,
    options?: Omit<FetchOptions<ApiPaths["/api/v1/areas/{areaId}/seats"]["get"]>, "parseAs">,
  ) =>
    requireApiSuccess(
      apiClient.GET("/api/v1/areas/{areaId}/seats", {
        params: { path: { areaId }, query: { pageable: {} } },
        ...options,
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

  createDraftEvent: (body: components["schemas"]["CreateEventRequest"]) =>
    requireApiSuccess(
      apiClient.POST("/api/v1/events", {
        body,
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

  getSubmissionReadiness: (id: string) =>
    requireApiSuccess(
      apiClient.GET("/api/v1/events/{id}/submission-readiness", {
        params: { path: { id } },
      }),
    ),
}
