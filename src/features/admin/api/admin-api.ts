import type { FetchOptions } from "openapi-fetch"
import { apiClient } from "@/lib/api/client"
import { requireApiSuccess } from "@/lib/api/result"
import type { paths } from "@/lib/api/schema"
import type { EventSetupPaths, AdminEventPaths } from "@/lib/api/event-setup-contract"

type ApiPaths = paths & EventSetupPaths & AdminEventPaths

export const adminApi = {
  getPendingEvents: (
    options?: Omit<FetchOptions<ApiPaths["/api/v1/admin/events/pending"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.GET("/api/v1/admin/events/pending", options)),

  getAdminEventDetail: (id: string) =>
    requireApiSuccess(
      apiClient.GET("/api/v1/admin/events/{id}", {
        params: { path: { id } },
      }),
    ),

  approveEvent: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/events/{id}/approve"]["post"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.POST("/api/v1/events/{id}/approve", options)),

  rejectEvent: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/events/{id}/reject"]["post"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.POST("/api/v1/events/{id}/reject", options)),

  createVenue: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/venues"]["post"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.POST("/api/v1/venues", options)),

  deleteVenue: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/venues/{id}"]["delete"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.DELETE("/api/v1/venues/{id}", options)),

  createCategory: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/categories"]["post"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.POST("/api/v1/categories", options)),

  deleteCategory: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/categories/{id}"]["delete"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.DELETE("/api/v1/categories/{id}", options)),

  getFailedOutbox: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/admin/outbox/failed"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    } = {},
  ) => requireApiSuccess(apiClient.GET("/api/v1/admin/outbox/failed", options)),

  getPendingOutbox: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/admin/outbox/pending"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    } = {},
  ) => requireApiSuccess(apiClient.GET("/api/v1/admin/outbox/pending", options)),

  getOutboxStats: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/admin/outbox/stats"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    } = {},
  ) => requireApiSuccess(apiClient.GET("/api/v1/admin/outbox/stats", options)),

  retryOutbox: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/admin/outbox/{id}/retry"]["post"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.POST("/api/v1/admin/outbox/{id}/retry", options)),
}
