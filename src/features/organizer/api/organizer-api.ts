import type { FetchOptions } from "openapi-fetch"
import { apiClient } from "@/lib/api/client"
import { requireApiSuccess } from "@/lib/api/result"
import type { paths } from "@/lib/api/schema"
import type { EventSetupPaths } from "@/lib/api/event-setup-contract"

type ApiPaths = paths & EventSetupPaths

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
      status?: "ACTIVE" | "PAUSED" | "CLOSED"
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
}
