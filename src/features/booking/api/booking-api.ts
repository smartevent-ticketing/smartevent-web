import type { FetchOptions } from "openapi-fetch"
import { apiClient } from "@/lib/api/client"
import { requireApiSuccess } from "@/lib/api/result"
import type { paths } from "@/lib/api/schema"
import type { EventSetupPaths } from "@/lib/api/event-setup-contract"

type ApiPaths = paths & EventSetupPaths

export const bookingApi = {
  getAvailableSeats: (
    options: Omit<
      FetchOptions<ApiPaths["/api/v1/areas/{areaId}/seats/available"]["get"]>,
      "parseAs"
    > & { parseAs?: "json" },
  ) => requireApiSuccess(apiClient.GET("/api/v1/areas/{areaId}/seats/available", options)),

  getActiveReservation: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/reservations/active"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.GET("/api/v1/reservations/active", options)),

  getReservation: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/reservations/{id}"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.GET("/api/v1/reservations/{id}", options)),

  createReservation: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/reservations"]["post"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.POST("/api/v1/reservations", options)),

  cancelReservation: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/reservations/{id}/cancel"]["post"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.POST("/api/v1/reservations/{id}/cancel", options)),
}
