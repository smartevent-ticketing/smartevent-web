import type { FetchOptions } from "openapi-fetch"
import { apiClient } from "@/lib/api/client"
import { requireApiSuccess } from "@/lib/api/result"
import type { paths } from "@/lib/api/schema"
import type { EventSetupPaths } from "@/lib/api/event-setup-contract"

type ApiPaths = paths & EventSetupPaths

export const accountApi = {
  getMyTickets: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/tickets/my-tickets"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    } = {},
  ) => requireApiSuccess(apiClient.GET("/api/v1/tickets/my-tickets", options)),

  refreshTicketQr: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/tickets/{id}/refresh-qr"]["post"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.POST("/api/v1/tickets/{id}/refresh-qr", options)),

  transferTicket: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/tickets/{id}/transfer"]["post"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.POST("/api/v1/tickets/{id}/transfer", options)),

  getMyInvoices: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/invoices/my-invoices"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    } = {},
  ) => requireApiSuccess(apiClient.GET("/api/v1/invoices/my-invoices", options)),

  getInvoice: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/invoices/{id}"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.GET("/api/v1/invoices/{id}", options)),

  getInvoiceByOrder: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/invoices/order/{orderId}"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.GET("/api/v1/invoices/order/{orderId}", options)),

  getInvoicePdf: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/invoices/{id}/pdf"]["get"]>, "parseAs"> & {
      parseAs?: "blob"
    },
  ) =>
    requireApiSuccess(apiClient.GET("/api/v1/invoices/{id}/pdf", { ...options, parseAs: "blob" })),

  sendInvoice: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/invoices/{id}/send-email"]["post"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.POST("/api/v1/invoices/{id}/send-email", options)),
}
