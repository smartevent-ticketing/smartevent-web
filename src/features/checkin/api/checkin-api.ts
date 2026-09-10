import type { FetchOptions } from "openapi-fetch"
import { apiClient } from "@/lib/api/client"
import { requireApiSuccess } from "@/lib/api/result"
import type { paths } from "@/lib/api/schema"
import type { EventSetupPaths } from "@/lib/api/event-setup-contract"

type ApiPaths = paths & EventSetupPaths

export const checkinApi = {
  getHistory: (
    options: Omit<
      FetchOptions<ApiPaths["/api/v1/checkin/events/{eventId}/history"]["get"]>,
      "parseAs"
    > & { parseAs?: "json" },
  ) => requireApiSuccess(apiClient.GET("/api/v1/checkin/events/{eventId}/history", options)),

  scanTicket: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/checkin/scan"]["post"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.POST("/api/v1/checkin/scan", options)),
}
