import type { components } from "./schema"

export type AvatarPaths = {
  "/api/v1/auth/me/avatar": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    put: {
      parameters: { query?: never; header?: never; path?: never; cookie?: never }
      requestBody: { content: { "multipart/form-data": FormData } }
      responses: {
        200: {
          headers: { [name: string]: unknown }
          content: { "*/*": components["schemas"]["ApiResponseUserProfileResponse"] }
        }
      }
    }
  }
}
