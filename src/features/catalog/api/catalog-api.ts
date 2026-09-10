import type { FetchOptions } from "openapi-fetch"
import { apiClient } from "@/lib/api/client"
import { requireApiSuccess } from "@/lib/api/result"
import type { paths } from "@/lib/api/schema"
import type { EventSetupPaths } from "@/lib/api/event-setup-contract"

type ApiPaths = paths & EventSetupPaths

export const catalogApi = {
  getCategories: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/categories"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    } = {},
  ) => requireApiSuccess(apiClient.GET("/api/v1/categories", options)),

  getVenues: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/venues"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    } = {},
  ) => requireApiSuccess(apiClient.GET("/api/v1/venues", options)),

  getPublishedEvents: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/events"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.GET("/api/v1/events", options)),

  getMyEvents: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/events/my-events"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.GET("/api/v1/events/my-events", options)),

  getEvent: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/events/{id}"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.GET("/api/v1/events/{id}", options)),

  getEventBySlug: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/events/slug/{slug}"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.GET("/api/v1/events/slug/{slug}", options)),

  getAreas: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/events/{eventId}/areas"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.GET("/api/v1/events/{eventId}/areas", options)),

  getTicketTypes: (
    options: Omit<
      FetchOptions<ApiPaths["/api/v1/events/{eventId}/ticket-types"]["get"]>,
      "parseAs"
    > & { parseAs?: "json" },
  ) => requireApiSuccess(apiClient.GET("/api/v1/events/{eventId}/ticket-types", options)),

  getSalePhases: (
    options: Omit<
      FetchOptions<ApiPaths["/api/v1/events/{eventId}/sale-phases"]["get"]>,
      "parseAs"
    > & { parseAs?: "json" },
  ) => requireApiSuccess(apiClient.GET("/api/v1/events/{eventId}/sale-phases", options)),

  getInventory: (
    options: Omit<
      FetchOptions<ApiPaths["/api/v1/events/{eventId}/inventory"]["get"]>,
      "parseAs"
    > & { parseAs?: "json" },
  ) => requireApiSuccess(apiClient.GET("/api/v1/events/{eventId}/inventory", options)),

  getMediaUrl: (
    options: Omit<
      FetchOptions<ApiPaths["/api/v1/storage/{fileId}/presigned-url"]["get"]>,
      "parseAs"
    > & { parseAs?: "json" },
  ) => requireApiSuccess(apiClient.GET("/api/v1/storage/{fileId}/presigned-url", options)),
}
