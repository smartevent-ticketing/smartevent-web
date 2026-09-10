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

  cancelEvent: (id: string) =>
    requireApiSuccess(
      apiClient.POST("/api/v1/events/{id}/cancel", {
        params: { path: { id } },
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
}
