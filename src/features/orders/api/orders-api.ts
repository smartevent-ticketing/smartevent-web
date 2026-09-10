import type { FetchOptions } from "openapi-fetch"
import { apiClient } from "@/lib/api/client"
import { requireApiSuccess } from "@/lib/api/result"
import type { paths } from "@/lib/api/schema"
import type { EventSetupPaths } from "@/lib/api/event-setup-contract"

type ApiPaths = paths & EventSetupPaths

export const ordersApi = {
  getOrder: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/orders/{id}"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.GET("/api/v1/orders/{id}", options)),
  createOrder: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/orders"]["post"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.POST("/api/v1/orders", options)),

  getOrderByCode: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/orders/code/{orderCode}"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.GET("/api/v1/orders/code/{orderCode}", options)),

  getMyOrders: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/orders/my-orders"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.GET("/api/v1/orders/my-orders", options)),

  cancelOrder: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/orders/{id}/cancel"]["post"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.POST("/api/v1/orders/{id}/cancel", options)),
}
