import type { FetchOptions } from "openapi-fetch"
import { apiClient } from "@/lib/api/client"
import { requireApiSuccess } from "@/lib/api/result"
import type { paths } from "@/lib/api/schema"
import type { EventSetupPaths } from "@/lib/api/event-setup-contract"

type ApiPaths = paths & EventSetupPaths

export const authApi = {
  getProfile: (
    options: Omit<FetchOptions<ApiPaths["/api/v1/auth/me"]["get"]>, "parseAs"> & {
      parseAs?: "json"
    } = {},
  ) => requireApiSuccess(apiClient.GET("/api/v1/auth/me", options)),

  updateAvatar: (file: File) => {
    const body = new FormData()
    body.append("file", file)
    return requireApiSuccess(apiClient.PUT("/api/v1/auth/me/avatar", { body }))
  },

  getAvatarUrl: (fileId: string) =>
    requireApiSuccess(
      apiClient.GET("/api/v1/storage/{fileId}/presigned-url", {
        params: { path: { fileId } },
      }),
    ),
}
