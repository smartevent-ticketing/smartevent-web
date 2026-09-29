import type { FetchOptions } from "openapi-fetch"
import { apiClient, type ApiPaths } from "@/lib/api/client"
import { requireApiSuccess } from "@/lib/api/result"
import type { RefundReviewStatus } from "@/lib/api/refund-review-contract"
import type { components } from "@/lib/api/schema"
import type { GrantableRole } from "@/lib/api/admin-users-contract"

export const adminApi = {
  listUsers: (search: string, page: number) =>
    requireApiSuccess(
      apiClient.GET("/api/v1/admin/users", {
        params: { query: { search: search || undefined, page, size: 20 } },
      }),
    ),

  grantUserRole: (userId: string, roleName: GrantableRole) =>
    requireApiSuccess(
      apiClient.POST("/api/v1/admin/users/{userId}/roles", {
        params: { path: { userId } },
        body: { roleName },
      }),
    ),

  listRefundReviews: (status: RefundReviewStatus, page = 0) =>
    requireApiSuccess(
      apiClient.GET("/api/v1/admin/payment-refund-reviews", {
        params: { query: { status, page, size: 20 } },
      }),
    ),

  getRefundReviewHistory: (id: string) =>
    requireApiSuccess(
      apiClient.GET("/api/v1/admin/payment-refund-reviews/{id}/history", {
        params: { path: { id } },
      }),
    ),

  updateRefundReview: (
    id: string,
    body: {
      status: RefundReviewStatus
      note: string
      evidenceReference?: string
    },
  ) =>
    requireApiSuccess(
      apiClient.PATCH("/api/v1/admin/payment-refund-reviews/{id}", {
        params: { path: { id } },
        body,
      }),
    ),

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

  createCategory: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/categories"]["post"]>, "parseAs"> & {
      parseAs?: "json"
    },
  ) => requireApiSuccess(apiClient.POST("/api/v1/categories", options)),

  updateCategory: (id: string, body: components["schemas"]["CategoryRequest"]) =>
    requireApiSuccess(
      apiClient.PUT("/api/v1/categories/{id}", {
        params: { path: { id } },
        body,
      }),
    ),

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
